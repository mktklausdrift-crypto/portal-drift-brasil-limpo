'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Montadora {
  id: string
  nome: string
  slug: string
  imagemUrl: string | null
}

interface Modelo {
  id: string
  nome: string
  slug: string
}

interface Produto {
  id: string
  nome: string
  codigo: string
  preco: number
  imagem: string
  categoria: string
  fabricante: string | null
  destaque: boolean
  descricao?: string
  _count?: {
    aplicacoes: number
  }
  aplicacoes?: Array<{
    modelo: {
      nome: string
      montadora: {
        nome: string
      }
    }
  }>
}

export default function CatalogoPecasPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [montadoras, setMontadoras] = useState<Montadora[]>([])
  const [modelos, setModelos] = useState<Modelo[]>([])
  const [categorias, setCategorias] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProdutos, setTotalProdutos] = useState(0)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const [filters, setFilters] = useState({
    search: '',
    montadora: '',
    modelo: '',
    ano: '',
    categoria: '',
    page: 1
  })

  useEffect(() => {
    loadMontadoras()
    loadCategorias()
  }, [])

  useEffect(() => {
    if (filters.montadora) {
      loadModelos(filters.montadora)
    } else {
      setModelos([])
      setFilters(prev => ({ ...prev, modelo: '' }))
    }
  }, [filters.montadora])

  useEffect(() => {
    loadProdutos()
  }, [filters.page, filters.montadora, filters.modelo, filters.ano, filters.categoria])

  const loadMontadoras = async () => {
    try {
      const response = await fetch('/api/public/montadoras')
      if (response.ok) {
        const data = await response.json()
        setMontadoras(data || [])
      }
    } catch (error) {
      console.error('Erro ao carregar montadoras:', error)
    }
  }

  const loadCategorias = async () => {
    try {
      const response = await fetch('/api/public/categorias')
      if (response.ok) {
        const data = await response.json()
        setCategorias(data || [])
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  // Agrupar categorias similares
  const agruparCategorias = (categorias: string[]) => {
    const grupos: { [key: string]: string[] } = {}
    
    categorias.forEach(cat => {
      const catUpper = cat.toUpperCase()
      
      // Agrupar por palavra-chave principal
      if (catUpper.includes('BOMBA') || catUpper.includes('ELETROBOMBA')) {
        if (!grupos['BOMBAS']) grupos['BOMBAS'] = []
        grupos['BOMBAS'].push(cat)
      } else if (catUpper.includes('RADIADOR')) {
        if (!grupos['RADIADORES']) grupos['RADIADORES'] = []
        grupos['RADIADORES'].push(cat)
      } else if (catUpper.includes('CONDENSADOR')) {
        if (!grupos['CONDENSADORES']) grupos['CONDENSADORES'] = []
        grupos['CONDENSADORES'].push(cat)
      } else if (catUpper.includes('ELETROVENTILADOR') || catUpper.includes('VENTILADOR')) {
        if (!grupos['VENTILADORES']) grupos['VENTILADORES'] = []
        grupos['VENTILADORES'].push(cat)
      } else if (catUpper.includes('RESERVAT')) {
        if (!grupos['RESERVATÓRIOS']) grupos['RESERVATÓRIOS'] = []
        grupos['RESERVATÓRIOS'].push(cat)
      } else if (catUpper.includes('SENSOR')) {
        if (!grupos['SENSORES']) grupos['SENSORES'] = []
        grupos['SENSORES'].push(cat)
      } else if (catUpper.includes('INTERRUPTOR')) {
        if (!grupos['INTERRUPTORES']) grupos['INTERRUPTORES'] = []
        grupos['INTERRUPTORES'].push(cat)
      } else if (catUpper.includes('CORREIA')) {
        if (!grupos['CORREIAS']) grupos['CORREIAS'] = []
        grupos['CORREIAS'].push(cat)
      } else if (catUpper.includes('TAMPA')) {
        if (!grupos['TAMPAS']) grupos['TAMPAS'] = []
        grupos['TAMPAS'].push(cat)
      } else if (catUpper.includes('SONDA')) {
        if (!grupos['SONDAS']) grupos['SONDAS'] = []
        grupos['SONDAS'].push(cat)
      } else if (catUpper.includes('PLÁSTIC') || catUpper.includes('PLASTIC')) {
        if (!grupos['PEÇAS PLÁSTICAS']) grupos['PEÇAS PLÁSTICAS'] = []
        grupos['PEÇAS PLÁSTICAS'].push(cat)
      } else if (catUpper.includes('TRAVA') || catUpper.includes('DESTRAVA')) {
        if (!grupos['TRAVAS']) grupos['TRAVAS'] = []
        grupos['TRAVAS'].push(cat)
      } else if (catUpper.includes('PLUG') || catUpper.includes('CONECTOR')) {
        if (!grupos['CONECTORES']) grupos['CONECTORES'] = []
        grupos['CONECTORES'].push(cat)
      } else if (catUpper.includes('DUTO')) {
        if (!grupos['DUTOS']) grupos['DUTOS'] = []
        grupos['DUTOS'].push(cat)
      } else {
        // Categoria única
        if (!grupos[cat]) grupos[cat] = []
        grupos[cat].push(cat)
      }
    })
    
    return grupos
  }

  const categoriasAgrupadas = agruparCategorias(categorias)
  const gruposOrdenados = Object.keys(categoriasAgrupadas).sort()

  const loadModelos = async (montadoraId: string) => {
    try {
      const response = await fetch(`/api/public/modelos?montadoraId=${montadoraId}`)
      if (response.ok) {
        const data = await response.json()
        setModelos(data || [])
      }
    } catch (error) {
      console.error('Erro ao carregar modelos:', error)
    }
  }

  const loadProdutos = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (filters.search) params.set('search', filters.search)
      if (filters.montadora) params.set('montadora', filters.montadora)
      if (filters.modelo) params.set('modelo', filters.modelo)
      if (filters.ano) params.set('ano', filters.ano)
      if (filters.categoria) params.set('categoria', filters.categoria)
      params.set('page', filters.page.toString())

      const response = await fetch(`/api/public/pecas?${params.toString()}`)
      
      if (response.ok) {
        const data = await response.json()
        setProdutos(data.produtos || [])
        setTotalPages(data.pagination?.totalPages || 1)
        setTotalProdutos(data.pagination?.total || 0)
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters(prev => ({ ...prev, page: 1 }))
    loadProdutos()
  }

  const handleClearFilters = () => {
    setFilters({
      search: '',
      montadora: '',
      modelo: '',
      ano: '',
      categoria: '',
      page: 1
    })
    setTimeout(loadProdutos, 100)
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1979 }, (_, i) => currentYear - i)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header Moderno */}
        <div className="mb-10 text-center">
          <div className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
            CATÁLOGO DE PEÇAS
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4 text-primary">
            Peças Automotivas
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Encontre peças compatíveis com seu veículo com qualidade e garantia
          </p>
          {totalProdutos > 0 && (
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              <strong className="text-primary">{totalProdutos.toLocaleString('pt-BR')}</strong> produtos disponíveis
            </div>
          )}
        </div>

        <div className="flex gap-6">
          {/* Sidebar de Categorias - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">CATEGORIAS</h2>
                <button
                  onClick={() => setFilters({ ...filters, categoria: '', page: 1 })}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
              <div className="space-y-2">
                {gruposOrdenados.map((grupo) => (
                  <label
                    key={grupo}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={categoriasAgrupadas[grupo].some(cat => filters.categoria === cat)}
                      onChange={(e) => {
                        setFilters({
                          ...filters,
                          categoria: e.target.checked ? categoriasAgrupadas[grupo].join(',') : '',
                          page: 1
                        })
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm uppercase group-hover:text-blue-600 transition-colors flex-1">
                      {grupo}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({categoriasAgrupadas[grupo].length})
                    </span>
                    <svg className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Conteúdo Principal */}
          <div className="flex-1">
            {/* Filtros Horizontais */}
            <form onSubmit={handleSearch} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              {/* Botão Mobile Categorias */}
              <button
                type="button"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden w-full mb-4 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-between"
              >
                <span className="font-medium">Categorias</span>
                <svg className={`w-5 h-5 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Categorias Mobile */}
              {showMobileFilters && (
                <div className="lg:hidden mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2 max-h-64 overflow-y-auto">
                  {gruposOrdenados.map((grupo) => (
                    <label
                      key={grupo}
                      className="flex items-center gap-3 p-2 hover:bg-white dark:hover:bg-gray-600 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={categoriasAgrupadas[grupo].some(cat => filters.categoria === cat)}
                        onChange={(e) => {
                          setFilters({
                            ...filters,
                            categoria: e.target.checked ? categoriasAgrupadas[grupo].join(',') : '',
                            page: 1
                          })
                          setShowMobileFilters(false)
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm uppercase flex-1">{grupo}</span>
                      <span className="text-xs text-gray-500">({categoriasAgrupadas[grupo].length})</span>
                    </label>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Busca por texto */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Buscar peça
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Nome, código ou fabricante..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              />
            </div>

            {/* Montadora */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Montadora
              </label>
              <select
                value={filters.montadora}
                onChange={(e) => setFilters({ ...filters, montadora: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              >
                <option value="">Todas</option>
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
                Modelo
              </label>
              <select
                value={filters.modelo}
                onChange={(e) => setFilters({ ...filters, modelo: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                disabled={!filters.montadora}
              >
                <option value="">Todos</option>
                {modelos.map((modelo) => (
                  <option key={modelo.id} value={modelo.id}>
                    {modelo.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Ano */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Ano
              </label>
              <select
                value={filters.ano}
                onChange={(e) => setFilters({ ...filters, ano: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              >
                <option value="">Qualquer ano</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

              {/* Botões */}
              <div className="flex gap-3 mt-4">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Buscar
            </button>
            {(filters.search || filters.montadora || filters.modelo || filters.ano || filters.categoria) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Limpar Filtros
                </button>
              )}
              </div>
            </form>

            {/* Badge de Categoria Ativa */}
            {filters.categoria && (
              <div className="mb-4 flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Filtrando por:</span>
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                  {filters.categoria}
                  <button
                    onClick={() => setFilters({ ...filters, categoria: '', page: 1 })}
                    className="hover:text-blue-900 dark:hover:text-blue-100"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              </div>
            )}

            {/* Resultados */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : produtos.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Nenhuma peça encontrada
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Tente ajustar os filtros de busca
            </p>
          </div>
        ) : (
          <>
            {/* Grid de Produtos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
              {produtos.map((produto) => (
                <Link
                  key={produto.id}
                  href={`/pecas/${produto.codigo}`}
                  className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700"
                >
                  {/* Imagem do Produto */}
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center overflow-hidden relative">
                    {produto.imagem && produto.imagem.startsWith('/uploads/') ? (
                      <Image
                        src={produto.imagem}
                        alt={produto.nome}
                        fill
                        className="object-contain transition-transform duration-500 group-hover:scale-105 p-4"
                        unoptimized
                      />
                    ) : (
                      <span className="text-6xl group-hover:scale-110 transition-transform duration-500 filter drop-shadow-lg">🔧</span>
                    )}
                    {produto.destaque && (
                      <div className="absolute top-3 right-3 px-3 py-1 bg-gradient-to-r from-primary to-primary-hover text-white rounded-full text-xs font-black shadow-lg">
                        ⭐ TOP
                      </div>
                    )}
                  </div>

                  {/* Conteúdo */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-primary transition-colors leading-tight min-h-[48px]">
                      {produto.nome}
                    </h3>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        Cód: {produto.codigo}
                      </span>
                      {produto.descricao?.includes('Ref. OEM:') && (
                        <span className="text-xs text-primary font-medium">
                          {produto.descricao.match(/Ref\. OEM:\s*([^\n,]+)/)?.[1]?.substring(0, 8) || '-'}
                        </span>
                      )}
                    </div>
                    
                    {/* Aplicações Resumo */}
                    {produto._count && produto._count.aplicacoes > 0 ? (
                      <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>{produto._count.aplicacoes} aplicações</span>
                      </div>
                    ) : null}

                    <div className="flex items-center justify-end pt-3 mt-3 border-t border-gray-100 dark:border-gray-700">
                      <div className="text-primary group-hover:translate-x-1 transition-transform font-medium">
                        Ver detalhes →
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="space-y-4">
                {/* Contador de produtos */}
                <div className="text-center text-gray-600 dark:text-gray-400">
                  Mostrando {Math.min((filters.page - 1) * 24 + 1, totalProdutos)} a {Math.min(filters.page * 24, totalProdutos)} de <strong>{totalProdutos}</strong> produtos
                </div>

                {/* Controles de paginação */}
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {/* Primeira página */}
                  <button
                    onClick={() => setFilters({ ...filters, page: 1 })}
                    disabled={filters.page === 1}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    title="Primeira página"
                  >
                    ««
                  </button>

                  {/* Anterior */}
                  <button
                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                    disabled={filters.page === 1}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Anterior
                  </button>

                  {/* Páginas numeradas - contexto ao redor da página atual */}
                  <div className="flex gap-1">
                    {filters.page > 3 && (
                      <>
                        <button
                          onClick={() => setFilters({ ...filters, page: 1 })}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
                        >
                          1
                        </button>
                        {filters.page > 4 && <span className="px-2 py-2 text-gray-500">...</span>}
                      </>
                    )}

                    {[...Array(5)].map((_, i) => {
                      const pageNum = filters.page - 2 + i;
                      if (pageNum < 1 || pageNum > totalPages) return null;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setFilters({ ...filters, page: pageNum })}
                          className={`px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                            pageNum === filters.page
                              ? "bg-primary text-white"
                              : "border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    {filters.page < totalPages - 2 && (
                      <>
                        {filters.page < totalPages - 3 && <span className="px-2 py-2 text-gray-500">...</span>}
                        <button
                          onClick={() => setFilters({ ...filters, page: totalPages })}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>

                  {/* Próxima */}
                  <button
                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                    disabled={filters.page === totalPages}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Próxima
                  </button>

                  {/* Última página */}
                  <button
                    onClick={() => setFilters({ ...filters, page: totalPages })}
                    disabled={filters.page === totalPages}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    title="Última página"
                  >
                    »»
                  </button>
                </div>
              </div>
            )}
            </>
          )}
          </div>
        </div>
      </div>
    </div>
  )
}
