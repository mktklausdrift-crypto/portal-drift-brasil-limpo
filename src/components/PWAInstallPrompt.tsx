"use client"

import { useEffect, useState } from 'react'
import { X, Download, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Detectar iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(iOS)

    // Detectar se já está em modo standalone
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as any).standalone ||
                      document.referrer.includes('android-app://')
    setIsStandalone(standalone)

    // Verificar se o usuário já dispensou o prompt antes
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    const dismissedDate = dismissed ? parseInt(dismissed) : 0
    const daysSinceDismissed = (Date.now() - dismissedDate) / (1000 * 60 * 60 * 24)

    // Só mostrar se não está em standalone, não foi dispensado recentemente (7 dias)
    if (!standalone && daysSinceDismissed > 7) {
      if (iOS) {
        // Para iOS, mostrar instruções após 3 segundos
        const timer = setTimeout(() => setShowPrompt(true), 3000)
        return () => clearTimeout(timer)
      }
    }

    // Listener para o evento de instalação (Chrome, Edge, etc)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Mostrar prompt após 5 segundos
      setTimeout(() => setShowPrompt(true), 5000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    // Mostrar o prompt de instalação
    await deferredPrompt.prompt()

    // Aguardar escolha do usuário
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('PWA instalado com sucesso')
    }

    // Limpar o prompt
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
    setShowPrompt(false)
  }

  // Não mostrar se já está instalado
  if (isStandalone) return null

  // Não mostrar se usuário dispensou
  if (!showPrompt) return null

  // Prompt para iOS
  if (isIOS) {
    return (
      <div 
        className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-2xl animate-slide-up"
        role="dialog"
        aria-labelledby="pwa-install-title"
        aria-describedby="pwa-install-description"
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-4">
            <Smartphone className="h-8 w-8 flex-shrink-0 mt-1" aria-hidden="true" />
            
            <div className="flex-1">
              <h3 id="pwa-install-title" className="font-bold text-lg mb-2">
                Instale o App Drift Brasil
              </h3>
              <p id="pwa-install-description" className="text-sm text-blue-100 mb-3">
                Para instalar este app no seu iPhone:
              </p>
              <ol className="text-sm text-blue-100 space-y-1 list-decimal list-inside">
                <li>Toque no botão <strong>Compartilhar</strong> (ícone de quadrado com seta)</li>
                <li>Role e toque em <strong>"Adicionar à Tela de Início"</strong></li>
                <li>Toque em <strong>Adicionar</strong></li>
              </ol>
            </div>

            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-2 hover:bg-white/20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
              aria-label="Fechar prompt de instalação"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Prompt para Chrome/Edge/Android
  return (
    <div 
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-6 animate-slide-up"
      role="dialog"
      aria-labelledby="pwa-install-title"
      aria-describedby="pwa-install-description"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Download className="h-6 w-6 text-white" aria-hidden="true" />
        </div>
        
        <div className="flex-1">
          <h3 
            id="pwa-install-title"
            className="font-bold text-lg text-gray-900 dark:text-white mb-1"
          >
            Instale o App Drift Brasil
          </h3>
          <p 
            id="pwa-install-description"
            className="text-sm text-gray-600 dark:text-gray-300 mb-4"
          >
            Acesse rapidamente cursos, catálogo e fórum direto da sua tela inicial. 
            Funciona offline!
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleInstall}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Instalar aplicativo"
            >
              Instalar
            </button>
            
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              aria-label="Dispensar prompt"
            >
              Agora não
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

// Hook para registrar o Service Worker
export function usePWA() {
  const [isOnline, setIsOnline] = useState(true)
  const [needsUpdate, setNeedsUpdate] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw-pwa.js')
        .then((reg) => {
          console.log('Service Worker registrado:', reg.scope)
          setRegistration(reg)

          // Verificar atualizações
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing
            
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setNeedsUpdate(true)
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error('Erro ao registrar Service Worker:', error)
        })
    }

    // Monitorar status online/offline
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const updateServiceWorker = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }

  return {
    isOnline,
    needsUpdate,
    updateServiceWorker,
    registration
  }
}
