'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import RequireRole from '@/components/auth/RequireRole'

interface Modelo {
  id: string
  nome: string
  slug: string
  tipo: string
  ativo: boolean
  imagemUrl: string | null
  montadora: {
    id: string
    nome: string
    imagemUrl: string | null
  }
  _count: {
    aplicacoes: number
  }
}

export default function ModelosPage() {
  const router = useRouter()
  const [modelos, setModelos] = useState<Modelo[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [montadoraFilter, setMontadoraFilter] = useState('')
  const [montadoras, setMontadoras] = useState<{ id: string; nome: string }[]>([])

  useEffect(() => {
    loadMontadoras()
    loadModelos()
  }, [])

  const loadMontadoras = async () => {
    try {
      const response = await fetch('/api/admin/montadoras?limit=1000')
      if (response.ok) {
        const data = await response.json()
        setMontadoras(data.montadoras || [])
      }
    } catch (error) {
      console.error('Erro ao carregar montadoras:', error)
    }
  }

  const loadModelos = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (montadoraFilter) params.set('montadoraId', montadoraFilter)
      
      const response = await fetch(`/api/admin/modelos?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar modelos')
      }

      const data = await response.json()
      setModelos(data.modelos || [])
    } catch (error) {
      console.error('Erro ao carregar modelos:', error)
      toast.error('Erro ao carregar modelos')
      setModelos([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadModelos()
  }

  const handleDelete = async (id: string, nome: string) => {
    const modelo = modelos.find(m => m.id === id)
    
    if (modelo && modelo._count.aplicacoes > 0) {
      toast.error(`Não é possível excluir. Este modelo possui ${modelo._count.aplicacoes} aplicações vinculadas.`)
      return
    }

    if (!confirm(`Tem certeza que deseja excluir o modelo "${nome}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/modelos/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao excluir modelo')
      }

      toast.success('Modelo excluído com sucesso!')
      loadModelos()
    } catch (error) {
      console.error('Erro ao excluir modelo:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir modelo')
    }
  }

  return (
    <RequireRole roles={['ADMIN']}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Modelos de Veículos</h1>
          <button
            onClick={() => router.push('/admin/modelos/novo')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo Modelo
          </button>
        </div>

        {/* Filtros */}
        <form onSubmit={handleSearch} className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Buscar</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nome do modelo..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Montadora</label>
              <select
                value={montadoraFilter}
                onChange={(e) => setMontadoraFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
              >
                <option value="">Todas as montadoras</option>
                {montadoras.map(montadora => (
                  <option key={montadora.id} value={montadora.id}>
                    {montadora.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Buscar
            </button>
            {(search || montadoraFilter) && (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setMontadoraFilter('')
                  setTimeout(loadModelos, 100)
                }}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Limpar
              </button>
            )}
          </div>
        </form>

        {/* Lista de Modelos */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : modelos.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400">Nenhum modelo encontrado</p>
            <button
              onClick={() => router.push('/admin/modelos/novo')}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Cadastrar primeiro modelo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modelos.map((modelo) => (
              <div
                key={modelo.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Imagem */}
                <div className="h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  {modelo.imagemUrl ? (
                    <img
                      src={modelo.imagemUrl}
                      alt={modelo.nome}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  )}
                </div>

                {/* Conteúdo */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg">{modelo.nome}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      modelo.ativo 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {modelo.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  {/* Montadora */}
                  <div className="flex items-center gap-2 mb-2">
                    {modelo.montadora.imagemUrl ? (
                      <img
                        src={modelo.montadora.imagemUrl}
                        alt={modelo.montadora.nome}
                        className="w-6 h-6 object-contain"
                      />
                    ) : null}
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {modelo.montadora.nome}
                    </span>
                  </div>

                  {/* Tipo */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Tipo: {modelo.tipo}
                  </p>

                  {/* Aplicações */}
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                    {modelo._count.aplicacoes} aplicação(ões)
                  </p>

                  {/* Ações */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/admin/modelos/${modelo.id}/editar`)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(modelo.id, modelo.nome)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      title={modelo._count.aplicacoes > 0 ? 'Não é possível excluir modelo com aplicações' : 'Excluir modelo'}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RequireRole>
  )
}
