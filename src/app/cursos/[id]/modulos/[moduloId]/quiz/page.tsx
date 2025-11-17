"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

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
  quiz: Quiz;
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const cursoId = params.id as string;
  const moduloId = params.moduloId as string;

  const [modulo, setModulo] = useState<Modulo | null>(null);
  const [loading, setLoading] = useState(true);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [submetido, setSubmetido] = useState(false);
  const [resultado, setResultado] = useState<{
    corretas: number;
    total: number;
    pontuacao: number;
    aprovado: boolean;
    percentual: number;
    finalizadaEm?: Date;
    respostasDetalhadas: Array<{
      questaoId: string;
      opcaoId: string;
      correta: boolean;
    }>;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      loadQuiz();
    }
  }, [status, moduloId]);

  const loadQuiz = async () => {
    try {
      const res = await fetch(`/api/cursos/${cursoId}`, {
        cache: 'no-store'
      });

      if (!res.ok) throw new Error("Erro ao carregar curso");

      const curso = await res.json();
      const mod = curso.modulos?.find((m: any) => m.id === moduloId);

      if (!mod || !mod.quiz) {
        throw new Error("Quiz não encontrado");
      }

      setModulo(mod);
      
      // Carregar tentativa anterior se existir
      await loadTentativaAnterior(mod.quiz.id);
    } catch (error) {
      console.error('Erro ao carregar quiz:', error);
      alert('Erro ao carregar quiz');
      router.push(`/cursos/${cursoId}`);
    } finally {
      setLoading(false);
    }
  };

  const loadTentativaAnterior = async (quizId: string) => {
    try {
      const res = await fetch(`/api/quizzes/${quizId}/submeter`, {
        credentials: 'include',
        cache: 'no-store'
      });

      if (!res.ok) return;

      const data = await res.json();
      
      if (data.tentativa) {
        // Carregar respostas e resultado da tentativa anterior
        setRespostas(data.tentativa.respostas);
        setResultado({
          corretas: data.tentativa.corretas,
          total: data.tentativa.total,
          pontuacao: data.tentativa.pontuacao,
          aprovado: data.tentativa.aprovado,
          percentual: data.tentativa.percentual,
          finalizadaEm: data.tentativa.finalizadaEm ? new Date(data.tentativa.finalizadaEm) : undefined,
          respostasDetalhadas: data.tentativa.respostasDetalhadas
        });
        setSubmetido(true);
        
        console.log('✅ Tentativa anterior carregada');
      }
    } catch (error) {
      console.error('Erro ao carregar tentativa anterior:', error);
    }
  };

  const handleResposta = (questaoId: string, opcaoId: string) => {
    if (!submetido) {
      setRespostas({
        ...respostas,
        [questaoId]: opcaoId
      });
    }
  };

  const getQuestaoStatus = (questaoId: string): 'correta' | 'incorreta' | null => {
    if (!submetido || !resultado) return null;
    
    const respostaDetalhada = resultado.respostasDetalhadas.find(r => r.questaoId === questaoId);
    if (!respostaDetalhada) return null;
    
    return respostaDetalhada.correta ? 'correta' : 'incorreta';
  };

  const getOpcaoClass = (questaoId: string, opcaoId: string, isSelected: boolean): string => {
    if (!submetido) {
      return isSelected
        ? 'border-purple-600 bg-purple-50'
        : 'border-gray-200 hover:border-purple-300 bg-white';
    }

    // Após submissão - mostrar feedback
    const status = getQuestaoStatus(questaoId);
    const respostaDetalhada = resultado?.respostasDetalhadas.find(r => r.questaoId === questaoId);
    
    if (isSelected) {
      if (status === 'correta') {
        return 'border-green-500 bg-green-50 ring-2 ring-green-500';
      } else {
        return 'border-red-500 bg-red-50 ring-2 ring-red-500';
      }
    }

    return 'border-gray-200 bg-gray-50 opacity-60';
  };

  const handleSubmit = async () => {
    if (!modulo?.quiz) return;

    const totalQuestoes = modulo.quiz.questoes.length;
    const respondidasCount = Object.keys(respostas).length;

    if (respondidasCount < totalQuestoes) {
      alert(`Você precisa responder todas as ${totalQuestoes} questões!`);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/quizzes/${modulo.quiz.id}/submeter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ respostas })
      });

      if (!res.ok) throw new Error('Erro ao submeter quiz');

      const data = await res.json();
      setResultado(data);
      setSubmetido(true);
    } catch (error) {
      console.error('Erro ao submeter quiz:', error);
      alert('Erro ao submeter quiz. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando quiz...</p>
        </div>
      </div>
    );
  }

  if (!modulo || !modulo.quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">Quiz não encontrado</p>
          <Link href={`/cursos/${cursoId}`} className="text-primary hover:underline">
            ← Voltar ao curso
          </Link>
        </div>
      </div>
    );
  }

  const quiz = modulo.quiz;
  const totalQuestoes = quiz.questoes.length;
  const respondidasCount = Object.keys(respostas).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link 
          href={`/cursos/${cursoId}`}
          className="inline-flex items-center text-purple-700 hover:text-purple-900 font-medium mb-6"
        >
          ← Voltar ao curso
        </Link>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-3xl">
              📝
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{quiz.titulo}</h1>
              <p className="text-gray-600 mb-4">{modulo.titulo}</p>
              {quiz.descricao && (
                <p className="text-gray-700 mb-4">{quiz.descricao}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {quiz.tempo && (
                  <span className="flex items-center gap-1">
                    ⏱️ <strong>{quiz.tempo}</strong> minutos
                  </span>
                )}
                <span className="flex items-center gap-1">
                  📊 <strong>{totalQuestoes}</strong> questões
                </span>
                <span className="flex items-center gap-1">
                  🏆 <strong>{quiz.pontos}</strong> pontos
                </span>
              </div>
            </div>
          </div>

          {!submetido && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                💡 <strong>Dica:</strong> Leia cada questão com atenção. Você pode revisar suas respostas antes de submeter.
              </p>
            </div>
          )}
        </div>

        {/* Questões */}
        <div className="space-y-6">
          {quiz.questoes.map((questao, index) => (
            <div key={questao.id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {questao.pergunta}
                  </h3>

                  <div className="space-y-3">
                    {questao.opcoes.map((opcao) => {
                      const isSelected = respostas[questao.id] === opcao.id;
                      const status = getQuestaoStatus(questao.id);
                      
                      return (
                        <button
                          key={opcao.id}
                          onClick={() => handleResposta(questao.id, opcao.id)}
                          disabled={submetido}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${getOpcaoClass(questao.id, opcao.id, isSelected)} ${submetido ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                isSelected 
                                  ? submetido && status === 'correta'
                                    ? 'border-green-600 bg-green-600'
                                    : submetido && status === 'incorreta'
                                    ? 'border-red-600 bg-red-600'
                                    : 'border-purple-600 bg-purple-600'
                                  : 'border-gray-300'
                              }`}>
                                {isSelected && (
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                )}
                              </div>
                              <span className="text-gray-800">{opcao.texto}</span>
                            </div>
                            {submetido && isSelected && status === 'correta' && (
                              <span className="text-green-600 font-bold text-lg">✓</span>
                            )}
                            {submetido && isSelected && status === 'incorreta' && (
                              <span className="text-red-600 font-bold text-lg">✗</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Barra de progresso e botão de submit */}
        {!submetido && (
          <div className="sticky bottom-0 mt-8 bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Progresso: {respondidasCount} de {totalQuestoes} questões respondidas
                </p>
                <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-600 transition-all"
                    style={{ width: `${(respondidasCount / totalQuestoes) * 100}%` }}
                  ></div>
                </div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={respondidasCount < totalQuestoes || submitting}
                className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Enviando...' : 'Enviar Respostas'}
              </button>
            </div>
          </div>
        )}

        {/* Resultado */}
        {submetido && resultado && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-8">
            <div className="text-center">
              <div className={`text-6xl mb-4 ${resultado.aprovado ? '🎉' : '😔'}`}>
                {resultado.aprovado ? '🎉' : '😔'}
              </div>
              <h2 className={`text-3xl font-bold mb-2 ${
                resultado.aprovado ? 'text-green-600' : 'text-orange-600'
              }`}>
                {resultado.aprovado ? 'Parabéns!' : 'Continue tentando!'}
              </h2>
              <p className="text-gray-600 mb-2">
                Você acertou <strong>{resultado.corretas}</strong> de <strong>{resultado.total}</strong> questões
              </p>
              <p className="text-sm text-gray-500 mb-6">
                {resultado.percentual.toFixed(1)}% de aproveitamento
              </p>

              {resultado.finalizadaEm && (
                <p className="text-xs text-gray-400 mb-4">
                  Tentativa realizada em {new Date(resultado.finalizadaEm).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
              
              <div className="inline-block bg-purple-100 rounded-lg px-8 py-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Pontuação obtida</p>
                <p className="text-4xl font-bold text-purple-600">{resultado.pontuacao} pts</p>
              </div>

              <div className="flex gap-4 justify-center">
                <Link
                  href={`/cursos/${cursoId}`}
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Voltar ao Curso
                </Link>
                <button
                  onClick={() => {
                    setSubmetido(false);
                    setResultado(null);
                    setRespostas({});
                  }}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
                >
                  {resultado.aprovado ? 'Refazer Quiz' : 'Tentar Novamente'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
