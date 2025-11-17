"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Peca {
  id: string;
  codigo: string;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  imagem: string | null;
  categoria?: string;
  fabricante?: string | null;
  aplicacoes?: Array<{
    modelo: {
      nome: string;
      montadora: {
        nome: string;
      };
    };
    anoInicio?: number;
    anoFim?: number;
    motor?: string;
  }>;
  createdAt: string;
}

export default function PecaDetalhePage() {
  const params = useParams();
  const codigo = params.codigo as string;
  const [peca, setPeca] = useState<Peca | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<'aplicacao' | 'especificacoes' | 'similares'>('aplicacao');
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPeca = async () => {
      try {
        const res = await fetch(`/api/public/pecas/${codigo}`);
        if (!res.ok) throw new Error("Peça não encontrada");
        const data = await res.json();
        setPeca(data);
      } catch (err: any) {
        setError(err.message || "Erro ao carregar peça");
      } finally {
        setLoading(false);
      }
    };

    if (codigo) fetchPeca();
  }, [codigo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando peça...</p>
        </div>
      </div>
    );
  }

  if (error || !peca) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🔧</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Peça não encontrada</h1>
          <p className="text-gray-600 mb-6">{error || "A peça que você procura não existe."}</p>
          <Link href="/pecas" className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition">
            ← Voltar para catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>›</span>
          <Link href="/pecas" className="hover:text-primary">Peças</Link>
          <span>›</span>
          <span className="text-gray-900 font-medium">{peca.codigo}</span>
        </div>

        {/* Header com Código */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-primary mb-3">
                Klaus Drift - {peca.codigo}
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 font-semibold mb-3">{peca.nome}</p>
              
              {/* Código OEM */}
              {peca.descricao?.includes('Ref. OEM:') && (
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-base text-gray-600 font-medium">OEM:</span>
                  <span className="text-base md:text-lg font-bold text-primary bg-primary/10 px-4 py-2 rounded-full">
                    {peca.descricao.match(/Ref\. OEM:\s*([^\n]+)/)?.[1]?.trim() || '-'}
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimir
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Compartilhar
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Reportar Erro
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna da Imagem */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              {/* Imagem Principal */}
              <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                {peca.imagem ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={peca.imagem}
                      alt={peca.nome}
                      fill
                      className="object-contain p-4"
                      priority
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400 text-6xl">🔧</span>
                  </div>
                )}
              </div>

              {/* Miniaturas */}
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-square bg-gray-100 rounded border-2 border-gray-200 hover:border-primary cursor-pointer transition overflow-hidden"
                  >
                    {peca.imagem && i === 1 ? (
                      <Image
                        src={peca.imagem}
                        alt={`${peca.nome} - ${i}`}
                        width={100}
                        height={100}
                        className="object-contain w-full h-full p-2"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                        🔧
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <p className="text-center text-sm text-gray-500 mt-4 italic">
                Clique para ampliar a imagem
              </p>
            </div>
          </div>

          {/* Coluna do Conteúdo */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('aplicacao')}
                  className={`flex-1 px-6 py-4 text-sm font-semibold transition flex items-center justify-center gap-2 ${
                    activeTab === 'aplicacao'
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Aplicação Detalhada
                </button>
                <button
                  onClick={() => setActiveTab('especificacoes')}
                  className={`flex-1 px-6 py-4 text-sm font-semibold transition flex items-center justify-center gap-2 ${
                    activeTab === 'especificacoes'
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Especificações Técnicas
                </button>
                <button
                  onClick={() => setActiveTab('similares')}
                  className={`flex-1 px-6 py-4 text-sm font-semibold transition flex items-center justify-center gap-2 ${
                    activeTab === 'similares'
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Produtos Similares
                </button>
              </div>

              {/* Conteúdo das Tabs */}
              <div className="p-6">
                {/* Tab: Aplicação Detalhada */}
                {activeTab === 'aplicacao' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Aplicação Detalhada</h2>
                    
                    {peca.aplicacoes && peca.aplicacoes.length > 0 ? (
                      <>
                        {/* Campo de Busca */}
                        <div className="mb-4">
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Pesquise aqui..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                        </div>

                        {/* Tabela de Aplicações */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="overflow-x-auto max-h-96 overflow-y-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Montadora</th>
                                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Veículo</th>
                                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Motor</th>
                                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Início</th>
                                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Fim</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 bg-white">
                                {peca.aplicacoes
                                  .filter(app => 
                                    !searchTerm || 
                                    app.modelo.montadora.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    app.modelo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    app.motor?.toLowerCase().includes(searchTerm.toLowerCase())
                                  )
                                  .map((app, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                      <td className="px-4 py-3 font-medium text-gray-900">{app.modelo.montadora.nome}</td>
                                      <td className="px-4 py-3 text-gray-700">{app.modelo.nome}</td>
                                      <td className="px-4 py-3 text-gray-600">{app.motor || '-'}</td>
                                      <td className="px-4 py-3 text-gray-600">{app.anoInicio || '-'}</td>
                                      <td className="px-4 py-3 text-gray-600">{app.anoFim || '-'}</td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 text-lg">Nenhuma aplicação cadastrada</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Especificações Técnicas */}
                {activeTab === 'especificacoes' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Especificações Técnicas</h2>
                    
                    <div className="space-y-6">
                      {/* Especificações Básicas */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm font-semibold text-gray-600">Código do Produto</span>
                            <p className="text-lg font-medium text-gray-900 mt-1">{peca.codigo}</p>
                          </div>
                          {peca.categoria && (
                            <div>
                              <span className="text-sm font-semibold text-gray-600">Categoria</span>
                              <p className="text-lg font-medium text-gray-900 mt-1">{peca.categoria}</p>
                            </div>
                          )}
                          {peca.fabricante && (
                            <div>
                              <span className="text-sm font-semibold text-gray-600">Fabricante</span>
                              <p className="text-lg font-medium text-gray-900 mt-1">{peca.fabricante}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Descrição */}
                      {peca.descricao && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Descrição do Produto</h3>
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{peca.descricao}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab: Produtos Similares */}
                {activeTab === 'similares' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Produtos Similares</h2>
                    
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      <p className="text-gray-500 text-lg">Em breve: produtos relacionados e similares</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <Link
                href="/contato"
                className="block px-6 py-4 bg-primary text-white text-center rounded-lg font-bold hover:bg-primary-hover transition shadow-lg text-lg"
              >
                💬 Solicitar Orçamento
              </Link>
              <a
                href={`https://wa.me/5511999999999?text=Olá! Gostaria de informações sobre o produto ${peca.codigo} - ${peca.nome}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-6 py-4 bg-green-600 text-white text-center rounded-lg font-bold hover:bg-green-700 transition shadow-lg text-lg"
              >
                📱 WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
