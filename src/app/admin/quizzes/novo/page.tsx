"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"
import RequireRole from "@/components/auth/RequireRole"

export default function NovoQuizPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    categoria: '',
    dificuldade: 'intermediario',
    tempo: '',
    pontos: 10,
    ativo: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          tempo: formData.tempo ? parseInt(formData.tempo) : null
        })
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/admin/quizzes/${data.id}/questoes`)
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error || 'Erro ao criar quiz'}`)
      }
    } catch (error) {
      console.error('Erro ao criar quiz:', error)
      alert('Erro ao criar quiz')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  return (
    <RequireRole roles={['ADMIN', 'INSTRUCTOR']}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin/quizzes"
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Criar Novo Quiz</h1>
            <p className="text-gray-600">Preencha as informações básicas do quiz</p>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Título */}
          <div>
            <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-2">
              Título do Quiz *
            </label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Ex: Conhecimentos Básicos de Mecânica"
            />
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Descreva o objetivo e conteúdo do quiz"
            />
          </div>

          {/* Categoria e Dificuldade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <input
                type="text"
                id="categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Ex: Mecânica, Elétrica, Geral"
              />
            </div>

            <div>
              <label htmlFor="dificuldade" className="block text-sm font-medium text-gray-700 mb-2">
                Dificuldade *
              </label>
              <select
                id="dificuldade"
                name="dificuldade"
                value={formData.dificuldade}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="facil">Fácil</option>
                <option value="intermediario">Intermediário</option>
                <option value="dificil">Difícil</option>
              </select>
            </div>
          </div>

          {/* Tempo e Pontos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="tempo" className="block text-sm font-medium text-gray-700 mb-2">
                Tempo Limite (minutos)
              </label>
              <input
                type="number"
                id="tempo"
                name="tempo"
                value={formData.tempo}
                onChange={handleChange}
                min="1"
                max="180"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Ex: 30"
              />
              <p className="text-xs text-gray-500 mt-1">
                Deixe vazio para quiz sem limite de tempo
              </p>
            </div>

            <div>
              <label htmlFor="pontos" className="block text-sm font-medium text-gray-700 mb-2">
                Pontos por Acerto *
              </label>
              <input
                type="number"
                id="pontos"
                name="pontos"
                value={formData.pontos}
                onChange={handleChange}
                min="1"
                max="100"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Ativo */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="ativo"
              name="ativo"
              checked={formData.ativo}
              onChange={handleChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="ativo" className="ml-2 block text-sm text-gray-900">
              Quiz ativo (visível para os alunos)
            </label>
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-3 pt-6">
            <Link
              href="/admin/quizzes"
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Criando...' : 'Criar Quiz'}
            </button>
          </div>
        </form>

        {/* Informações */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Próximos Passos</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Após criar o quiz, você será redirecionado para adicionar questões</li>
            <li>• Você pode criar questões de múltipla escolha, verdadeiro/falso ou texto livre</li>
            <li>• O quiz só ficará visível para os alunos depois que tiver pelo menos uma questão</li>
          </ul>
        </div>
      </div>
    </RequireRole>
  )
}