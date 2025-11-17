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
}

export default function ImportarCatalogoPage() {
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<FileList | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [imageZip, setImageZip] = useState<File | null>(null)
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [importType, setImportType] = useState<'produtos' | 'montadoras' | 'modelos' | 'aplicacoes'>('produtos')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const ext = selectedFile.name.split('.').pop()?.toLowerCase()
      if (!['xlsx', 'xls', 'csv'].includes(ext || '')) {
        toast.error('Formato inválido. Use Excel (.xlsx, .xls) ou CSV (.csv)')
        return
      }
      setFile(selectedFile)
      setPreview(null)
    }
  }

  const handleImageZipSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.zip')) {
        toast.error('Formato inválido. Use arquivo ZIP (.zip)')
        return
      }
      setImageZip(selectedFile)
    }
  }

  const handlePreview = async () => {
    if (!file) {
      toast.error('Selecione um arquivo primeiro')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', importType)
      formData.append('preview', 'true')

      const response = await fetch('/api/admin/catalogo/importar', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao processar arquivo')
      }

      const data = await response.json()
      setPreview(data)
      toast.success('Arquivo processado! Revise os dados antes de importar.')
    } catch (error) {
      console.error('Erro ao processar arquivo:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao processar arquivo')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (!file || !preview) {
      toast.error('Faça o preview primeiro')
      return
    }

    if (preview.valid === 0) {
      toast.error('Nenhum registro válido para importar')
      return
    }

    if (!confirm(`Deseja importar ${preview.valid} registro(s)?`)) {
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', importType)
      formData.append('preview', 'false')
      
      if (imageZip) {
        formData.append('images', imageZip)
      }

      const response = await fetch('/api/admin/catalogo/importar', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao importar dados')
      }

      const result = await response.json()
      toast.success(`✅ Importação concluída! ${result.imported} registro(s) importado(s)`)
      
      // Reset
      setFile(null)
      setImageZip(null)
      setPreview(null)
      
      // Redirect após 2 segundos
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

  const downloadTemplate = (type: string) => {
    const templates: Record<string, string> = {
      produtos: `Codigo,Nome,Descricao,Categoria,Preco,Estoque,Fabricante,Peso,Dimensoes,Garantia,Imagem
P001,Pastilha de Freio Dianteira,Pastilha de freio cerâmica premium,Freios,150.00,50,TRW,0.8,20x15x5 cm,12 meses,P001.jpg
P002,Disco de Freio Ventilado,Disco ventilado 280mm,Freios,280.00,30,Fremax,5.2,280x280x30 mm,24 meses,P002.jpg`,
      
      montadoras: `Nome,Pais,Slug,ImagemUrl
Volkswagen,Alemanha,volkswagen,volkswagen.png
Ford,Estados Unidos,ford,ford.png
Chevrolet,Estados Unidos,chevrolet,chevrolet.png`,
      
      modelos: `Nome,Montadora,Tipo,Slug
Gol,Volkswagen,Hatchback,gol
Focus,Ford,Sedan,focus
Onix,Chevrolet,Hatchback,onix`,
      
      aplicacoes: `CodigoProduto,Montadora,Modelo,AnoInicio,AnoFim,Motorizacao,Versao,Combustivel,Transmissao,Posicao,Observacoes
P001,Volkswagen,Gol,2008,2016,1.6 Total Flex,Todos,Flex,Manual,Dianteira,
P001,Ford,Focus,2009,2013,2.0 Duratec,Todos,Gasolina,Manual/Automatico,Dianteira,`
    }

    const content = templates[type] || ''
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `template_${type}.csv`
    link.click()
    toast.success('Template baixado!')
  }

  return (
    <RequireRole roles={['ADMIN']}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Importação em Massa</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Importe produtos, montadoras, modelos e aplicações via planilha Excel ou CSV
          </p>
        </div>

        {/* Importação Klaus Drift */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">🚀 Importação Klaus Drift</h3>
              <p className="text-blue-100 mb-4">
                Use este modo para importar o catálogo completo com múltiplos arquivos Excel (produtos, aplicações, referências)
              </p>
              <Link 
                href="/admin/catalogo/importar-klaus"
                className="inline-block px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold shadow-md"
              >
                Acessar Importação Klaus →
              </Link>
            </div>
            <div className="hidden md:block text-6xl">📊</div>
          </div>
        </div>

        {/* Tipo de Importação */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">1. Selecione o tipo de importação</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(['produtos', 'montadoras', 'modelos', 'aplicacoes'] as const).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setImportType(type)
                  setFile(null)
                  setPreview(null)
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  importType === type
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                }`}
              >
                <div className="text-2xl mb-2">
                  {type === 'produtos' && '📦'}
                  {type === 'montadoras' && '🏭'}
                  {type === 'modelos' && '🚗'}
                  {type === 'aplicacoes' && '🔧'}
                </div>
                <div className="font-medium capitalize">{type}</div>
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => downloadTemplate(importType)}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Baixar template de exemplo ({importType})
            </button>
          </div>
        </div>

        {/* Upload de Arquivo */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">2. Upload da planilha</h2>
          
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {file ? file.name : 'Clique para selecionar ou arraste o arquivo'}
              </span>
              <span className="text-xs text-gray-500 mt-1">Excel (.xlsx, .xls) ou CSV (.csv)</span>
            </label>
          </div>

          {importType === 'produtos' && (
            <div className="mt-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
              <h3 className="font-medium mb-3">Upload de imagens (Opcional)</h3>
              <input
                type="file"
                accept=".zip"
                onChange={handleImageZipSelect}
                className="hidden"
                id="images-upload"
              />
              <label
                htmlFor="images-upload"
                className="cursor-pointer flex items-center gap-3"
              >
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <div className="text-sm font-medium">
                    {imageZip ? imageZip.name : 'Selecione arquivo ZIP com imagens'}
                  </div>
                  <div className="text-xs text-gray-500">
                    As imagens devem ter o mesmo nome do código do produto (ex: P001.jpg)
                  </div>
                </div>
              </label>
            </div>
          )}

          <button
            onClick={handlePreview}
            disabled={!file || loading}
            className="mt-4 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Processando...' : 'Visualizar Preview'}
          </button>
        </div>

        {/* Preview dos Dados */}
        {preview && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">3. Revisão dos Dados</h2>
            
            {/* Estatísticas */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{preview.valid}</div>
                <div className="text-sm text-green-700 dark:text-green-300">Registros válidos</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{preview.invalid}</div>
                <div className="text-sm text-red-700 dark:text-red-300">Registros inválidos</div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{preview.duplicates}</div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300">Duplicados</div>
              </div>
            </div>

            {/* Erros */}
            {preview.errors.length > 0 && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">⚠️ Erros Encontrados:</h3>
                <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 space-y-1">
                  {preview.errors.slice(0, 10).map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                  {preview.errors.length > 10 && (
                    <li className="text-xs italic">... e mais {preview.errors.length - 10} erro(s)</li>
                  )}
                </ul>
              </div>
            )}

            {/* Dados para importar */}
            <div className="max-h-96 overflow-auto border dark:border-gray-700 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left">#</th>
                    <th className="px-4 py-2 text-left">Dados</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {preview.items.slice(0, 50).map((item, i) => (
                    <tr key={i} className={item.valid ? '' : 'bg-red-50 dark:bg-red-900/10'}>
                      <td className="px-4 py-2">{i + 1}</td>
                      <td className="px-4 py-2">
                        <div className="text-xs">
                          {JSON.stringify(item.data, null, 2).substring(0, 100)}...
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        {item.valid ? (
                          <span className="text-green-600 dark:text-green-400">✓</span>
                        ) : (
                          <span className="text-red-600 dark:text-red-400" title={item.error}>✗</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={handleImport}
                disabled={loading || preview.valid === 0}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                {loading ? 'Importando...' : `✓ Confirmar Importação (${preview.valid} registros)`}
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
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">📖 Instruções</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <li>• Baixe o template de exemplo para ver o formato correto</li>
            <li>• Use Excel (.xlsx, .xls) ou CSV com separador de vírgula</li>
            <li>• A primeira linha deve conter os cabeçalhos das colunas</li>
            <li>• Campos obrigatórios não podem estar vazios</li>
            <li>• Para produtos com imagens, crie um ZIP com fotos nomeadas pelo código (ex: P001.jpg)</li>
            <li>• Sempre faça o preview antes de importar para verificar erros</li>
            <li>• Registros duplicados serão ignorados automaticamente</li>
          </ul>
        </div>
      </div>
    </RequireRole>
  )
}
