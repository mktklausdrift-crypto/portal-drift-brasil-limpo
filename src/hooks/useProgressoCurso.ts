'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface ProgressoAula {
  concluida: boolean
  tempoAssistido: number
  completadaEm: Date | null
}

interface UseProgressoCursoReturn {
  progressos: Record<string, ProgressoAula>
  progressoCurso: number
  carregando: boolean
  atualizarProgresso: (aulaId: string, concluida: boolean, progressoCurso: number) => void
  recarregarProgressos: () => Promise<void>
}

export function useProgressoCurso(cursoId: string): UseProgressoCursoReturn {
  const { data: session } = useSession()
  const [progressos, setProgressos] = useState<Record<string, ProgressoAula>>({})
  const [progressoCurso, setProgressoCurso] = useState(0)
  const [carregando, setCarregando] = useState(true)

  // Carregar progressos iniciais
  const carregarProgressos = async () => {
    if (!session?.user?.id || !cursoId) {
      setCarregando(false)
      return
    }

    try {
      const response = await fetch(`/api/progresso/aulas?cursoId=${cursoId}`)
      
      if (response.ok) {
        const data = await response.json()
        setProgressos(data.progressos || {})
        
        // Calcular progresso baseado nos dados carregados
        const aulasComProgresso = Object.values(data.progressos || {})
        const aulasConcluidas = aulasComProgresso.filter((p: any) => p.concluida).length
        const totalAulas = aulasComProgresso.length
        
        if (totalAulas > 0) {
          setProgressoCurso(Math.round((aulasConcluidas / totalAulas) * 100))
        }
      }
    } catch (error) {
      console.error('Erro ao carregar progressos:', error)
    } finally {
      setCarregando(false)
    }
  }

  // Recarregar progressos (função pública)
  const recarregarProgressos = async () => {
    setCarregando(true)
    await carregarProgressos()
  }

  // Atualizar progresso local (otimista)
  const atualizarProgresso = (aulaId: string, concluida: boolean, novoProgressoCurso: number) => {
    setProgressos(prev => ({
      ...prev,
      [aulaId]: {
        concluida,
        tempoAssistido: prev[aulaId]?.tempoAssistido || 0,
        completadaEm: concluida ? new Date() : null
      }
    }))
    
    setProgressoCurso(novoProgressoCurso)
  }

  // Verificar se aula está concluída
  const aulaEstaConcluida = (aulaId: string): boolean => {
    return progressos[aulaId]?.concluida || false
  }

  // Calcular progresso de um módulo
  const calcularProgressoModulo = (aulasDoModulo: string[]): number => {
    if (aulasDoModulo.length === 0) return 0
    
    const aulasConcluidas = aulasDoModulo.filter(aulaId => 
      progressos[aulaId]?.concluida
    ).length
    
    return Math.round((aulasConcluidas / aulasDoModulo.length) * 100)
  }

  // Carregar progressos quando componente monta ou sessão/curso muda
  useEffect(() => {
    carregarProgressos()
  }, [session, cursoId])

  return {
    progressos,
    progressoCurso,
    carregando,
    atualizarProgresso,
    recarregarProgressos
  }
}

// Hook para estatísticas de progresso
export function useEstatisticasProgresso(cursoId: string) {
  const { progressos, progressoCurso } = useProgressoCurso(cursoId)

  const estatisticas = {
    totalAulas: Object.keys(progressos).length,
    aulasConcluidas: Object.values(progressos).filter(p => p.concluida).length,
    tempoTotalAssistido: Object.values(progressos).reduce((acc, p) => acc + p.tempoAssistido, 0),
    percentualConclusao: progressoCurso,
    proximaAula: Object.keys(progressos).find(aulaId => !progressos[aulaId].concluida) || null
  }

  return {
    ...estatisticas,
    cursoCompleto: estatisticas.percentualConclusao >= 100,
    tempoMedio: estatisticas.aulasConcluidas > 0 
      ? Math.round(estatisticas.tempoTotalAssistido / estatisticas.aulasConcluidas) 
      : 0
  }
}