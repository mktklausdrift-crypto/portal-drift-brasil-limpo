'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

interface ProgressoAulaProps {
  aulaId: string
  cursoId: string
  moduloId: string
  concluida?: boolean
  onProgressoChange?: (aulaId: string, concluida: boolean, progressoCurso: number) => void
  className?: string
}

export default function ProgressoAulaButton({ 
  aulaId, 
  cursoId, 
  moduloId,
  concluida = false,
  onProgressoChange,
  className = ''
}: ProgressoAulaProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [aulaConcluida, setAulaConcluida] = useState(concluida)

  const handleToggleProgresso = async () => {
    if (!session?.user?.id) {
      toast.error('Faça login para salvar progresso')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/progresso/aulas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aulaId,
          cursoId,
          moduloId,
          concluida: !aulaConcluida
        })
      })

      const data = await response.json()

      if (response.ok) {
        const novoConcluida = !aulaConcluida
        setAulaConcluida(novoConcluida)
        
        if (novoConcluida) {
          toast.success('Aula marcada como concluída! 🎉')
        } else {
          toast.success('Progresso atualizado')
        }

        // Notificar componente pai sobre mudança
        if (onProgressoChange) {
          onProgressoChange(aulaId, novoConcluida, data.progressoCurso)
        }

        // Se curso foi concluído (100%)
        if (data.progressoCurso >= 100 && novoConcluida) {
          toast.success('🏆 Parabéns! Curso concluído!', {
            duration: 5000
          })
        }
      } else {
        toast.error(data.error || 'Erro ao atualizar progresso')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro interno. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (!session?.user?.id) {
    return null // Não mostrar para usuários não logados
  }

  return (
    <button
      onClick={handleToggleProgresso}
      disabled={loading}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium
        ${aulaConcluida 
          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      title={aulaConcluida ? 'Marcar como não concluída' : 'Marcar como concluída'}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Salvando...</span>
        </>
      ) : (
        <>
          <span className="text-lg">
            {aulaConcluida ? '✅' : '⭕'}
          </span>
          <span>
            {aulaConcluida ? 'Concluída' : 'Marcar como concluída'}
          </span>
        </>
      )}
    </button>
  )
}

// Componente para exibir progresso do curso
interface ProgressoCursoProps {
  progresso: number
  className?: string
}

export function ProgressoCurso({ progresso, className = '' }: ProgressoCursoProps) {
  return (
    <div className={`${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">Progresso do Curso</span>
        <span className="text-sm text-gray-500">{progresso}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className={`h-3 rounded-full transition-all duration-500 ${
            progresso === 100 
              ? 'bg-green-500' 
              : progresso >= 50 
                ? 'bg-blue-500' 
                : 'bg-yellow-500'
          }`}
          style={{ width: `${Math.min(progresso, 100)}%` }}
        />
      </div>
      {progresso === 100 && (
        <div className="flex items-center gap-2 mt-2 text-green-600 text-sm font-medium">
          <span>🏆</span>
          <span>Curso concluído!</span>
        </div>
      )}
    </div>
  )
}