// Service Worker PWA - Portal Klaus Drift Brasil
// v3.0.0 - Com Push Notifications, Background Sync e Share Target

const CACHE_VERSION = '3.0.0'
const CACHE_NAME = `klaus-drift-v${CACHE_VERSION}`
const RUNTIME_CACHE = `runtime-v${CACHE_VERSION}`
const IMAGE_CACHE = `images-v${CACHE_VERSION}`
const API_CACHE = `api-v${CACHE_VERSION}`
const STATIC_CACHE = `static-v${CACHE_VERSION}`
const OFFLINE_PAGE = '/offline.html'

// URLs para pré-cache (shell da aplicação)
const PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/logo-drift-brasil.png'
]

// Estratégias de cache
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
}

// Rotas e suas estratégias
const ROUTE_STRATEGIES = {
  // Imagens: Cache first com fallback
  images: { pattern: /\.(png|jpg|jpeg|svg|gif|webp|ico)$/i, strategy: CACHE_STRATEGIES.CACHE_FIRST, cache: IMAGE_CACHE },
  
  // Assets estáticos: Cache first
  static: { pattern: /\.(css|js|woff|woff2|ttf|eot)$/i, strategy: CACHE_STRATEGIES.CACHE_FIRST, cache: STATIC_CACHE },
  
  // API: Network first com cache fallback
  api: { pattern: /^https?:.*\/api\/.*$/i, strategy: CACHE_STRATEGIES.NETWORK_FIRST, cache: API_CACHE, timeout: 5000 },
  
  // Páginas: Stale while revalidate
  pages: { pattern: /^https?:.*\/(cursos|pecas|forum|noticias).*$/i, strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE, cache: RUNTIME_CACHE }
}

// ==================== INSTALAÇÃO ====================

self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker v' + CACHE_VERSION)
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching app shell')
        return cache.addAll(PRECACHE_URLS)
      })
      .then(() => self.skipWaiting())
  )
})

// ==================== ATIVAÇÃO ====================

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker v' + CACHE_VERSION)
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Remover caches antigos
          if (cacheName.startsWith('klaus-drift-') && !cacheName.includes(CACHE_VERSION)) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
    .then(() => self.clients.claim())
  )
})

// ==================== FETCH - ESTRATÉGIAS DE CACHE ====================

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Ignorar requisições não-GET
  if (request.method !== 'GET') {
    return
  }

  // Ignorar requisições de outros domínios (exceto API)
  if (url.origin !== location.origin && !url.pathname.startsWith('/api')) {
    return
  }

  // Determinar estratégia baseada na URL
  let strategy = CACHE_STRATEGIES.NETWORK_FIRST
  let cacheName = RUNTIME_CACHE

  for (const [key, config] of Object.entries(ROUTE_STRATEGIES)) {
    if (config.pattern.test(request.url)) {
      strategy = config.strategy
      cacheName = config.cache
      break
    }
  }

  // Aplicar estratégia
  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      event.respondWith(cacheFirst(request, cacheName))
      break
    
    case CACHE_STRATEGIES.NETWORK_FIRST:
      event.respondWith(networkFirst(request, cacheName))
      break
    
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      event.respondWith(staleWhileRevalidate(request, cacheName))
      break
    
    case CACHE_STRATEGIES.NETWORK_ONLY:
      event.respondWith(fetch(request))
      break
    
    case CACHE_STRATEGIES.CACHE_ONLY:
      event.respondWith(caches.match(request))
      break
    
    default:
      event.respondWith(networkFirst(request, cacheName))
  }
})

// ==================== ESTRATÉGIAS ====================

// Cache First: Tenta o cache primeiro, depois a rede
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  
  if (cached) {
    return cached
  }
  
  try {
    const response = await fetch(request)
    
    if (response && response.status === 200) {
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    console.error('[SW] Cache First error:', error)
    return caches.match(OFFLINE_PAGE)
  }
}

// Network First: Tenta a rede primeiro, depois o cache
async function networkFirst(request, cacheName, timeout = 3000) {
  const cache = await caches.open(cacheName)
  
  try {
    const response = await fetchWithTimeout(request, timeout)
    
    if (response && response.status === 200) {
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    console.log('[SW] Network First fallback to cache')
    const cached = await cache.match(request)
    
    if (cached) {
      return cached
    }
    
    // Se é uma página HTML, retornar offline page
    if (request.headers.get('accept').includes('text/html')) {
      return caches.match(OFFLINE_PAGE)
    }
    
    throw error
  }
}

// Stale While Revalidate: Retorna cache mas atualiza em background
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  
  const fetchPromise = fetch(request).then((response) => {
    if (response && response.status === 200) {
      cache.put(request, response.clone())
    }
    return response
  })
  
  return cached || fetchPromise
}

// Fetch com timeout
function fetchWithTimeout(request, timeout) {
  return Promise.race([
    fetch(request),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Fetch timeout')), timeout)
    )
  ])
}

// ==================== BACKGROUND SYNC ====================

self.addEventListener('sync', (event) => {
  console.log('[SW] Background Sync:', event.tag)
  
  if (event.tag === 'sync-analytics') {
    event.waitUntil(syncAnalytics())
  }
  
  if (event.tag === 'sync-progress') {
    event.waitUntil(syncProgress())
  }
  
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications())
  }
})

async function syncAnalytics() {
  try {
    const db = await openIndexedDB()
    const pendingEvents = await db.getAll('analytics')
    
    if (pendingEvents.length > 0) {
      await fetch('/api/analytics/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: pendingEvents })
      })
      
      await db.clear('analytics')
      console.log('[SW] Analytics synced:', pendingEvents.length, 'events')
    }
  } catch (error) {
    console.error('[SW] Analytics sync failed:', error)
  }
}

async function syncProgress() {
  try {
    const db = await openIndexedDB()
    const pendingProgress = await db.getAll('progress')
    
    for (const item of pendingProgress) {
      await fetch(`/api/courses/${item.courseId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data)
      })
      
      await db.delete('progress', item.id)
    }
    
    console.log('[SW] Progress synced')
  } catch (error) {
    console.error('[SW] Progress sync failed:', error)
  }
}

async function syncNotifications() {
  try {
    const response = await fetch('/api/notifications/unread')
    const data = await response.json()
    
    if (data.count > 0) {
      self.registration.showNotification('Klaus Drift', {
        body: `Você tem ${data.count} notificações não lidas`,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'notifications',
        requireInteraction: false,
        data: { url: '/notificacoes' }
      })
    }
  } catch (error) {
    console.error('[SW] Notifications sync failed:', error)
  }
}

// ==================== PUSH NOTIFICATIONS ====================

self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received')
  
  let data = { title: 'Klaus Drift', body: 'Nova notificação' }
  
  if (event.data) {
    try {
      data = event.data.json()
    } catch (e) {
      data.body = event.data.text()
    }
  }
  
  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    image: data.image,
    vibrate: [200, 100, 200],
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [
      { action: 'open', title: 'Abrir' },
      { action: 'close', title: 'Fechar' }
    ],
    data: data.data || {}
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Cliques em notificações
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action)
  
  event.notification.close()
  
  if (event.action === 'close') {
    return
  }
  
  const urlToOpen = event.notification.data?.url || '/'
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncloned: true })
      .then((clientList) => {
        // Se já existe uma janela aberta, focar nela
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus()
          }
        }
        
        // Senão, abrir nova janela
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})

// ==================== SHARE TARGET API ====================

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  
  if (url.pathname === '/share' && event.request.method === 'POST') {
    event.respondWith(handleShareTarget(event.request))
  }
})

async function handleShareTarget(request) {
  const formData = await request.formData()
  const title = formData.get('title')
  const text = formData.get('text')
  const url = formData.get('url')
  const files = formData.getAll('media')
  
  // Salvar dados compartilhados no IndexedDB
  const db = await openIndexedDB()
  await db.add('shared-content', {
    title,
    text,
    url,
    files: files.map(f => f.name),
    timestamp: Date.now()
  })
  
  // Redirecionar para página de compartilhamento
  return Response.redirect('/share-handler', 303)
}

// ==================== INDEXEDDB HELPER ====================

async function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('KlausDriftDB', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(wrapDB(request.result))
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      
      if (!db.objectStoreNames.contains('analytics')) {
        db.createObjectStore('analytics', { keyPath: 'id', autoIncrement: true })
      }
      
      if (!db.objectStoreNames.contains('progress')) {
        db.createObjectStore('progress', { keyPath: 'id', autoIncrement: true })
      }
      
      if (!db.objectStoreNames.contains('shared-content')) {
        db.createObjectStore('shared-content', { keyPath: 'id', autoIncrement: true })
      }
    }
  })
}

function wrapDB(db) {
  return {
    getAll(storeName) {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly')
        const store = transaction.objectStore(storeName)
        const request = store.getAll()
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
    },
    
    add(storeName, data) {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite')
        const store = transaction.objectStore(storeName)
        const request = store.add(data)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
    },
    
    delete(storeName, key) {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite')
        const store = transaction.objectStore(storeName)
        const request = store.delete(key)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    },
    
    clear(storeName) {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite')
        const store = transaction.objectStore(storeName)
        const request = store.clear()
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    }
  }
}

// ==================== MENSAGENS DO CLIENTE ====================

self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data)
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        )
      })
    )
  }
  
  if (event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(event.data.urls)
      })
    )
  }
})

console.log('[SW] Service Worker v' + CACHE_VERSION + ' loaded')
