"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import RequireRole from "@/components/auth/RequireRole"

interface Montadora {
  id: string
  nome: string
  slug: string
  imagemUrl: string | null
  pais: string | null
  ativo: boolean
  _count: {
    modelos: number
  }
}

export default function MontadorasAdminPage() {
  const [montadoras, setMontadoras] = useState<Montadora[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchMontadoras()
  }, [])

  const fetchMontadoras = async () => {
    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : ""
      const res = await fetch(`/api/admin/montadoras${query}`)
      if (!res.ok) throw new Error("Erro ao carregar")
      const data = await res.json()
      setMontadoras(data.montadoras)
    } catch (error) {
      toast.error("Erro ao carregar montadoras")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Deseja realmente excluir a montadora "${nome}"?`)) return

    try {
      const res = await fetch(`/api/admin/montadoras/${id}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao excluir")
      }

      toast.success("Montadora excluída com sucesso!")
      fetchMontadoras()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <RequireRole roles={["ADMIN"]}>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gerenciar Montadoras
              </h1>
              <p className="text-gray-600 mt-1">
                Cadastre e gerencie as montadoras de veículos
              </p>
            </div>
            <Link
              href="/admin/montadoras/nova"
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-red-700 font-semibold"
            >
              + Nova Montadora
            </Link>
          </div>

          {/* Busca */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Buscar por nome ou país..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && fetchMontadoras()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Lista */}
          {loading ? (
            <div className="text-center py-12">Carregando...</div>
          ) : montadoras.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500 text-lg">Nenhuma montadora cadastrada</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {montadoras.map((montadora) => (
                <div
                  key={montadora.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
                >
                  {montadora.imagemUrl && (
                    <img
                      src={montadora.imagemUrl}
                      alt={montadora.nome}
                      className="w-full h-32 object-contain mb-4"
                    />
                  )}
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {montadora.nome}
                  </h3>
                  
                  {montadora.pais && (
                    <p className="text-sm text-gray-600 mb-2">
                      📍 {montadora.pais}
                    </p>
                  )}
                  
                  <p className="text-sm text-gray-600 mb-4">
                    🚗 {montadora._count.modelos} modelo(s)
                  </p>
                  
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 ${
                      montadora.ativo
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {montadora.ativo ? "Ativa" : "Inativa"}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/admin/montadoras/${montadora.id}/editar`}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-center text-sm font-semibold"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(montadora.id, montadora.nome)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-semibold"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RequireRole>
  )
}
