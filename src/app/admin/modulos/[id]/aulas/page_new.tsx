"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

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
  const moduloId = params.id as string;

  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("video");
  const [ordem, setOrdem] = useState("");
  const [duracao, setDuracao] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAulas();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo.trim() || !tipo.trim()) {
      alert("Título e tipo são obrigatórios");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

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
          videoUrl: videoUrl.trim() || undefined,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Carregando aulas...</p>
      </div>
    );
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL do Vídeo {tipo === 'video' && '*'}
          </label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/embed/... ou https://player.vimeo.com/video/..."
            className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={submitting}
            required={tipo === 'video'}
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 Use o formato "embed" do YouTube ou Vimeo para melhor compatibilidade
          </p>
        </div>

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
