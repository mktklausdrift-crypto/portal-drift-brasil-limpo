"use client"

import { useEffect, useState } from 'react'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      setShowNotification(true)
      
      // Ocultar notificação após 3 segundos
      setTimeout(() => setShowNotification(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowNotification(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!showNotification) return null

  return (
    <div
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-lg animate-slide-down"
      style={{
        background: isOnline 
          ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
          : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
      }}
      role="status"
      aria-live="polite"
      aria-label={isOnline ? 'Conexão restaurada' : 'Sem conexão com a internet'}
    >
      <div className="flex items-center gap-3 text-white">
        {isOnline ? (
          <>
            <Wifi className="h-5 w-5" aria-hidden="true" />
            <span className="font-semibold">Conexão restaurada</span>
          </>
        ) : (
          <>
            <WifiOff className="h-5 w-5" aria-hidden="true" />
            <span className="font-semibold">Você está offline</span>
          </>
        )}
      </div>
    </div>
  )
}

export function UpdateAvailableNotification() {
  const [showUpdate, setShowUpdate] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg)

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing

          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setShowUpdate(true)
              }
            })
          }
        })
      })
    }
  }, [])

  const handleUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }

  if (!showUpdate) return null

  return (
    <div
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4 max-w-md animate-slide-up"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
          <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
        </div>

        <div className="flex-1">
          <h4 className="font-bold text-gray-900 dark:text-white mb-1">
            Nova versão disponível
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            Uma atualização do Portal Drift Brasil está pronta para ser instalada.
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Atualizar agora
            </button>
            
            <button
              onClick={() => setShowUpdate(false)}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Depois
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
