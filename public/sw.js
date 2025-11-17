// Service Worker - Portal Klaus Drift Brasil
// Performance e Cache Offline

const CACHE_NAME = 'klaus-drift-v2.0.0';
const API_CACHE_NAME = 'klaus-drift-api-v2.0.0';
const STATIC_CACHE_NAME = 'klaus-drift-static-v2.0.0';

// Recursos para cache estático
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/logo.png',
  '/offline.html',
  // CSS e JS serão adicionados automaticamente pelo Next.js
];

// Rotas de API para cache
const API_ROUTES = [
  '/api/courses',
  '/api/products',
  '/api/categories',
  '/api/user/profile',
  '/api/analytics'
];

// Estratégias de cache
const CACHE_STRATEGIES = {
  // Cache First - Para recursos estáticos
  cacheFirst: async (request) => {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    
    return response;
  },

  // Network First - Para dados dinâmicos
  networkFirst: async (request) => {
    const cache = await caches.open(API_CACHE_NAME);
    
    try {
      const response = await fetch(request);
      if (response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      const cached = await cache.match(request);
      if (cached) {
        return cached;
      }
      throw error;
    }
  },

  // Stale While Revalidate - Para conteúdo frequente
  staleWhileRevalidate: async (request) => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    
    const fetchPromise = fetch(request).then(response => {
      if (response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    });
    
    return cached || fetchPromise;
  }
};

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Klaus Drift SW: Instalando...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('📦 Klaus Drift SW: Cache estático criado');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Klaus Drift SW: Instalação completa');
        return self.skipWaiting();
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Klaus Drift SW: Ativando...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (
              cacheName !== CACHE_NAME &&
              cacheName !== API_CACHE_NAME &&
              cacheName !== STATIC_CACHE_NAME
            ) {
              console.log('🗑️ Klaus Drift SW: Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Klaus Drift SW: Ativação completa');
        return self.clients.claim();
      })
  );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Ignorar requisições não-GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Ignorar requisições de extensões
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Rotas de API - Network First
    if (url.pathname.startsWith('/api/')) {
      return await CACHE_STRATEGIES.networkFirst(request);
    }
    
    // Recursos estáticos - Cache First
    if (
      url.pathname.includes('.') || // Arquivos com extensão
      STATIC_ASSETS.includes(url.pathname)
    ) {
      return await CACHE_STRATEGIES.cacheFirst(request);
    }
    
    // Páginas - Stale While Revalidate
    return await CACHE_STRATEGIES.staleWhileRevalidate(request);
    
  } catch (error) {
    console.error('❌ Klaus Drift SW: Erro na requisição:', error);
    
    // Página offline de fallback
    if (request.destination === 'document') {
      const cache = await caches.open(STATIC_CACHE_NAME);
      const offline = await cache.match('/offline.html');
      return offline || new Response('Offline', { status: 503 });
    }
    
    return new Response('Network Error', { status: 503 });
  }
}

// Background Sync para operações offline
self.addEventListener('sync', (event) => {
  console.log('🔄 Klaus Drift SW: Background Sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('🔄 Klaus Drift SW: Executando sincronização...');
  
  try {
    // Sincronizar dados pendentes
    const pendingData = await getStoredData('pending-sync');
    
    if (pendingData && pendingData.length > 0) {
      for (const item of pendingData) {
        await syncDataItem(item);
      }
      
      await clearStoredData('pending-sync');
      console.log('✅ Klaus Drift SW: Sincronização completa');
    }
  } catch (error) {
    console.error('❌ Klaus Drift SW: Erro na sincronização:', error);
  }
}

// Notificações Push
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  console.log('📱 Klaus Drift SW: Push recebido:', data);
  
  const options = {
    body: data.message,
    icon: '/logo.png',
    badge: '/logo.png',
    tag: 'klaus-drift-notification',
    data: data.action,
    actions: [
      {
        action: 'open',
        title: 'Abrir Portal'
      },
      {
        action: 'close',
        title: 'Fechar'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Clique em notificações
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Klaus Drift SW: Notificação clicada:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});

// Utilitários para IndexedDB
async function getStoredData(key) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('klaus-drift-db', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['sync-data'], 'readonly');
      const store = transaction.objectStore('sync-data');
      const getRequest = store.get(key);
      
      getRequest.onsuccess = () => {
        resolve(getRequest.result?.data || []);
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    };
    
    request.onerror = () => reject(request.error);
  });
}

async function clearStoredData(key) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('klaus-drift-db', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['sync-data'], 'readwrite');
      const store = transaction.objectStore('sync-data');
      const deleteRequest = store.delete(key);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
    
    request.onerror = () => reject(request.error);
  });
}

async function syncDataItem(item) {
  try {
    const response = await fetch(item.url, {
      method: item.method,
      headers: item.headers,
      body: item.body
    });
    
    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status}`);
    }
    
    console.log('✅ Klaus Drift SW: Item sincronizado:', item.id);
  } catch (error) {
    console.error('❌ Klaus Drift SW: Falha na sincronização:', error);
    throw error;
  }
}

// Log de performance
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PERFORMANCE_LOG') {
    console.log('📊 Klaus Drift SW: Performance:', event.data.metrics);
  }
});

console.log('🎯 Klaus Drift Service Worker v2.0.0 carregado');