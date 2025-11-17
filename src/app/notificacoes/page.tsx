"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Bell, Check, CheckCheck, Trash2, Filter } from "lucide-react"
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

export default function NotificacoesPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<NotificacoesData>({
    notificacoes: [],
    totalNaoLidas: 0,
    hasMore: false
  })
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<'todas' | 'nao-lidas'>('todas')
  const [offset, setOffset] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    if (session) {
      fetchNotificacoes(true)
    }
  }, [session, filtro])

  const fetchNotificacoes = async (reset = false) => {
    if (!session) return

    try {
      if (reset) {
        setLoading(true)
        setOffset(0)
      } else {
        setLoadingMore(true)
      }

      const currentOffset = reset ? 0 : offset
      const url = `/api/notificacoes?limit=20&offset=${currentOffset}${
        filtro === 'nao-lidas' ? '&nao_lidas=true' : ''
      }`
      
      const response = await fetch(url)
      const result = await response.json()
      
      if (response.ok) {
        setData(prev => ({
          ...result,
          notificacoes: reset 
            ? result.notificacoes 
            : [...prev.notificacoes, ...result.notificacoes]
        }))
        
        if (!reset) {
          setOffset(prev => prev + 20)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
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
      case 'SUCCESS': return 'text-green-600 bg-green-50 border-green-200'
      case 'WARNING': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'ERROR': return 'text-red-600 bg-red-50 border-red-200'
      case 'CONQUISTA': return 'text-purple-600 bg-purple-50 border-purple-200'
      default: return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Faça login para ver suas notificações
          </h1>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Bell className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900">Notificações</h1>
          </div>
          <p className="text-gray-600">
            Acompanhe todas as suas notificações e atualizações
          </p>
        </motion.div>

        {/* Controles */}
        <motion.div
          className="bg-white rounded-lg shadow-sm p-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Filtros */}
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-gray-500" />
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setFiltro('todas')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    filtro === 'todas'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Todas ({data.notificacoes.length})
                </button>
                <button
                  onClick={() => setFiltro('nao-lidas')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    filtro === 'nao-lidas'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Não lidas ({data.totalNaoLidas})
                </button>
              </div>
            </div>

            {/* Ações */}
            {data.totalNaoLidas > 0 && (
              <button
                onClick={marcarTodasComoLidas}
                className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm"
              >
                <CheckCheck className="w-4 h-4" />
                Marcar todas como lidas
              </button>
            )}
          </div>
        </motion.div>

        {/* Lista de Notificações */}
        {data.notificacoes.length === 0 ? (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {filtro === 'nao-lidas' ? 'Nenhuma notificação não lida' : 'Nenhuma notificação'}
            </h3>
            <p className="text-gray-500">
              {filtro === 'nao-lidas' 
                ? 'Todas as suas notificações foram lidas!'
                : 'Você ainda não possui notificações.'
              }
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {data.notificacoes.map((notificacao, index) => (
              <motion.div
                key={notificacao.id}
                className={`bg-white rounded-lg shadow-sm border-l-4 p-6 ${
                  !notificacao.lida ? 'ring-2 ring-blue-100' : ''
                } ${getTipoColor(notificacao.tipo)}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl flex-shrink-0">
                    {getTipoIcon(notificacao.tipo)}
                  </span>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {notificacao.titulo}
                      </h3>
                      
                      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                        {!notificacao.lida && (
                          <button
                            onClick={() => marcarComoLida(notificacao.id)}
                            className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                            title="Marcar como lida"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {notificacao.mensagem}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {new Date(notificacao.createdAt).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      
                      {notificacao.link && (
                        <Link
                          href={notificacao.link}
                          className="inline-flex items-center gap-1 text-primary hover:text-primary/80 font-medium text-sm"
                        >
                          Ver detalhes
                          <span>→</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Carregar mais */}
            {data.hasMore && (
              <motion.div
                className="text-center pt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <button
                  onClick={() => fetchNotificacoes(false)}
                  disabled={loadingMore}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {loadingMore ? 'Carregando...' : 'Carregar mais notificações'}
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
