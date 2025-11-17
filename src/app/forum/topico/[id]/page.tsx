"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Resposta {
  id: string;
  conteudo: string;
  autor: {
    name: string;
    role: string;
  };
  createdAt: string;
}

interface Topico {
  id: string;
  titulo: string;
  conteudo: string;
  autor: {
    name: string;
    role: string;
  };
  respostas: Resposta[];
  createdAt: string;
}

export default function TopicoDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const id = params.id as string;
  
  const [topico, setTopico] = useState<Topico | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resposta, setResposta] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const fetchTopico = async () => {
      try {
        const res = await fetch(`/api/forum/topicos/${id}`);
        if (!res.ok) throw new Error("Tópico não encontrado");
        const data = await res.json();
        setTopico(data);
      } catch (err: any) {
        setError(err.message || "Erro ao carregar tópico");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTopico();
  }, [id]);

  const handleEnviarResposta = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    if (!resposta.trim()) return;

    setEnviando(true);
    try {
      const res = await fetch(`/api/forum/topicos/${id}/respostas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conteudo: resposta }),
      });

      if (!res.ok) throw new Error("Erro ao enviar resposta");

      const novaResposta = await res.json();
      setTopico(prev => prev ? {
        ...prev,
        respostas: [...prev.respostas, novaResposta]
      } : null);
      setResposta("");
    } catch (err: any) {
      alert(err.message || "Erro ao enviar resposta");
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando tópico...</p>
        </div>
      </div>
    );
  }

  if (error || !topico) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">💬</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Tópico não encontrado</h1>
          <p className="text-gray-600 mb-6">{error || "O tópico que você procura não existe."}</p>
          <Link href="/forum" className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition">
            ← Voltar para o fórum
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/forum" className="text-primary hover:underline mb-6 inline-block font-medium">
          ← Voltar para o fórum
        </Link>

        {/* Tópico Principal */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {topico.titulo}
              </h1>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="font-medium">{topico.autor.name}</span>
                <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-semibold">
                  {topico.autor.role}
                </span>
                <span>•</span>
                <time dateTime={topico.createdAt}>
                  {new Date(topico.createdAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </div>
            </div>
          </div>

          <div className="prose max-w-none text-gray-700 leading-relaxed">
            <p className="whitespace-pre-line">{topico.conteudo}</p>
          </div>
        </div>

        {/* Respostas */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            💬 Respostas ({topico.respostas.length})
          </h2>

          {topico.respostas.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
              <p>Nenhuma resposta ainda. Seja o primeiro a responder!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topico.respostas.map((resp) => (
                <div key={resp.id} className="bg-white rounded-xl shadow p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-semibold text-gray-900">{resp.autor.name}</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-semibold">
                      {resp.autor.role}
                    </span>
                    <span className="text-gray-400">•</span>
                    <time className="text-sm text-gray-500" dateTime={resp.createdAt}>
                      {new Date(resp.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                  <p className="text-gray-700 whitespace-pre-line">{resp.conteudo}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Formulário de Resposta */}
        {session ? (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              ✍️ Sua Resposta
            </h3>
            <form onSubmit={handleEnviarResposta}>
              <textarea
                value={resposta}
                onChange={(e) => setResposta(e.target.value)}
                placeholder="Digite sua resposta..."
                rows={6}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-4"
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/forum")}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={enviando || !resposta.trim()}
                  className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enviando ? "Enviando..." : "Enviar Resposta"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-600 mb-4">
              Faça login ou crie sua conta para participar da discussão
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/auth/signin"
                className="inline-block px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-bold hover:bg-gray-300 transition"
              >
                Fazer Login
              </Link>
              <Link
                href="/auth/signup"
                className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-hover transition"
              >
                Criar Conta
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
