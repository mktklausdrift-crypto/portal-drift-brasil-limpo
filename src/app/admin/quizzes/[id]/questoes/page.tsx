"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2, Edit, Save } from "lucide-react"
import RequireRole from "@/components/auth/RequireRole"

interface Opcao {
  id?: string
  texto: string
  correta: boolean
  ordem: number
}

interface Questao {
  id: string
  pergunta: string
  tipo: string
  ordem: number
  pontos: number
  opcoes: Opcao[]
}

interface Quiz {
  id: string
  titulo: string
  _count?: {
    questoes: number
  }
}

export default function QuestoesQuizPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questoes, setQuestoes] = useState<Questao[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    pergunta: '',
    tipo: 'MULTIPLA_ESCOLHA',
    pontos: 1,
    opcoes: [
      { texto: '', correta: false, ordem: 0 },
      { texto: '', correta: false, ordem: 1 },
      { texto: '', correta: false, ordem: 2 },
      { texto: '', correta: false, ordem: 3 }
    ]
  })

  useEffect(() => {
    loadQuiz()
    loadQuestoes()
  }, [quizId])

  const loadQuiz = async () => {
    try {
      const res = await fetch(`/api/admin/quizzes/${quizId}`, {
        credentials: 'include',
        cache: 'no-store'
      })
      if (res.ok) {
        const data = await res.json()
        setQuiz(data)
      }
    } catch (error) {
      console.error('Erro ao carregar quiz:', error)
    }
  }

  const loadQuestoes = async () => {
    try {
      const res = await fetch(`/api/admin/quizzes/${quizId}/questoes`, {
        credentials: 'include',
        cache: 'no-store'
      })
      if (res.ok) {
        const data = await res.json()
        setQuestoes(data)
      }
    } catch (error) {
      console.error('Erro ao carregar questões:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Validar que há pelo menos uma resposta correta
      const temRespostaCorreta = formData.opcoes.some(opt => opt.correta)
      if (formData.tipo === 'MULTIPLA_ESCOLHA' && !temRespostaCorreta) {
        alert('Marque pelo menos uma opção como correta')
        setSubmitting(false)
        return
      }

      // Validar que todas as opções têm texto
      const opcoesPreenchidas = formData.opcoes.filter(opt => opt.texto.trim())
      if (formData.tipo === 'MULTIPLA_ESCOLHA' && opcoesPreenchidas.length < 2) {
        alert('Preencha pelo menos 2 opções')
        setSubmitting(false)
        return
      }

      const response = await fetch(`/api/admin/quizzes/${quizId}/questoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          ordem: questoes.length,
          opcoes: opcoesPreenchidas
        })
      })

      if (response.ok) {
        // Limpar formulário
        setFormData({
          pergunta: '',
          tipo: 'MULTIPLA_ESCOLHA',
          pontos: 1,
          opcoes: [
            { texto: '', correta: false, ordem: 0 },
            { texto: '', correta: false, ordem: 1 },
            { texto: '', correta: false, ordem: 2 },
            { texto: '', correta: false, ordem: 3 }
          ]
        })
        setShowForm(false)
        await loadQuestoes()
        await loadQuiz()
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error || 'Erro ao criar questão'}`)
      }
    } catch (error) {
      console.error('Erro ao criar questão:', error)
      alert('Erro ao criar questão')
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpcaoChange = (index: number, field: 'texto' | 'correta', value: string | boolean) => {
    const novasOpcoes = [...formData.opcoes]
    novasOpcoes[index] = {
      ...novasOpcoes[index],
      [field]: value
    }
    setFormData(prev => ({ ...prev, opcoes: novasOpcoes }))
  }

  const adicionarOpcao = () => {
    setFormData(prev => ({
      ...prev,
      opcoes: [
        ...prev.opcoes,
        { texto: '', correta: false, ordem: prev.opcoes.length }
      ]
    }))
  }

  const removerOpcao = (index: number) => {
    if (formData.opcoes.length <= 2) {
      alert('Mantenha pelo menos 2 opções')
      return
    }
    const novasOpcoes = formData.opcoes.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, opcoes: novasOpcoes }))
  }

  if (loading) {
    return (
      <RequireRole roles={['ADMIN', 'INSTRUCTOR']}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
      </RequireRole>
    )
  }

  return (
    <RequireRole roles={['ADMIN', 'INSTRUCTOR']}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/quizzes"
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {quiz?.titulo || 'Quiz'}
              </h1>
              <p className="text-gray-600">
                {questoes.length} {questoes.length === 1 ? 'questão' : 'questões'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova Questão
          </button>
        </div>

        {/* Formulário de Nova Questão */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Adicionar Questão</h3>

            {/* Pergunta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pergunta *
              </label>
              <textarea
                value={formData.pergunta}
                onChange={(e) => setFormData(prev => ({ ...prev, pergunta: e.target.value }))}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Digite a pergunta..."
              />
            </div>

            {/* Tipo e Pontos */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo *
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="MULTIPLA_ESCOLHA">Múltipla Escolha</option>
                  <option value="VERDADEIRO_FALSO">Verdadeiro/Falso</option>
                  <option value="TEXTO_LIVRE">Texto Livre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pontos *
                </label>
                <input
                  type="number"
                  value={formData.pontos}
                  onChange={(e) => setFormData(prev => ({ ...prev, pontos: parseInt(e.target.value) }))}
                  min="1"
                  max="10"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Opções (apenas para múltipla escolha) */}
            {formData.tipo === 'MULTIPLA_ESCOLHA' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Opções de Resposta *
                  </label>
                  <button
                    type="button"
                    onClick={adicionarOpcao}
                    className="text-sm text-primary hover:underline"
                  >
                    + Adicionar Opção
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.opcoes.map((opcao, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={opcao.correta}
                        onChange={(e) => handleOpcaoChange(index, 'correta', e.target.checked)}
                        className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded"
                        title="Marcar como correta"
                      />
                      <input
                        type="text"
                        value={opcao.texto}
                        onChange={(e) => handleOpcaoChange(index, 'texto', e.target.value)}
                        placeholder={`Opção ${index + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      {formData.opcoes.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removerOpcao(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  ✓ Marque a(s) opção(ões) correta(s)
                </p>
              </div>
            )}

            {/* Ações */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {submitting ? 'Salvando...' : 'Salvar Questão'}
              </button>
            </div>
          </form>
        )}

        {/* Lista de Questões */}
        {questoes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhuma questão ainda
            </h3>
            <p className="text-gray-600 mb-6">
              Adicione questões para que os alunos possam fazer este quiz
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Criar Primeira Questão
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {questoes.map((questao, index) => (
              <div key={questao.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                        Questão {index + 1}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        {questao.tipo.replace('_', ' ')}
                      </span>
                      <span className="text-sm text-gray-600">
                        {questao.pontos} {questao.pontos === 1 ? 'ponto' : 'pontos'}
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium text-lg">
                      {questao.pergunta}
                    </p>
                  </div>
                </div>

                {/* Opções */}
                {questao.opcoes.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {questao.opcoes.map((opcao) => (
                      <div
                        key={opcao.id}
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          opcao.correta ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                        }`}
                      >
                        {opcao.correta && (
                          <span className="text-green-600 font-bold">✓</span>
                        )}
                        <span className={opcao.correta ? 'text-green-900 font-medium' : 'text-gray-700'}>
                          {opcao.texto}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Botão Concluir */}
        {questoes.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-green-900 mb-1">
                  ✓ Quiz Configurado!
                </h3>
                <p className="text-sm text-green-700">
                  {questoes.length} {questoes.length === 1 ? 'questão adicionada' : 'questões adicionadas'}
                </p>
              </div>
              <Link
                href="/admin/quizzes"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Concluir
              </Link>
            </div>
          </div>
        )}
      </div>
    </RequireRole>
  )
}
