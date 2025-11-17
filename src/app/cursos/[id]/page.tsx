"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";

interface OpcaoQuiz {
  id: string;
  texto: string;
  ordem: number;
}

interface QuestaoQuiz {
  id: string;
  pergunta: string;
  tipo: string;
  ordem: number;
  opcoes: OpcaoQuiz[];
}

interface Quiz {
  id: string;
  titulo: string;
  descricao?: string;
  tempo?: number;
  pontos: number;
  questoes: QuestaoQuiz[];
}

interface Modulo {
  id: string;
  titulo: string;
  descricao?: string;
  ordem: number;
  quizId?: string;
  quiz?: Quiz;
  aulas: Aula[];
}

interface Aula {
  id: string;
  titulo: string;
  descricao?: string;
  ordem: number;
  duracao?: string;
  videoUrl?: string;
}

interface Curso {
  id: string;
  titulo: string;
  descricao: string;
  modalidade: string;
  cargaHoraria: string;
  imagem?: string;
  destaque?: boolean;
  inscricoesAbertas?: boolean;
  createdAt?: string;
  modulos?: Modulo[];
}

export default function CursoDetalhePage() {
  const { id } = useParams();
  const { data: session, status } = useSession();
  const [curso, setCurso] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedModulos, setExpandedModulos] = useState<Set<string>>(new Set());
  const [modulosProgresso, setModulosProgresso] = useState<Record<string, {total: number, concluidas: number}>>({});
  const [progresso, setProgresso] = useState<{
    totalAulas: number;
    aulasConcluidas: number;
    progresso: number;
    concluido: boolean;
    dataConclusao?: string;
  } | null>(null);

  useEffect(() => {
    loadCurso();
  }, [id]);

  useEffect(() => {
    if (status === 'authenticated' && curso) {
      loadProgresso();
    }
  }, [status, curso]);

  const loadCurso = async () => {
    try {
      const res = await fetch(`/api/cursos/${id}`, {
        cache: 'no-store'
      });
      
      if (!res.ok) throw new Error("Curso não encontrado");
      
      const data = await res.json();
      setCurso(data);
      
      // Expandir todos os módulos por padrão
      if (data.modulos) {
        setExpandedModulos(new Set(data.modulos.map((m: Modulo) => m.id)));
      }
    } catch (err: any) {
      setError(err.message || "Erro ao carregar curso");
      setCurso(null);
    } finally {
      setLoading(false);
    }
  };

  const loadProgresso = async () => {
    try {
      const res = await fetch(`/api/cursos/${id}/progresso`, {
        credentials: 'include',
        cache: 'no-store'
      });

      if (res.ok) {
        const data = await res.json();
        setProgresso(data);
        
        // Calcular progresso por módulo
        if (curso?.modulos) {
          const progressoPorModulo: Record<string, {total: number, concluidas: number}> = {};
          
          curso.modulos.forEach(modulo => {
            const totalAulasModulo = modulo.aulas?.length || 0;
            const aulasConcluidas = modulo.aulas?.filter(aula => 
              data.aulasConcluidasIds?.includes(aula.id)
            ).length || 0;
            
            progressoPorModulo[modulo.id] = {
              total: totalAulasModulo,
              concluidas: aulasConcluidas
            };
          });
          
          setModulosProgresso(progressoPorModulo);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar progresso:', error);
    }
  };

  const moduloConcluido = (moduloId: string): boolean => {
    const prog = modulosProgresso[moduloId];
    return prog ? prog.total > 0 && prog.concluidas === prog.total : false;
  };

  const toggleModulo = (moduloId: string) => {
    const newExpanded = new Set(expandedModulos);
    if (newExpanded.has(moduloId)) {
      newExpanded.delete(moduloId);
    } else {
      newExpanded.add(moduloId);
    }
    setExpandedModulos(newExpanded);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando curso...</p>
        </div>
      </div>
    );
  }

  if (error || !curso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🎓</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Curso não encontrado</h1>
          <p className="text-gray-600 mb-6">{error || "O curso que você procura não existe."}</p>
          <Link href="/cursos" className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition">
            ← Voltar para cursos
          </Link>
        </div>
      </div>
    );
  }

  const totalAulas = curso.modulos?.reduce((acc, mod) => acc + (mod.aulas?.length || 0), 0) || 0;
  const totalModulos = curso.modulos?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/cursos" className="text-primary hover:underline mb-6 inline-block font-medium">
          ← Voltar para cursos
        </Link>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {curso.imagem && (
            <div className="relative w-full h-96 bg-gray-100">
              <Image
                src={curso.imagem}
                alt={curso.titulo}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="p-8">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              {curso.destaque && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                  ⭐ Destaque
                </span>
              )}
              {curso.inscricoesAbertas ? (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                  ✅ Inscrições Abertas
                </span>
              ) : (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-semibold">
                  🚫 Inscrições Encerradas
                </span>
              )}
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                {curso.modalidade}
              </span>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {curso.titulo}
            </h1>

            {/* Barra de Progresso */}
            {status === 'authenticated' && progresso && (
              <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {progresso.concluido ? '🎉 Curso Concluído!' : '📊 Seu Progresso'}
                  </h3>
                  <span className="text-2xl font-bold text-primary">
                    {progresso.progresso}%
                  </span>
                </div>
                
                {/* Barra de Progresso */}
                <div className="w-full bg-gray-200 rounded-full h-4 mb-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full transition-all duration-500 flex items-center justify-end px-2"
                    style={{ width: `${progresso.progresso}%` }}
                  >
                    {progresso.progresso > 10 && (
                      <span className="text-xs font-bold text-white">
                        {progresso.progresso}%
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">
                    {progresso.aulasConcluidas} de {progresso.totalAulas} aulas concluídas
                  </span>
                  {progresso.concluido && progresso.dataConclusao && (
                    <span className="text-green-600 font-medium">
                      ✓ Concluído em {new Date(progresso.dataConclusao).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>

                {progresso.concluido && (
                  <Link
                    href={`/certificados/${id}`}
                    className="mt-4 w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition flex items-center justify-center gap-2"
                  >
                    🏆 Ver Certificado
                  </Link>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-xl">⏱️</span>
                <span className="font-medium">{curso.cargaHoraria}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">�</span>
                <span className="font-medium">{totalModulos} {totalModulos === 1 ? 'módulo' : 'módulos'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🎥</span>
                <span className="font-medium">{totalAulas} {totalAulas === 1 ? 'aula' : 'aulas'}</span>
              </div>
            </div>

            <div className="prose prose-lg max-w-none mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Sobre o Curso</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {curso.descricao}
              </p>
            </div>

            {/* Conteúdo do Curso - Módulos e Aulas */}
            {curso.modulos && curso.modulos.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Conteúdo do Curso</h2>
                
                {!session && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-blue-800 text-sm">
                      ℹ️ <Link href="/auth/signin" className="font-semibold underline">Faça login</Link> para acessar o conteúdo completo das aulas.
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {curso.modulos.map((modulo, index) => (
                    <div key={modulo.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleModulo(modulo.id)}
                        className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between text-left"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {modulo.ordem}. {modulo.titulo}
                          </h3>
                          {modulo.descricao && (
                            <p className="text-sm text-gray-600 mt-1">{modulo.descricao}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2">
                            <p className="text-xs text-gray-500">
                              {modulo.aulas?.length || 0} {modulo.aulas?.length === 1 ? 'aula' : 'aulas'}
                            </p>
                            {modulo.quiz && (
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                                📝 Quiz disponível
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-gray-400 text-xl ml-4">
                          {expandedModulos.has(modulo.id) ? '−' : '+'}
                        </span>
                      </button>

                      {expandedModulos.has(modulo.id) && modulo.aulas && modulo.aulas.length > 0 && (
                        <div className="bg-white divide-y divide-gray-100">
                          {modulo.aulas.map((aula) => (
                            <Link
                              key={aula.id}
                              href={session ? `/cursos/${curso.id}/aulas/${aula.id}` : '/auth/signin'}
                              className="block px-6 py-4 hover:bg-gray-50 transition-colors group"
                            >
                              <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                                  {aula.ordem}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                                    {aula.titulo}
                                  </h4>
                                  {aula.descricao && (
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                      {aula.descricao}
                                    </p>
                                  )}
                                  {aula.duracao && (
                                    <p className="text-xs text-gray-500 mt-2">
                                      🕐 {aula.duracao}
                                    </p>
                                  )}
                                </div>
                                {session && aula.videoUrl && (
                                  <div className="flex-shrink-0">
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                      ▶ Assistir
                                    </span>
                                  </div>
                                )}
                                {!session && (
                                  <div className="flex-shrink-0">
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                                      🔒 Bloqueado
                                    </span>
                                  </div>
                                )}
                              </div>
                            </Link>
                          ))}
                          
                          {/* Quiz do Módulo */}
                          {modulo.quiz && (
                            <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-t-2 border-purple-200">
                              <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                  📝
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-gray-900 text-lg mb-1">
                                    {modulo.quiz.titulo}
                                  </h4>
                                  {modulo.quiz.descricao && (
                                    <p className="text-sm text-gray-700 mb-2">
                                      {modulo.quiz.descricao}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                                    {modulo.quiz.tempo && (
                                      <span>⏱️ {modulo.quiz.tempo} min</span>
                                    )}
                                    <span>📊 {modulo.quiz.questoes?.length || 0} questões</span>
                                    <span>🏆 {modulo.quiz.pontos} pontos</span>
                                  </div>
                                  
                                  {!session ? (
                                    <Link
                                      href="/auth/signin"
                                      className="inline-block px-4 py-2 bg-gray-400 text-white rounded-lg font-medium text-sm cursor-not-allowed"
                                    >
                                      🔒 Faça login para fazer o quiz
                                    </Link>
                                  ) : !moduloConcluido(modulo.id) ? (
                                    <div className="space-y-2">
                                      <div className="inline-block px-4 py-2 bg-gray-300 text-gray-600 rounded-lg font-medium text-sm cursor-not-allowed">
                                        🔒 Quiz bloqueado
                                      </div>
                                      <p className="text-xs text-gray-600">
                                        Complete todas as {modulo.aulas.length} aulas deste módulo para desbloquear o quiz.
                                        Progresso: {modulosProgresso[modulo.id]?.concluidas || 0}/{modulosProgresso[modulo.id]?.total || 0} aulas
                                      </p>
                                    </div>
                                  ) : (
                                    <Link
                                      href={`/cursos/${curso.id}/modulos/${modulo.id}/quiz`}
                                      className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg font-medium text-sm hover:bg-purple-700 transition"
                                    >
                                      🎯 Iniciar Quiz
                                    </Link>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!curso.modulos || curso.modulos.length === 0) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-8">
                <p className="text-yellow-800">
                  ⚠️ Este curso ainda não possui módulos cadastrados. Conteúdo em breve!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Seção de cursos relacionados */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Outros Cursos</h2>
          <Link
            href="/cursos"
            className="inline-block px-6 py-3 bg-white text-primary border-2 border-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition"
          >
            Ver todos os cursos →
          </Link>
        </div>
      </div>
    </div>
  );
}
