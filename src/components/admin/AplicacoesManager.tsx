'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

interface Montadora {
  id: string
  nome: string
  imagemUrl: string | null
}

interface Modelo {
  id: string
  nome: string
  montadoraId: string
  tipo: string
  montadora: {
    nome: string
  }
}

interface Aplicacao {
  id: string
  modeloId: string
  anoInicio: number
  anoFim: number | null
  motorizacao: string | null
  versao: string | null
  combustivel: string | null
  transmissao: string | null
  posicao: string | null
  observacoes: string | null
  modelo: {
    id: string
    nome: string
    montadora: {
      nome: string
    }
  }
}

interface AplicacoesManagerProps {
  produtoId: string
}

export default function AplicacoesManager({ produtoId }: AplicacoesManagerProps) {
  const [aplicacoes, setAplicacoes] = useState<Aplicacao[]>([])
  const [montadoras, setMontadoras] = useState<Montadora[]>([])
  const [modelos, setModelos] = useState<Modelo[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    montadoraId: '',
    modeloId: '',
    anoInicio: new Date().getFullYear(),
    anoFim: new Date().getFullYear(),
    motorizacao: '',
    versao: '',
    combustivel: '',
    transmissao: '',
    posicao: '',
    observacoes: ''
  })

  useEffect(() => {
    loadData()
  }, [produtoId])

  useEffect(() => {
    if (formData.montadoraId) {
      loadModelos(formData.montadoraId)
    } else {
      setModelos([])
      setFormData(prev => ({ ...prev, modeloId: '' }))
    }
  }, [formData.montadoraId])

  const loadData = async () => {
    try {
      setLoading(true)

      // Carregar aplicações do produto
      const aplicacoesRes = await fetch(`/api/admin/aplicacoes?produtoId=${produtoId}`)
      if (aplicacoesRes.ok) {
        const data = await aplicacoesRes.json()
        setAplicacoes(Array.isArray(data.aplicacoes) ? data.aplicacoes : [])
      }

      // Carregar montadoras
      const montadorasRes = await fetch('/api/admin/montadoras?limit=1000')
      if (montadorasRes.ok) {
        const data = await montadorasRes.json()
        setMontadoras(data.montadoras || [])
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar aplicações')
    } finally {
      setLoading(false)
    }
  }

  const loadModelos = async (montadoraId: string) => {
    try {
      const response = await fetch(`/api/admin/modelos?montadoraId=${montadoraId}`)
      if (response.ok) {
        const data = await response.json()
        setModelos(data || [])
      }
    } catch (error) {
      console.error('Erro ao carregar modelos:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.modeloId) {
      toast.error('Selecione um modelo')
      return
    }

    if (formData.anoInicio > formData.anoFim) {
      toast.error('Ano inicial não pode ser maior que ano final')
      return
    }

    setSaving(true)

    try {
      const response = await fetch('/api/admin/aplicacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produtoId,
          modeloId: formData.modeloId,
          anoInicio: formData.anoInicio,
          anoFim: formData.anoFim || null,
          motorizacao: formData.motorizacao || null,
          versao: formData.versao || null,
          combustivel: formData.combustivel || null,
          transmissao: formData.transmissao || null,
          posicao: formData.posicao || null,
          observacoes: formData.observacoes || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao adicionar aplicação')
      }

      toast.success('Aplicação adicionada com sucesso!')
      setShowForm(false)
      resetForm()
      loadData()
    } catch (error) {
      console.error('Erro ao adicionar aplicação:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao adicionar aplicação')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta aplicação?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/aplicacoes/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao excluir aplicação')
      }

      toast.success('Aplicação removida com sucesso!')
      loadData()
    } catch (error) {
      console.error('Erro ao excluir aplicação:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir aplicação')
    }
  }

  const resetForm = () => {
    setFormData({
      montadoraId: '',
      modeloId: '',
      anoInicio: new Date().getFullYear(),
      anoFim: new Date().getFullYear(),
      motorizacao: '',
      versao: '',
      combustivel: '',
      transmissao: '',
      posicao: '',
      observacoes: ''
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Aplicações do Veículo</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Vincule este produto aos modelos de veículos compatíveis
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nova Aplicação
          </button>
        )}
      </div>

      {/* Formulário */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Montadora */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Montadora *
              </label>
              <select
                value={formData.montadoraId}
                onChange={(e) => setFormData({ ...formData, montadoraId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
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

            {/* Modelo */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Modelo *
              </label>
              <select
                value={formData.modeloId}
                onChange={(e) => setFormData({ ...formData, modeloId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                required
                disabled={!formData.montadoraId}
              >
                <option value="">Selecione um modelo</option>
                {modelos.map((modelo) => (
                  <option key={modelo.id} value={modelo.id}>
                    {modelo.nome} ({modelo.tipo})
                  </option>
                ))}
              </select>
            </div>

            {/* Ano Início */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Ano Início *
              </label>
              <input
                type="number"
                value={formData.anoInicio}
                onChange={(e) => setFormData({ ...formData, anoInicio: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                min="1900"
                max="2100"
                required
              />
            </div>

            {/* Ano Fim */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Ano Fim *
              </label>
              <input
                type="number"
                value={formData.anoFim}
                onChange={(e) => setFormData({ ...formData, anoFim: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                min="1900"
                max="2100"
                required
              />
            </div>

            {/* Motorização */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Motorização
              </label>
              <input
                type="text"
                value={formData.motorizacao}
                onChange={(e) => setFormData({ ...formData, motorizacao: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                placeholder="Ex: 1.0, 1.6, 2.0..."
              />
            </div>

            {/* Versão */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Versão
              </label>
              <input
                type="text"
                value={formData.versao}
                onChange={(e) => setFormData({ ...formData, versao: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                placeholder="Ex: LX, EX, Sport..."
              />
            </div>

            {/* Combustível */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Combustível
              </label>
              <select
                value={formData.combustivel}
                onChange={(e) => setFormData({ ...formData, combustivel: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
              >
                <option value="">Não especificado</option>
                <option value="Gasolina">Gasolina</option>
                <option value="Etanol">Etanol</option>
                <option value="Flex">Flex</option>
                <option value="Diesel">Diesel</option>
                <option value="Elétrico">Elétrico</option>
                <option value="Híbrido">Híbrido</option>
              </select>
            </div>

            {/* Transmissão */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Transmissão
              </label>
              <select
                value={formData.transmissao}
                onChange={(e) => setFormData({ ...formData, transmissao: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
              >
                <option value="">Não especificado</option>
                <option value="Manual">Manual</option>
                <option value="Automática">Automática</option>
                <option value="CVT">CVT</option>
                <option value="Automatizada">Automatizada</option>
              </select>
            </div>

            {/* Posição */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Posição
              </label>
              <input
                type="text"
                value={formData.posicao}
                onChange={(e) => setFormData({ ...formData, posicao: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                placeholder="Ex: Dianteira, Traseira..."
              />
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Observações
            </label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
              rows={2}
              placeholder="Informações adicionais sobre compatibilidade..."
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Salvando...' : 'Adicionar'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                resetForm()
              }}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Lista de Aplicações */}
      {aplicacoes.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400">
            Nenhuma aplicação cadastrada para este produto
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Adicione aplicações para especificar os veículos compatíveis
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {aplicacoes.map((aplicacao) => (
            <div
              key={aplicacao.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">
                    {aplicacao.modelo.montadora.nome} {aplicacao.modelo.nome}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <div>
                      <span className="font-medium">Anos:</span> {aplicacao.anoInicio} - {aplicacao.anoFim || 'Atual'}
                    </div>
                    {aplicacao.motorizacao && (
                      <div>
                        <span className="font-medium">Motor:</span> {aplicacao.motorizacao}
                      </div>
                    )}
                    {aplicacao.versao && (
                      <div>
                        <span className="font-medium">Versão:</span> {aplicacao.versao}
                      </div>
                    )}
                    {aplicacao.combustivel && (
                      <div>
                        <span className="font-medium">Combustível:</span> {aplicacao.combustivel}
                      </div>
                    )}
                    {aplicacao.transmissao && (
                      <div>
                        <span className="font-medium">Câmbio:</span> {aplicacao.transmissao}
                      </div>
                    )}
                    {aplicacao.posicao && (
                      <div>
                        <span className="font-medium">Posição:</span> {aplicacao.posicao}
                      </div>
                    )}
                  </div>
                  {aplicacao.observacoes && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
                      {aplicacao.observacoes}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(aplicacao.id)}
                  className="ml-4 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Remover aplicação"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
