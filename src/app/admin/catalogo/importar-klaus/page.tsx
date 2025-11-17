'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import RequireRole from '@/components/auth/RequireRole'
import Link from 'next/link'

interface ImportPreview {
  valid: number
  invalid: number
  duplicates: number
  items: any[]
  errors: string[]
  stats?: {
    totalProdutos: number
    totalAplicacoes: number
    produtosComImagem: number
  }
}

export default function ImportarKlausPage() {
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<FileList | null>(null)
  const [informacoesFile, setInformacoesFile] = useState<File | null>(null)
  const [aplicacoesFile, setAplicacoesFile] = useState<File | null>(null)
  const [referenciasFile, setReferenciasFile] = useState<File | null>(null)
  const [adicionaisFile, setAdicionaisFile] = useState<File | null>(null)
  const [oemFile, setOemFile] = useState<File | null>(null)
  const [imageZip, setImageZip] = useState<File | null>(null)
  const [preview, setPreview] = useState<ImportPreview | null>(null)

  const handlePreview = async () => {
    if (!informacoesFile) {
      toast.error('Arquivo de informações é obrigatório')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('informacoes', informacoesFile)
      if (aplicacoesFile) formData.append('aplicacoes', aplicacoesFile)
      if (referenciasFile) formData.append('referencias', referenciasFile)
      if (adicionaisFile) formData.append('adicionais', adicionaisFile)
      if (oemFile) formData.append('oem', oemFile)
      if (imageZip) formData.append('images', imageZip)
      formData.append('preview', 'true')

      const response = await fetch('/api/admin/catalogo/importar-klaus', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || error.error || 'Erro ao processar arquivos')
      }

      const data = await response.json()
      setPreview(data)
      toast.success('Arquivos processados! Revise os dados antes de importar.')
    } catch (error) {
      console.error('Erro ao processar arquivos:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao processar arquivos')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (!preview || preview.valid === 0) {
      toast.error('Nenhum registro válido para importar')
      return
    }

    if (!confirm(`Deseja importar ${preview.valid} produto(s) com ${preview.stats?.totalAplicacoes || 0} aplicações?`)) {
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('informacoes', informacoesFile!)
      if (aplicacoesFile) formData.append('aplicacoes', aplicacoesFile)
      if (referenciasFile) formData.append('referencias', referenciasFile)
      if (adicionaisFile) formData.append('adicionais', adicionaisFile)
      if (oemFile) formData.append('oem', oemFile)
      if (imageZip) formData.append('images', imageZip)
      formData.append('preview', 'false')

      const response = await fetch('/api/admin/catalogo/importar-klaus', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || error.error || 'Erro ao importar dados')
      }

      const result = await response.json()
      toast.success(`✅ ${result.imported} produto(s) importado(s) com sucesso!`)
      
      // Reset
      setInformacoesFile(null)
      setAplicacoesFile(null)
      setReferenciasFile(null)
      setAdicionaisFile(null)
      setOemFile(null)
      setImageZip(null)
      setPreview(null)
      
      setTimeout(() => {
        window.location.href = '/admin/catalogo'
      }, 2000)
    } catch (error) {
      console.error('Erro ao importar:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao importar dados')
    } finally {
      setLoading(false)
    }
  }

  return (
    <RequireRole roles={['ADMIN']}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/admin/catalogo/importar" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Voltar para importação padrão
          </Link>
          <h1 className="text-3xl font-bold mb-2">Importação Formato Klaus Drift</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Importe o catálogo completo usando os arquivos Excel no formato Klaus Drift
          </p>
        </div>

        {/* Upload de Arquivos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Arquivos Excel</h2>
          
          <div className="space-y-4">
            {/* Arquivo Obrigatório */}
            <div className="border-2 border-blue-300 dark:border-blue-600 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
              <label className="block text-sm font-medium mb-2">
                📄 produtos_informacoes_.xlsx <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setInformacoesFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-900 dark:text-gray-100 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 focus:outline-none"
              />
              {informacoesFile && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ {informacoesFile.name}</p>
              )}
            </div>

            {/* Arquivos Opcionais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                <label className="block text-sm font-medium mb-2">
                  🚗 produtos_aplicacoes_.xlsx
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setAplicacoesFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-900 dark:text-gray-100 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 focus:outline-none"
                />
                {aplicacoesFile && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ {aplicacoesFile.name}</p>
                )}
              </div>

              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                <label className="block text-sm font-medium mb-2">
                  🔗 produtos_referencias.xlsx
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setReferenciasFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-900 dark:text-gray-100 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 focus:outline-none"
                />
                {referenciasFile && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ {referenciasFile.name}</p>
                )}
              </div>

              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                <label className="block text-sm font-medium mb-2">
                  ⚙️ ADICIONAIS.xlsx
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setAdicionaisFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-900 dark:text-gray-100 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 focus:outline-none"
                />
                {adicionaisFile && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ {adicionaisFile.name}</p>
                )}
              </div>

              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                <label className="block text-sm font-medium mb-2">
                  🏭 OEM.xlsx
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setOemFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-900 dark:text-gray-100 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 focus:outline-none"
                />
                {oemFile && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ {oemFile.name}</p>
                )}
              </div>

              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                <label className="block text-sm font-medium mb-2">
                  📸 Imagens (ZIP)
                </label>
                <input
                  type="file"
                  accept=".zip"
                  onChange={(e) => setImageZip(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-900 dark:text-gray-100 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 focus:outline-none"
                />
                {imageZip && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ {imageZip.name}</p>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handlePreview}
            disabled={!informacoesFile || loading}
            className="mt-6 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {loading ? 'Processando...' : '🔍 Visualizar Preview'}
          </button>
        </div>

        {/* Preview dos Dados */}
        {preview && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Revisão dos Dados</h2>
            
            {/* Estatísticas */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{preview.valid}</div>
                <div className="text-sm text-green-700 dark:text-green-300">Produtos Válidos</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{preview.invalid}</div>
                <div className="text-sm text-red-700 dark:text-red-300">Inválidos</div>
              </div>
              {preview.stats && (
                <>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{preview.stats.totalAplicacoes}</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">Aplicações</div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{preview.stats.produtosComImagem}</div>
                    <div className="text-sm text-purple-700 dark:text-purple-300">Com Imagem</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{preview.stats.totalProdutos}</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">Total Planilha</div>
                  </div>
                </>
              )}
            </div>

            {/* Erros */}
            {preview.errors.length > 0 && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">⚠️ Erros Encontrados ({preview.errors.length}):</h3>
                <div className="max-h-40 overflow-y-auto">
                  <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 space-y-1">
                    {preview.errors.slice(0, 20).map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                    {preview.errors.length > 20 && (
                      <li className="text-xs italic">... e mais {preview.errors.length - 20} erro(s)</li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {/* Ações */}
            <div className="flex gap-4">
              <button
                onClick={handleImport}
                disabled={loading || preview.valid === 0}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                {loading ? 'Importando...' : `✓ Confirmar Importação (${preview.valid} produtos)`}
              </button>
              <button
                onClick={() => setPreview(null)}
                disabled={loading}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Instruções */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">📖 Como Usar</h3>
          <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-2 list-decimal list-inside">
            <li><strong>produtos_informacoes_.xlsx</strong> é obrigatório (contém dados principais)</li>
            <li>Os demais arquivos são opcionais mas recomendados para importação completa</li>
            <li>Use um ZIP com imagens nomeadas pelo código do produto (ex: 604100.jpg)</li>
            <li>O sistema cria automaticamente montadoras e modelos das aplicações</li>
            <li>Produtos duplicados (mesmo código) serão atualizados</li>
            <li>Sempre faça o preview antes de importar para verificar erros</li>
          </ol>
        </div>
      </div>
    </RequireRole>
  )
}
