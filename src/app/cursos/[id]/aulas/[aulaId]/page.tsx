"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Aula {
  id: string;
  titulo: string;
  descricao?: string;
  ordem: number;
  duracao?: string;
  videoUrl?: string;
  conteudo?: string;
  tipo: string;
  quizId?: string;
  modulo: {
    id: string;
    titulo: string;
    curso: {
      id: string;
      titulo: string;
    };
  };
}

interface Quiz {
  id: string;
  titulo: string;
  descricao?: string;
  tempo?: number;
  pontos: number;
  questoes: Questao[];
}

interface Questao {
  id: string;
  pergunta: string;
  tipo: string;
  ordem: number;
  opcoes: Opcao[];
}

interface Opcao {
  id: string;
  texto: string;
  correta: boolean;
  ordem: number;
}

export default function AulaPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const cursoId = params.id as string;
  const aulaId = params.aulaId as string;

  const [aula, setAula] = useState<Aula | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [concluido, setConcluido] = useState(false);
  const [marcandoConcluido, setMarcandoConcluido] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [submetendo, setSubmetendo] = useState(false);
  const [resultado, setResultado] = useState<{ acertos: number; total: number; pontos: number } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated") {
      loadAula();
    }
  }, [status, aulaId]);

  const loadAula = async () => {
    try {
      const res = await fetch(`/api/aulas/${aulaId}`, {
        credentials: 'include',
        cache: 'no-store'
      });

      if (!res.ok) {
        throw new Error("Aula não encontrada");
      }

      const data = await res.json();
      setAula(data);

      // Se a aula tem quiz, carregar o quiz
      if (data.tipo === 'quiz' && data.quizId) {
        await loadQuiz(data.quizId);
      }

      // Carregar progresso
      const progressoRes = await fetch(`/api/aulas/${aulaId}/progresso`, {
        credentials: 'include',
        cache: 'no-store'
      });

      if (progressoRes.ok) {
        const progressoData = await progressoRes.json();
        setConcluido(progressoData.concluido);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao carregar aula");
    } finally {
      setLoading(false);
    }
  };

  const loadQuiz = async (quizId: string) => {
    try {
      const res = await fetch(`/api/admin/quizzes/${quizId}`, {
        credentials: 'include',
        cache: 'no-store'
      });

      if (res.ok) {
        const data = await res.json();
        setQuiz(data);
      }
    } catch (err) {
      console.error('Erro ao carregar quiz:', err);
    }
  };

  const handleRespostaChange = (questaoId: string, opcaoId: string) => {
    setRespostas(prev => ({
      ...prev,
      [questaoId]: opcaoId
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;

    // Validar se todas as questões foram respondidas
    const questoesNaoRespondidas = quiz.questoes.filter(q => !respostas[q.id]);
    if (questoesNaoRespondidas.length > 0) {
      alert(`Por favor, responda todas as questões! Faltam ${questoesNaoRespondidas.length} questão(ões).`);
      return;
    }

    setSubmetendo(true);
    try {
      // Calcular resultado localmente
      let acertos = 0;
      quiz.questoes.forEach(questao => {
        const respostaSelecionada = respostas[questao.id];
        const opcaoCorreta = questao.opcoes.find(o => o.correta);
        if (respostaSelecionada === opcaoCorreta?.id) {
          acertos++;
        }
      });

      const total = quiz.questoes.length;
      const pontos = Math.round((acertos / total) * quiz.pontos);

      setResultado({ acertos, total, pontos });

      // Marcar aula como concluída se passou (>= 70%)
      if ((acertos / total) >= 0.7) {
        await handleMarcarConcluido();
      }
    } catch (error: any) {
      alert('Erro ao submeter quiz: ' + error.message);
    } finally {
      setSubmetendo(false);
    }
  };

  const handleMarcarConcluido = async () => {
    setMarcandoConcluido(true);
    try {
      const res = await fetch(`/api/aulas/${aulaId}/progresso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          concluido: !concluido
        })
      });

      if (!res.ok) {
        throw new Error('Erro ao atualizar progresso');
      }

      const data = await res.json();
      setConcluido(!concluido);

      // Mostrar feedback
      if (!concluido) {
        alert(`✅ Aula concluída! +10 pontos\n\nProgresso do curso: ${data.progresso.cursoProgresso}%`);
      }
    } catch (error: any) {
      alert('Erro ao atualizar progresso: ' + error.message);
    } finally {
      setMarcandoConcluido(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando aula...</p>
        </div>
      </div>
    );
  }

  if (error || !aula) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🎥</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Aula não encontrada</h1>
          <p className="text-gray-600 mb-6">{error || "A aula que você procura não existe."}</p>
          <Link
            href={`/cursos/${cursoId}`}
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition"
          >
            ← Voltar ao curso
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/cursos/${cursoId}`}
                className="text-gray-600 hover:text-primary transition"
              >
                ← Voltar
              </Link>
              <div className="border-l border-gray-300 pl-4">
                <p className="text-sm text-gray-500">
                  {aula.modulo.curso.titulo}
                </p>
                <h1 className="text-lg font-semibold text-gray-900">
                  {aula.titulo}
                </h1>
              </div>
            </div>
            {aula.duracao && (
              <div className="text-sm text-gray-600">
                🕐 {aula.duracao}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Vídeo e Conteúdo */}
          <div className="lg:col-span-2 space-y-6">
            {/* Player de Vídeo ou Quiz */}
            {aula.tipo === 'quiz' && quiz ? (
              <div className="bg-white rounded-lg shadow-md p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">📝 {quiz.titulo}</h2>
                  {quiz.descricao && (
                    <p className="text-gray-600 mb-4">{quiz.descricao}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>⭐ {quiz.pontos} pontos</span>
                    {quiz.tempo && <span>⏱️ {quiz.tempo} minutos</span>}
                    <span>❓ {quiz.questoes.length} questões</span>
                  </div>
                </div>

                {resultado ? (
                  <div className="text-center py-8">
                    <div className={`text-6xl mb-4 ${resultado.acertos / resultado.total >= 0.7 ? 'text-green-500' : 'text-orange-500'}`}>
                      {resultado.acertos / resultado.total >= 0.7 ? '🎉' : '📚'}
                    </div>
                    <h3 className="text-2xl font-bold mb-2">
                      {resultado.acertos / resultado.total >= 0.7 ? 'Parabéns!' : 'Continue estudando!'}
                    </h3>
                    <p className="text-xl text-gray-700 mb-2">
                      Você acertou {resultado.acertos} de {resultado.total} questões
                    </p>
                    <p className="text-lg text-primary font-semibold mb-6">
                      +{resultado.pontos} pontos
                    </p>
                    <button
                      onClick={() => {
                        setResultado(null);
                        setRespostas({});
                      }}
                      className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition"
                    >
                      🔄 Tentar novamente
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {quiz.questoes.map((questao, index) => (
                      <div key={questao.id} className="border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          {index + 1}. {questao.pergunta}
                        </h3>
                        <div className="space-y-3">
                          {questao.opcoes.map((opcao) => (
                            <label
                              key={opcao.id}
                              className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${
                                respostas[questao.id] === opcao.id
                                  ? 'border-primary bg-primary/5'
                                  : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="radio"
                                name={questao.id}
                                value={opcao.id}
                                checked={respostas[questao.id] === opcao.id}
                                onChange={() => handleRespostaChange(questao.id, opcao.id)}
                                className="w-5 h-5 text-primary"
                              />
                              <span className="text-gray-800">{opcao.texto}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={handleSubmitQuiz}
                      disabled={submetendo || Object.keys(respostas).length < quiz.questoes.length}
                      className="w-full px-6 py-4 bg-primary text-white rounded-lg font-bold text-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submetendo ? 'Submetendo...' : '✅ Submeter Quiz'}
                    </button>
                  </div>
                )}
              </div>
            ) : aula.videoUrl ? (
              <div className="bg-black rounded-lg overflow-hidden aspect-video">
                <iframe
                  src={aula.videoUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={aula.titulo}
                />
              </div>
            ) : (
              <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">
                    {aula.tipo === 'quiz' ? '📝' : '🎥'}
                  </div>
                  <p className="text-gray-600">
                    {aula.tipo === 'quiz' ? 'Carregando quiz...' : 'Conteúdo não disponível'}
                  </p>
                </div>
              </div>
            )}

            {/* Informações da Aula */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                  Aula {aula.ordem}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-600">
                  Módulo: {aula.modulo.titulo}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {aula.titulo}
              </h2>

              {aula.descricao && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Sobre esta aula
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {aula.descricao}
                  </p>
                </div>
              )}

              {aula.conteudo && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Material de Apoio
                  </h3>
                  <div className="prose prose-sm max-w-none text-gray-700">
                    <div dangerouslySetInnerHTML={{ __html: aula.conteudo }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Próximas Aulas */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24 space-y-4">
              {/* Botão Marcar como Concluído */}
              <button
                onClick={handleMarcarConcluido}
                disabled={marcandoConcluido}
                className={`w-full px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                  concluido
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-primary text-white hover:bg-primary/90'
                }`}
              >
                {marcandoConcluido ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                    Salvando...
                  </>
                ) : concluido ? (
                  <>
                    ✅ Aula Concluída
                  </>
                ) : (
                  <>
                    ✓ Marcar como Concluída
                  </>
                )}
              </button>

              {concluido && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">🎉</div>
                  <p className="text-sm font-medium text-green-800">
                    Parabéns! Você ganhou 10 pontos!
                  </p>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📚 Conteúdo do Curso
                </h3>
                <Link
                  href={`/cursos/${cursoId}`}
                  className="w-full px-4 py-3 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition font-medium text-center block"
                >
                  Ver Todos os Módulos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
