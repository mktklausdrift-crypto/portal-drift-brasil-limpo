'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import RequireRole from '@/components/auth/RequireRole'
import ImageUploader from '@/components/upload/ImageUploader'

export default function NovaMontadoraPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    pais: '',
    imagemUrl: '',
    ativo: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/admin/montadoras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar montadora')
      }

      toast.success('Montadora criada com sucesso!')
      router.push('/admin/montadoras')
    } catch (error) {
      console.error('Erro ao criar montadora:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao criar montadora')
    } finally {
      setLoading(false)
    }
  }

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
            <h1 className="text-3xl font-bold">Nova Montadora</h1>
          </div>

          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
            {/* Nome */}
            <div>
              <label htmlFor="nome" className="block text-sm font-medium mb-2">
                Nome da Montadora *
              </label>
              <input
                type="text"
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                placeholder="Ex: Volkswagen, Toyota, Honda..."
                required
              />
            </div>

            {/* País */}
            <div>
              <label htmlFor="pais" className="block text-sm font-medium mb-2">
                País de Origem
              </label>
              <input
                type="text"
                id="pais"
                value={formData.pais}
                onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                placeholder="Ex: Alemanha, Japão, Brasil..."
              />
            </div>

            {/* Imagem */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Logo da Montadora
              </label>
              <ImageUploader
                onUploadComplete={(url) => setFormData({ ...formData, imagemUrl: url })}
                currentImage={formData.imagemUrl}
                folder="montadoras"
                recommendedSize="Logo horizontal com fundo transparente - ideal 800x400px"
              />
              {formData.imagemUrl && (
                <div className="mt-4">
                  <img
                    src={formData.imagemUrl}
                    alt="Preview"
                    className="w-32 h-32 object-contain border border-gray-300 dark:border-gray-600 rounded-lg"
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
                Montadora ativa (visível no catálogo público)
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
                {loading ? 'Salvando...' : 'Criar Montadora'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </RequireRole>
  )
}
