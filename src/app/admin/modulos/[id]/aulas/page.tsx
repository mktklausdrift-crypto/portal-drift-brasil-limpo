"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Aula {
  id: string;
  titulo: string;
  descricao?: string;
  tipo: string;
  ordem: number;
  duracao?: string;
  videoUrl?: string;
}

export default function AulasPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const moduloId = params.id as string;

  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quizzes, setQuizzes] = useState<Array<{id: string, titulo: string}>>([]);

  // Form state
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("video");
  const [ordem, setOrdem] = useState("");
  const [duracao, setDuracao] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [quizId, setQuizId] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAulas();
    loadQuizzes();
  }, [moduloId]);

  const loadAulas = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/modules/${moduloId}/lessons`, {
        credentials: 'include',
        cache: 'no-store'
      });

      if (!res.ok) {
        throw new Error('Erro ao carregar aulas');
      }

      const data = await res.json();
      setAulas(data);
    } catch (error) {
      console.error("Erro ao carregar aulas:", error);
      setError("Erro ao carregar aulas");
    } finally {
      setLoading(false);
    }
  };

  const loadQuizzes = async () => {
    try {
      const res = await fetch('/api/admin/quizzes?limit=100', {
        credentials: 'include',
        cache: 'no-store'
      });

      if (res.ok) {
        const data = await res.json();
        setQuizzes(data.quizzes || []);
      }
    } catch (error) {
      console.error("Erro ao carregar quizzes:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo.trim() || !tipo.trim()) {
      alert("Título e tipo são obrigatórios");
      return;
    }

    // Validar se há URL ou arquivo de vídeo quando tipo é video
    if (tipo === 'video' && !videoUrl.trim() && !videoFile) {
      alert("Para aulas de vídeo, forneça uma URL ou faça upload do arquivo");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      let finalVideoUrl = videoUrl.trim();

      // Se há arquivo, fazer upload primeiro
      if (videoFile) {
        const formData = new FormData();
        formData.append('video', videoFile);

        const uploadRes = await fetch('/api/admin/upload/video', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error('Erro ao fazer upload do vídeo');
        }

        const uploadData = await uploadRes.json();
        finalVideoUrl = uploadData.url;
      }

      const res = await fetch(`/api/admin/modules/${moduloId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify({
          titulo: titulo.trim(),
          descricao: descricao.trim() || undefined,
          tipo: tipo.trim(),
          ordem: ordem ? parseInt(ordem) : undefined,
          duracao: duracao.trim() || undefined,
          videoUrl: finalVideoUrl || undefined,
          quizId: (tipo === 'quiz' && quizId) ? quizId : undefined,
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erro ao criar aula');
      }

      // Limpar formulário
      setTitulo("");
      setDescricao("");
      setTipo("video");
      setOrdem("");
      setDuracao("");
      setVideoUrl("");
      setQuizId("");
      setVideoFile(null);
      setUploadProgress(0);

      // Recarregar aulas
      await loadAulas();

      alert("Aula criada com sucesso!");
    } catch (error: any) {
      console.error("Erro ao criar aula:", error);
      setError(error.message || "Erro ao criar aula");
      alert(`Erro: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta aula?")) return;

    try {
      const res = await fetch(`/api/admin/lessons/${id}`, {
        method: "DELETE",
        credentials: 'include',
        cache: 'no-store'
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erro ao excluir aula');
      }

      alert("Aula excluída com sucesso!");
      await loadAulas();
    } catch (error: any) {
      console.error("Erro ao excluir aula:", error);
      alert(`Erro ao excluir: ${error.message}`);
    }
  };

  // Verificar autenticação
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Aulas do Módulo</h1>
          <p className="text-sm text-gray-600">Crie e gerencie aulas com vídeos e materiais.</p>
        </div>
        <Link
          href="/admin/cursos"
          className="text-sm px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
        >
          ← Voltar
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Formulário de nova aula */}
      <form onSubmit={handleSubmit} className="p-6 border rounded-lg space-y-4 bg-white shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Nova Aula</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título *
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Introdução ao Diagnóstico"
              className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
              required
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo *
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
              required
              disabled={submitting}
            >
              <option value="video">🎥 Vídeo</option>
              <option value="texto">📝 Texto</option>
              <option value="material">📄 Material</option>
              <option value="quiz">❓ Quiz</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ordem
            </label>
            <input
              type="number"
              value={ordem}
              onChange={(e) => setOrdem(e.target.value)}
              placeholder="1, 2, 3..."
              className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
              min="0"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duração
            </label>
            <input
              type="text"
              value={duracao}
              onChange={(e) => setDuracao(e.target.value)}
              placeholder="Ex: 15:30 ou 1h 30min"
              className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={submitting}
            />
          </div>
        </div>

        {/* Campo de seleção de quiz */}
        {tipo === 'quiz' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selecionar Quiz *
            </label>
            <select
              value={quizId}
              onChange={(e) => setQuizId(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
              required={tipo === 'quiz'}
              disabled={submitting}
            >
              <option value="">Selecione um quiz...</option>
              {quizzes.map((quiz) => (
                <option key={quiz.id} value={quiz.id}>
                  {quiz.titulo}
                </option>
              ))}
            </select>
            {quizzes.length === 0 && (
              <p className="text-xs text-orange-600 mt-1">
                ⚠️ Nenhum quiz disponível. <Link href="/admin/quizzes/novo" className="underline">Criar novo quiz</Link>
              </p>
            )}
          </div>
        )}

        {tipo === 'video' && (
          <>
          <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL do Vídeo {tipo === 'video' && !videoFile && '*'}
          </label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/embed/... ou https://player.vimeo.com/video/..."
            className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={submitting || !!videoFile}
            required={tipo === 'video' && !videoFile}
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 Use o formato "embed" do YouTube ou Vimeo para melhor compatibilidade
          </p>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-center mb-2">
            <span className="text-sm text-gray-500">ou</span>
          </div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload de Vídeo {tipo === 'video' && !videoUrl && '*'}
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary transition-colors">
            <div className="space-y-1 text-center">
              {videoFile ? (
                <div className="flex flex-col items-center">
                  <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div className="text-sm text-gray-600 mt-2">
                    <p className="font-medium">{videoFile.name}</p>
                    <p className="text-xs text-gray-500">{(videoFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVideoFile(null)}
                    className="mt-2 text-xs text-red-600 hover:text-red-800"
                  >
                    Remover arquivo
                  </button>
                </div>
              ) : (
                <>
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none">
                      <span>Selecionar vídeo</span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setVideoFile(file);
                            setVideoUrl(""); // Limpar URL se arquivo for selecionado
                          }
                        }}
                        className="sr-only"
                        disabled={submitting || !!videoUrl}
                      />
                    </label>
                    <p className="pl-1">ou arraste e solte</p>
                  </div>
                  <p className="text-xs text-gray-500">MP4, WebM, MOV até 500MB</p>
                </>
              )}
            </div>
          </div>
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 text-center mt-1">{uploadProgress}% enviado</p>
            </div>
          )}
        </div>
        </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descrição opcional da aula"
            className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
            rows={3}
            disabled={submitting}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2 bg-primary text-white rounded hover:bg-primary/90 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Criando..." : "Criar Aula"}
        </button>
      </form>

      {/* Lista de aulas */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Aulas Cadastradas ({aulas.length})
        </h2>

        {aulas.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500">Nenhuma aula cadastrada ainda.</p>
            <p className="text-sm text-gray-400 mt-2">Use o formulário acima para criar a primeira aula.</p>
          </div>
        ) : (
          aulas.map((aula) => (
            <div key={aula.id} className="p-4 border rounded-lg bg-white shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded">
                      {aula.tipo === 'video' && '🎥'}
                      {aula.tipo === 'texto' && '📝'}
                      {aula.tipo === 'material' && '📄'}
                      {aula.tipo === 'quiz' && '❓'}
                      {' '}{aula.tipo}
                    </span>
                    <span className="text-xs text-gray-500">Ordem: {aula.ordem}</span>
                    {aula.duracao && (
                      <span className="text-xs text-gray-500">• {aula.duracao}</span>
                    )}
                  </div>
                  <h3 className="font-medium text-gray-800">
                    {aula.titulo}
                  </h3>
                  {aula.descricao && (
                    <p className="text-sm text-gray-500 mt-1">{aula.descricao}</p>
                  )}
                  {aula.videoUrl && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-gray-500">🔗</span>
                      <a
                        href={aula.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline truncate max-w-md"
                      >
                        {aula.videoUrl}
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <Link
                    href={`/admin/aulas/${aula.id}/materiais`}
                    className="text-sm px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition font-medium"
                  >
                    📚 Materiais
                  </Link>
                  <button
                    onClick={() => handleDelete(aula.id)}
                    className="text-sm px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition font-medium"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
