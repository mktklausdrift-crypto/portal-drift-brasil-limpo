'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface InscricaoButtonProps {
  cursoId: string
  cursoTitulo: string
  className?: string
  disabled?: boolean
}

interface StatusInscricao {
  inscrito: boolean
  concluido: boolean
  progresso: number
  dataInscricao: string | null
  dataConclusao: string | null
}

export default function InscricaoButton({ 
  cursoId, 
  cursoTitulo,
  className = '',
  disabled = false 
}: InscricaoButtonProps) {
  const { data: session } = useSession()
  const [statusInscricao, setStatusInscricao] = useState<StatusInscricao>({
    inscrito: false,
    concluido: false,
    progresso: 0,
    dataInscricao: null,
    dataConclusao: null
  })
  const [loading, setLoading] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)

  // Verificar status da inscrição
  useEffect(() => {
    if (session?.user?.id) {
      verificarStatusInscricao()
    } else {
      setCheckingStatus(false)
    }
  }, [session, cursoId])

  const verificarStatusInscricao = async () => {
    try {
      const response = await fetch(`/api/inscricoes/${cursoId}`)
      const data = await response.json()
      setStatusInscricao({
        inscrito: data.inscrito || false,
        concluido: data.concluido || false,
        progresso: data.progresso || 0,
        dataInscricao: data.dataInscricao || null,
        dataConclusao: data.dataConclusao || null
      })
    } catch (error) {
      console.error('Erro ao verificar status:', error)
    } finally {
      setCheckingStatus(false)
    }
  }

  const handleInscrever = async () => {
    if (!session?.user?.id) {
      toast.error('Faça login para se inscrever')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/inscricoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cursoId })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || 'Inscrição realizada com sucesso!')
        setStatusInscricao({
          inscrito: true,
            concluido: false,
            progresso: 0,
            dataInscricao: new Date().toISOString(),
            dataConclusao: null
        })
      } else {
        toast.error(data.error || 'Erro ao realizar inscrição')
      }
    } catch (error) {
      console.error('Erro na inscrição:', error)
      toast.error('Erro interno. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelar = async () => {
    if (!confirm('Tem certeza que deseja cancelar sua inscrição?')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/inscricoes/${cursoId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || 'Inscrição cancelada')
        setStatusInscricao({
          inscrito: false,
          concluido: false,
          progresso: 0,
          dataInscricao: null,
          dataConclusao: null
        })
      } else {
        toast.error(data.error || 'Erro ao cancelar inscrição')
      }
    } catch (error) {
      console.error('Erro ao cancelar:', error)
      toast.error('Erro interno. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (checkingStatus) {
    return (
      <div className={`${className}`}>
        <div className="bg-gray-100 text-gray-500 px-6 py-3 rounded-lg animate-pulse">
          Verificando status...
        </div>
      </div>
    )
  }

  // Usuário não logado
  if (!session?.user?.id) {
    return (
      <div className={`${className}`}>
        <Link
          href="/auth/signin"
          className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-block text-center"
        >
          Faça login para se inscrever
        </Link>
      </div>
    )
  }

  // Usuário já inscrito
  if (statusInscricao.inscrito) {
    if (statusInscricao.concluido) {
      return (
        <div className={`flex flex-col gap-3 ${className}`}>
          <div className="bg-green-100 text-green-800 px-6 py-3 rounded-lg font-semibold text-center">
            ✅ Curso Concluído ({statusInscricao.progresso}%)
          </div>
          <Link
            href={`/cursos/${cursoId}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors text-center"
          >
            Revisar Conteúdo
          </Link>
        </div>
      )
    }

    if (!statusInscricao.concluido) {
      return (
        <div className={`flex flex-col gap-3 ${className}`}>
          <div className="bg-blue-100 text-blue-800 px-6 py-3 rounded-lg font-semibold text-center">
            📚 Inscrito - Progresso: {statusInscricao.progresso}%
          </div>
          <div className="flex gap-2">
            <Link
              href={`/cursos/${cursoId}`}
              className="flex-1 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-center"
            >
              Continuar Estudos
            </Link>
            <button
              onClick={handleCancelar}
              disabled={loading}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
              title="Cancelar inscrição"
            >
              {loading ? '...' : '❌'}
            </button>
          </div>
        </div>
      )
    }
  }

  // Botão de inscrição
  return (
    <div className={`${className}`}>
      <button
        onClick={handleInscrever}
        disabled={loading || disabled}
        className="w-full bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Inscrevendo...' : '📝 Inscrever-se Agora'}
      </button>
    </div>
  )
}