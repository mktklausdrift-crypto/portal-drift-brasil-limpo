"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, X, Check, CheckCheck } from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"

interface Notificacao {
  id: string
  titulo: string
  mensagem: string
  tipo: 'SUCCESS' | 'INFO' | 'WARNING' | 'ERROR' | 'CONQUISTA'
  lida: boolean
  link?: string
  createdAt: string
}

interface NotificacoesData {
  notificacoes: Notificacao[]
  totalNaoLidas: number
  hasMore: boolean
}

export function NotificacaoDropdown() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [data, setData] = useState<NotificacoesData>({
    notificacoes: [],
    totalNaoLidas: 0,
    hasMore: false
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session && isOpen) {
      fetchNotificacoes()
    }
  }, [session, isOpen])

  const fetchNotificacoes = async () => {
    if (!session) return

    try {
      setLoading(true)
      const response = await fetch('/api/notificacoes?limit=10')
      const result = await response.json()
      
      if (response.ok) {
        setData(result)
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
    } finally {
      setLoading(false)
    }
  }

  const marcarComoLida = async (notificacaoId: string) => {
    try {
      const response = await fetch('/api/notificacoes/marcar-lida', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificacaoId })
      })

      if (response.ok) {
        setData(prev => ({
          ...prev,
          notificacoes: prev.notificacoes.map(n => 
            n.id === notificacaoId ? { ...n, lida: true } : n
          ),
          totalNaoLidas: Math.max(0, prev.totalNaoLidas - 1)
        }))
      }
    } catch (error) {
      console.error('Erro ao marcar como lida:', error)
    }
  }

  const marcarTodasComoLidas = async () => {
    try {
      const response = await fetch('/api/notificacoes/marcar-lida', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ todasLidas: true })
      })

      if (response.ok) {
        setData(prev => ({
          ...prev,
          notificacoes: prev.notificacoes.map(n => ({ ...n, lida: true })),
          totalNaoLidas: 0
        }))
      }
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
    }
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'SUCCESS': return '✅'
      case 'WARNING': return '⚠️'
      case 'ERROR': return '❌'
      case 'CONQUISTA': return '🏆'
      default: return 'ℹ️'
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'SUCCESS': return 'text-green-600'
      case 'WARNING': return 'text-yellow-600'
      case 'ERROR': return 'text-red-600'
      case 'CONQUISTA': return 'text-purple-600'
      default: return 'text-blue-600'
    }
  }

  if (!session) return null

  return (
    <div className="relative">
      {/* Botão de Notificações */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {data.totalNaoLidas > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {data.totalNaoLidas > 9 ? '9+' : data.totalNaoLidas}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown Content */}
            <motion.div
              className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Notificações</h3>
                  <div className="flex items-center gap-2">
                    {data.totalNaoLidas > 0 && (
                      <button
                        onClick={marcarTodasComoLidas}
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <CheckCheck className="w-3 h-3" />
                        Marcar todas
                      </button>
                    )}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Conteúdo */}
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : data.notificacoes.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>Nenhuma notificação</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {data.notificacoes.map((notificacao, index) => (
                      <motion.div
                        key={notificacao.id}
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                          !notificacao.lida ? 'bg-blue-50' : ''
                        }`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-lg flex-shrink-0">
                            {getTipoIcon(notificacao.tipo)}
                          </span>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h4 className={`text-sm font-medium ${getTipoColor(notificacao.tipo)}`}>
                                {notificacao.titulo}
                              </h4>
                              {!notificacao.lida && (
                                <button
                                  onClick={() => marcarComoLida(notificacao.id)}
                                  className="p-1 text-gray-400 hover:text-green-600 flex-shrink-0"
                                  title="Marcar como lida"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {notificacao.mensagem}
                            </p>
                            
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-400">
                                {new Date(notificacao.createdAt).toLocaleString('pt-BR')}
                              </span>
                              
                              {notificacao.link && (
                                <Link
                                  href={notificacao.link}
                                  onClick={() => setIsOpen(false)}
                                  className="text-xs text-blue-600 hover:text-blue-800"
                                >
                                  Ver mais →
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {data.notificacoes.length > 0 && (
                <div className="p-3 border-t border-gray-200">
                  <Link
                    href="/notificacoes"
                    onClick={() => setIsOpen(false)}
                    className="block text-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    Ver todas as notificações
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}