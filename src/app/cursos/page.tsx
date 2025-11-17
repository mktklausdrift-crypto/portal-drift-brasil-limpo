'use client'

import { useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface Curso {
  id: string
  titulo: string
  descricao: string
  modalidade: string
  cargaHoraria: string
  imagem?: string | null
  destaque: boolean
  inscricoesAbertas: boolean
}

export default function CursosPage() {
  const { data: session } = useSession()
  const [cursos, setCursos] = useState<Curso[]>([])
  const [modalidades, setModalidades] = useState<string[]>(["Todos"])
  const [modalidadeSelecionada, setModalidadeSelecionada] = useState("Todos")
  const [busca, setBusca] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCursos()
    loadModalidades()
  }, [])

  const loadCursos = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (modalidadeSelecionada !== "Todos") params.set("modalidade", modalidadeSelecionada)
      if (busca) params.set("busca", busca)
      
      const response = await fetch(`/api/public/cursos?${params.toString()}`, {
        cache: 'no-store'
      })
      if (response.ok) {
        const data = await response.json()
        setCursos(data)
      }
    } catch (error) {
      console.error("Erro ao carregar cursos:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadModalidades = async () => {
    try {
      const response = await fetch("/api/public/cursos/modalidades")
      if (response.ok) {
        const data = await response.json()
        setModalidades(["Todos", ...data])
      }
    } catch (error) {
      console.error("Erro ao carregar modalidades:", error)
    }
  }

  useEffect(() => {
    loadCursos()
  }, [modalidadeSelecionada, busca])

  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      {/* Header com link Meus Cursos se logado */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-primary mb-4">Cursos Livres</h1>
          <p className="text-lg text-gray-700">
            Capacitação profissional para mecânicos, distribuidores e profissionais do setor automotivo. 
            Aprenda com especialistas sobre instalação, diagnóstico e manutenção de peças automotivas.
          </p>
        </div>
        {session?.user && (
          <Link 
            href="/meus-cursos"
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-semibold whitespace-nowrap"
          >
            📚 Meus Cursos
          </Link>
        )}
      </div>
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
        <div className="flex gap-2 flex-wrap">
          {modalidades.map((mod) => (
            <button
              key={mod}
              onClick={() => setModalidadeSelecionada(mod)}
              className={`px-4 py-2 rounded-full font-semibold transition ${modalidadeSelecionada === mod ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-primary hover:text-white"}`}
            >
              {mod}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Buscar cursos..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 w-full md:w-64 focus:outline-primary"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cursos.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-16">Nenhum curso encontrado.</div>
          ) : (
            cursos.map((curso) => (
              <Link
                key={curso.id}
                href={`/cursos/${curso.id}`}
                className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary/30 flex flex-col"
              >
                {/* Imagem de capa com overlay no hover */}
                {curso.imagem ? (
                  <div className="relative w-full h-56 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                    <img 
                      src={curso.imagem} 
                      alt={curso.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {curso.destaque && (
                      <div className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-10 flex items-center gap-1">
                        <span>⭐</span> Destaque
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                ) : (
                  <div className="relative w-full h-56 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <div className="text-6xl opacity-20">📚</div>
                    {curso.destaque && (
                      <div className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-10 flex items-center gap-1">
                        <span>⭐</span> Destaque
                      </div>
                    )}
                  </div>
                )}
                
                {/* Conteúdo do card */}
                <div className="p-5 flex flex-col flex-1">
                  {/* Badge de modalidade */}
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                      {curso.modalidade}
                    </span>
                  </div>
                  
                  {/* Título */}
                  <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {curso.titulo}
                  </h2>
                  
                  {/* Descrição */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
                    {curso.descricao}
                  </p>
                  
                  {/* Footer do card */}
                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span>🕐</span>
                        <span>{curso.cargaHoraria}</span>
                      </div>
                      {curso.inscricoesAbertas ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                          Inscrições Abertas
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded">
                          Encerrado
                        </span>
                      )}
                    </div>
                    
                    {/* Botão de ação */}
                    {curso.inscricoesAbertas ? (
                      <div className="w-full px-4 py-2.5 rounded-lg bg-primary text-white font-semibold text-sm text-center group-hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                        <span>Ver Conteúdo</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    ) : (
                      <div className="w-full px-4 py-2.5 rounded-lg bg-gray-100 text-gray-400 font-semibold text-sm text-center cursor-not-allowed">
                        Indisponível
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}