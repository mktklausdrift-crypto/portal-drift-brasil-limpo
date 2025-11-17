"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Plus, Edit, Trash2, Users, Clock, Star } from "lucide-react"
import RequireRole from "@/components/auth/RequireRole"

interface Quiz {
  id: string
  titulo: string
  descricao: string
  categoria: string
  dificuldade: string
  tempo: number
  pontos: number
  ativo: boolean
  createdAt: string
  _count: {
    questoes: number
    tentativas: number
  }
}

export default function QuizzesAdminPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchQuizzes()
  }, [page])

  const fetchQuizzes = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/quizzes?page=${page}&limit=10`, {
        credentials: 'include',
        cache: 'no-store'
      })
      const data = await response.json()
      
      if (response.ok) {
        setQuizzes(data.quizzes || [])
        setTotalPages(data.pagination?.totalPages || 1)
      } else {
        console.error('Erro na resposta:', data)
      }
    } catch (error) {
      console.error('Erro ao carregar quizzes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este quiz?')) return

    try {
      const response = await fetch(`/api/admin/quizzes/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        await fetchQuizzes()
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error || 'Erro ao excluir quiz'}`)
      }
    } catch (error) {
      console.error('Erro ao excluir quiz:', error)
      alert('Erro ao excluir quiz')
    }
  }

  const toggleAtivo = async (id: string, ativo: boolean) => {
    try {
      const response = await fetch(`/api/admin/quizzes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ativo: !ativo })
      })

      if (response.ok) {
        await fetchQuizzes()
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error || 'Erro ao atualizar status'}`)
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      alert('Erro ao atualizar status')
    }
  }

  const getDificuldadeColor = (dificuldade: string) => {
    switch (dificuldade) {
      case 'facil': return 'bg-green-100 text-green-800'
      case 'intermediario': return 'bg-yellow-100 text-yellow-800'
      case 'dificil': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDificuldadeLabel = (dificuldade: string) => {
    switch (dificuldade) {
      case 'facil': return 'Fácil'
      case 'intermediario': return 'Intermediário'
      case 'dificil': return 'Difícil'
      default: return dificuldade
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <RequireRole roles={['ADMIN', 'INSTRUCTOR']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciar Quizzes</h1>
            <p className="text-gray-600">Crie e gerencie quizzes para os cursos</p>
          </div>
          <Link
            href="/admin/quizzes/novo"
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Novo Quiz
          </Link>
        </div>

        {/* Lista de Quizzes */}
        {quizzes.length === 0 ? (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Nenhum quiz cadastrado
            </h3>
            <p className="text-gray-500 mb-6">
              Crie seu primeiro quiz para começar a avaliar o conhecimento dos alunos
            </p>
            <Link
              href="/admin/quizzes/novo"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Criar Primeiro Quiz
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {quizzes.map((quiz, index) => (
              <motion.div
                key={quiz.id}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {quiz.titulo}
                      </h3>
                      
                      {/* Status Badge */}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        quiz.ativo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {quiz.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                      
                      {/* Dificuldade Badge */}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDificuldadeColor(quiz.dificuldade)}`}>
                        {getDificuldadeLabel(quiz.dificuldade)}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {quiz.descricao}
                    </p>

                    {/* Estatísticas */}
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <span className="text-lg">❓</span>
                        <span>{quiz._count.questoes} questões</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{quiz._count.tentativas} tentativas</span>
                      </div>
                      
                      {quiz.tempo && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{quiz.tempo} min</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        <span>{quiz.pontos} pts</span>
                      </div>
                      
                      {quiz.categoria && (
                        <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {quiz.categoria}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => toggleAtivo(quiz.id, quiz.ativo)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        quiz.ativo
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {quiz.ativo ? 'Desativar' : 'Ativar'}
                    </button>
                    
                    <Link
                      href={`/admin/quizzes/${quiz.id}/questoes`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Gerenciar Questões"
                    >
                      <span className="text-sm">📝</span>
                    </Link>
                    
                    <Link
                      href={`/admin/quizzes/${quiz.id}/editar`}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      title="Editar Quiz"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    
                    <button
                      onClick={() => handleDelete(quiz.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir Quiz"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  page === pageNum
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border'
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>
        )}
      </div>
    </RequireRole>
  )
}