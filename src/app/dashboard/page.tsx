"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

interface DashboardData {
  cursosInscritos: number
  cursosCompletos: number
  aulasConcluidas: number
  totalAulas: number
  pontosTotal: number
  nivel: number
  posicaoRanking: number
  conquistas: number
  proximasAulas: Array<{
    id: string
    titulo: string
    cursoNome: string
    modulo: string
    progresso: number
  }>
  conquistasRecentes: Array<{
    id: string
    titulo: string
    descricao: string
    icone: string
    desbloqueadaEm: string
  }>
  cursosFavoritos: Array<{
    id: string
    titulo: string
    progresso: number
    ultimaAula: string
  }>
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated") {
      fetchDashboardData()
    }
  }, [status, router])

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/dashboard")
      if (!res.ok) throw new Error("Erro ao carregar dashboard")
      
      const data = await res.json()
      setDashboardData(data)
    } catch (error) {
      toast.error("Erro ao carregar dados do dashboard")
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seu dashboard...</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Erro ao carregar dados</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-red-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  const progressoGeral = dashboardData.totalAulas > 0 
    ? Math.round((dashboardData.aulasConcluidas / dashboardData.totalAulas) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Olá, {session?.user?.name || "Estudante"}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Bem-vindo ao seu painel de estudos do Portal Drift Brasil
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">Nível {dashboardData.nivel}</div>
              <div className="text-sm text-gray-600">{dashboardData.pontosTotal} pontos</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Estatísticas principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Cursos Inscritos</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardData.cursosInscritos}</p>
              </div>
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Progresso Geral</p>
                <p className="text-3xl font-bold text-gray-900">{progressoGeral}%</p>
              </div>
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Conquistas</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardData.conquistas}</p>
              </div>
              <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Ranking</p>
                <p className="text-3xl font-bold text-gray-900">#{dashboardData.posicaoRanking}</p>
              </div>
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center">
                <span className="text-2xl">🥇</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Próximas Aulas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                🎯 Próximas Aulas
              </h3>
              <p className="text-gray-600 text-sm mt-1">Continue de onde parou</p>
            </div>
            <div className="p-6">
              {dashboardData.proximasAulas.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhuma aula pendente</p>
                  <Link href="/cursos" className="text-primary hover:underline">
                    Explorar cursos disponíveis
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData.proximasAulas.map((aula) => (
                    <div key={aula.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{aula.titulo}</h4>
                          <p className="text-sm text-gray-600">{aula.cursoNome} • {aula.modulo}</p>
                          <div className="mt-2">
                            <div className="bg-gray-200 rounded-full h-2 w-full">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{ width: `${aula.progresso}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{aula.progresso}% completo</p>
                          </div>
                        </div>
                        <Link 
                          href={`/cursos/${aula.id}`}
                          className="ml-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-red-700 text-sm font-semibold"
                        >
                          Continuar
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Conquistas Recentes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                🏆 Conquistas Recentes
              </h3>
              <p className="text-gray-600 text-sm mt-1">Seus últimos desbloqueios</p>
            </div>
            <div className="p-6">
              {dashboardData.conquistasRecentes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhuma conquista ainda</p>
                  <p className="text-sm text-gray-400">Complete aulas para desbloquear conquistas!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData.conquistasRecentes.map((conquista) => (
                    <div key={conquista.id} className="flex items-center gap-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                      <div className="text-3xl">{conquista.icone}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{conquista.titulo}</h4>
                        <p className="text-sm text-gray-600">{conquista.descricao}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(conquista.desbloqueadaEm).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">🚀 Ações Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              href="/cursos"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <span className="text-2xl">📚</span>
              <div>
                <p className="font-semibold text-gray-900">Explorar Cursos</p>
                <p className="text-sm text-gray-600">Descubra novos conteúdos</p>
              </div>
            </Link>

            <Link 
              href="/catalogo"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <span className="text-2xl">🔧</span>
              <div>
                <p className="font-semibold text-gray-900">Catálogo de Peças</p>
                <p className="text-sm text-gray-600">Consultar produtos Klaus</p>
              </div>
            </Link>

            <Link 
              href="/ranking"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <span className="text-2xl">🏆</span>
              <div>
                <p className="font-semibold text-gray-900">Ver Ranking</p>
                <p className="text-sm text-gray-600">Compare seu progresso</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}