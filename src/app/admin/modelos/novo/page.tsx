'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import RequireRole from '@/components/auth/RequireRole'
import ImageUploader from '@/components/upload/ImageUploader'

interface Montadora {
  id: string
  nome: string
  imagemUrl: string | null
}

export default function NovoModeloPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [montadoras, setMontadoras] = useState<Montadora[]>([])
  const [formData, setFormData] = useState({
    nome: '',
    montadoraId: '',
    tipo: 'Carro',
    imagemUrl: '',
    ativo: true
  })

  useEffect(() => {
    loadMontadoras()
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
      toast.error('Erro ao carregar montadoras')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    if (!formData.montadoraId) {
      toast.error('Selecione uma montadora')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/admin/modelos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar modelo')
      }

      toast.success('Modelo criado com sucesso!')
      router.push('/admin/modelos')
    } catch (error) {
      console.error('Erro ao criar modelo:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao criar modelo')
    } finally {
      setLoading(false)
    }
  }

  const tiposVeiculo = [
    'Carro',
    'Moto',
    'Caminhão',
    'Ônibus',
    'Van',
    'Pickup',
    'SUV',
    'Outro'
  ]

  return (
    <RequireRole roles={['ADMIN']}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-3xl font-bold">Novo Modelo de Veículo</h1>
          </div>

          {montadoras.length === 0 ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
              <div className="flex gap-3">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                    Nenhuma montadora cadastrada
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
                    Você precisa cadastrar pelo menos uma montadora antes de criar modelos.
                  </p>
                  <button
                    onClick={() => router.push('/admin/montadoras/nova')}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                  >
                    Cadastrar Montadora
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
              {/* Montadora */}
              <div>
                <label htmlFor="montadoraId" className="block text-sm font-medium mb-2">
                  Montadora *
                </label>
                <select
                  id="montadoraId"
                  value={formData.montadoraId}
                  onChange={(e) => setFormData({ ...formData, montadoraId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  required
                >
                  <option value="">Selecione uma montadora</option>
                  {montadoras.map((montadora) => (
                    <option key={montadora.id} value={montadora.id}>
                      {montadora.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nome */}
              <div>
                <label htmlFor="nome" className="block text-sm font-medium mb-2">
                  Nome do Modelo *
                </label>
                <input
                  type="text"
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  placeholder="Ex: Gol, Civic, CB 500..."
                  required
                />
              </div>

              {/* Tipo */}
              <div>
                <label htmlFor="tipo" className="block text-sm font-medium mb-2">
                  Tipo de Veículo *
                </label>
                <select
                  id="tipo"
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  required
                >
                  {tiposVeiculo.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
              </div>

              {/* Imagem */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Imagem do Modelo
                </label>
                <ImageUploader
                  onUploadComplete={(url) => setFormData({ ...formData, imagemUrl: url })}
                  currentImage={formData.imagemUrl}
                  folder="modelos"
                  recommendedSize="Imagem horizontal 16:9 - ideal 1600x900px"
                />
                {formData.imagemUrl && (
                  <div className="mt-4">
                    <img
                      src={formData.imagemUrl}
                      alt="Preview"
                      className="w-full max-w-md h-48 object-cover border border-gray-300 dark:border-gray-600 rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* Status Ativo */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="ativo" className="text-sm font-medium cursor-pointer">
                  Modelo ativo (visível no catálogo público)
                </label>
              </div>

              {/* Botões */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Salvando...' : 'Criar Modelo'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </RequireRole>
  )
}
