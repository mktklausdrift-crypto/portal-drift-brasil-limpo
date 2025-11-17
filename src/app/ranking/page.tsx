"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

interface RankingUser {
  id: string
  name: string | null
  image: string | null
  pontosTotal: number
  nivel: number
  posicao: number
  cursosCompletos: number
  conquistasTotal: number
  isCurrentUser?: boolean
}

interface RankingData {
  topUsuarios: RankingUser[]
  usuarioAtual: RankingUser | null
  totalUsuarios: number
  minhaPosicao: number
}

export default function RankingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [rankingData, setRankingData] = useState<RankingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<"geral" | "mensal" | "semanal">("geral")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated") {
      fetchRanking()
    }
  }, [status, router, filtro])

  const fetchRanking = async () => {
    try {
      const res = await fetch(`/api/ranking?periodo=${filtro}`)
      if (!res.ok) throw new Error("Erro ao carregar ranking")
      
      const data = await res.json()
      setRankingData(data)
    } catch (error) {
      toast.error("Erro ao carregar ranking")
    } finally {
      setLoading(false)
    }
  }

  const getMedalha = (posicao: number) => {
    switch (posicao) {
      case 1: return "🥇"
      case 2: return "🥈"
      case 3: return "🥉"
      default: return `#${posicao}`
    }
  }

  const getNivelCor = (nivel: number) => {
    if (nivel >= 20) return "text-purple-600 bg-purple-100"
    if (nivel >= 15) return "text-blue-600 bg-blue-100"
    if (nivel >= 10) return "text-green-600 bg-green-100"
    if (nivel >= 5) return "text-yellow-600 bg-yellow-100"
    return "text-gray-600 bg-gray-100"
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando ranking...</p>
        </div>
      </div>
    )
  }

  if (!rankingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Erro ao carregar ranking</p>
          <button 
            onClick={fetchRanking}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-red-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">🏆 Ranking Portal Drift</h1>
            <p className="text-xl opacity-90">
              Veja quem são os melhores estudantes da comunidade Drift Brasil
            </p>
            <div className="mt-6 flex items-center justify-center gap-4">
              <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
                📊 {rankingData.totalUsuarios} participantes
              </span>
              {rankingData.usuarioAtual && (
                <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
                  Sua posição: #{rankingData.minhaPosicao}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="mb-8 flex justify-center">
          <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            {[
              { key: "geral", label: "Geral", icon: "🏆" },
              { key: "mensal", label: "Este Mês", icon: "📅" },
              { key: "semanal", label: "Esta Semana", icon: "⚡" }
            ].map((opcao) => (
              <button
                key={opcao.key}
                onClick={() => setFiltro(opcao.key as any)}
                className={`px-6 py-2 rounded-md font-semibold transition ${
                  filtro === opcao.key
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {opcao.icon} {opcao.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pódio (Top 3) */}
        {rankingData.topUsuarios.length >= 3 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
              🏆 Pódio dos Campeões
            </h2>
            <div className="flex items-end justify-center gap-4 max-w-4xl mx-auto">
              {/* 2º Lugar */}
              <div className="text-center">
                <div className="bg-gradient-to-b from-gray-300 to-gray-400 rounded-t-lg p-6 min-h-[120px] flex flex-col justify-end">
                  {rankingData.topUsuarios[1]?.image ? (
                    <img 
                      src={rankingData.topUsuarios[1].image} 
                      alt={rankingData.topUsuarios[1].name || ""}
                      className="w-16 h-16 rounded-full mx-auto mb-2 border-4 border-white"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full mx-auto mb-2 border-4 border-white bg-gray-500 flex items-center justify-center text-white font-bold text-xl">
                      {(rankingData.topUsuarios[1]?.name || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="text-4xl mb-2">🥈</div>
                  <div className="text-white font-bold">{rankingData.topUsuarios[1]?.name || "Usuário"}</div>
                  <div className="text-gray-100 text-sm">{rankingData.topUsuarios[1]?.pontosTotal} pts</div>
                </div>
                <div className="bg-gray-400 text-white py-2 rounded-b-lg font-bold">2º Lugar</div>
              </div>

              {/* 1º Lugar */}
              <div className="text-center">
                <div className="bg-gradient-to-b from-yellow-300 to-yellow-500 rounded-t-lg p-8 min-h-[150px] flex flex-col justify-end">
                  {rankingData.topUsuarios[0]?.image ? (
                    <img 
                      src={rankingData.topUsuarios[0].image} 
                      alt={rankingData.topUsuarios[0].name || ""}
                      className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-white"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-white bg-yellow-600 flex items-center justify-center text-white font-bold text-2xl">
                      {(rankingData.topUsuarios[0]?.name || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="text-5xl mb-3">🥇</div>
                  <div className="text-white font-bold text-lg">{rankingData.topUsuarios[0]?.name || "Usuário"}</div>
                  <div className="text-yellow-100">{rankingData.topUsuarios[0]?.pontosTotal} pts</div>
                </div>
                <div className="bg-yellow-500 text-white py-3 rounded-b-lg font-bold text-lg">🏆 CAMPEÃO</div>
              </div>

              {/* 3º Lugar */}
              <div className="text-center">
                <div className="bg-gradient-to-b from-orange-300 to-orange-500 rounded-t-lg p-6 min-h-[120px] flex flex-col justify-end">
                  {rankingData.topUsuarios[2]?.image ? (
                    <img 
                      src={rankingData.topUsuarios[2].image} 
                      alt={rankingData.topUsuarios[2].name || ""}
                      className="w-16 h-16 rounded-full mx-auto mb-2 border-4 border-white"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full mx-auto mb-2 border-4 border-white bg-orange-600 flex items-center justify-center text-white font-bold text-xl">
                      {(rankingData.topUsuarios[2]?.name || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="text-4xl mb-2">🥉</div>
                  <div className="text-white font-bold">{rankingData.topUsuarios[2]?.name || "Usuário"}</div>
                  <div className="text-orange-100 text-sm">{rankingData.topUsuarios[2]?.pontosTotal} pts</div>
                </div>
                <div className="bg-orange-500 text-white py-2 rounded-b-lg font-bold">3º Lugar</div>
              </div>
            </div>
          </div>
        )}

        {/* Ranking Completo */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900">📊 Ranking Completo</h3>
            <p className="text-gray-600 mt-1">Posições de todos os participantes</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Posição</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Usuário</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nível</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Pontos</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Cursos</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Conquistas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rankingData.topUsuarios.map((usuario) => (
                  <tr 
                    key={usuario.id} 
                    className={`hover:bg-gray-50 transition ${
                      usuario.isCurrentUser ? "bg-blue-50 border-l-4 border-blue-500" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getMedalha(usuario.posicao)}</span>
                        {usuario.isCurrentUser && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-semibold">
                            Você
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {usuario.image ? (
                          <img 
                            src={usuario.image} 
                            alt={usuario.name || ""}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                            {(usuario.name || "U").charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-gray-900">
                            {usuario.name || "Usuário"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getNivelCor(usuario.nivel)}`}>
                        Nível {usuario.nivel}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-lg text-gray-900">{usuario.pontosTotal}</div>
                      <div className="text-sm text-gray-500">pontos</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{usuario.cursosCompletos}</div>
                      <div className="text-sm text-gray-500">completos</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{usuario.conquistasTotal}</div>
                      <div className="text-sm text-gray-500">🏆 conquistas</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 bg-gradient-to-r from-primary to-red-600 rounded-xl text-white p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">🚀 Suba no Ranking!</h3>
          <p className="text-lg opacity-90 mb-6">
            Complete mais cursos, participe de quizzes e ganhe pontos para subir na classificação
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="/cursos" 
              className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              📚 Ver Cursos
            </a>
            <a 
              href="/dashboard" 
              className="bg-white bg-opacity-20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-30 transition"
            >
              📊 Meu Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}