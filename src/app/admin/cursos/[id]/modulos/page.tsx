"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Modulo {
  id: string;
  titulo: string;
  descricao?: string;
  ordem: number;
  quizId?: string;
  _count?: { aulas: number };
}

export default function ModulosPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const cursoId = params.id as string;
  
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quizzes, setQuizzes] = useState<Array<{id: string, titulo: string}>>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [ordem, setOrdem] = useState("");
  const [quizId, setQuizId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Edit form state
  const [editTitulo, setEditTitulo] = useState("");
  const [editDescricao, setEditDescricao] = useState("");
  const [editOrdem, setEditOrdem] = useState("");
  const [editQuizId, setEditQuizId] = useState("");

  useEffect(() => {
    if (status === 'authenticated') {
      loadModulos();
      loadQuizzes();
    } else if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [cursoId, status]);

  const loadModulos = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/courses/${cursoId}/modules`, {
        credentials: 'include',
        cache: 'no-store'
      });
      
      if (!res.ok) {
        throw new Error('Erro ao carregar módulos');
      }
      
      const data = await res.json();
      setModulos(data);
    } catch (error) {
      console.error("Erro ao carregar módulos:", error);
      setError("Erro ao carregar módulos");
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
        console.log('Quizzes carregados:', data);
        setQuizzes(data.quizzes || []);
      } else {
        console.error('Erro ao carregar quizzes - Status:', res.status);
      }
    } catch (error) {
      console.error("Erro ao carregar quizzes:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!titulo.trim()) {
      alert("Título é obrigatório");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      
      const requestBody = {
        titulo: titulo.trim(),
        descricao: descricao.trim() || undefined,
        ordem: ordem ? parseInt(ordem) : undefined,
        quizId: quizId || undefined
      };
      
      console.log('Enviando módulo:', requestBody);
      
      const res = await fetch(`/api/admin/courses/${cursoId}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify(requestBody)
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Erro na resposta:', errorData);
        throw new Error(errorData.error || 'Erro ao criar módulo');
      }

      const result = await res.json();
      console.log('Módulo criado com sucesso:', result);

      // Limpar formulário
      setTitulo("");
      setDescricao("");
      setOrdem("");
      setQuizId("");
      
      // Recarregar módulos
      await loadModulos();
      
      alert("Módulo criado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao criar módulo:", error);
      setError(error.message || "Erro ao criar módulo");
      alert(`Erro: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este módulo?")) return;

    try {
      const res = await fetch(`/api/admin/modules/${id}`, {
        method: "DELETE",
        credentials: 'include',
        cache: 'no-store'
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erro ao excluir módulo');
      }

      alert("Módulo excluído com sucesso!");
      await loadModulos();
    } catch (error: any) {
      console.error("Erro ao excluir módulo:", error);
      alert(`Erro ao excluir: ${error.message}`);
    }
  };

  const handleEdit = (modulo: Modulo) => {
    setEditingId(modulo.id);
    setEditTitulo(modulo.titulo);
    setEditDescricao(modulo.descricao || "");
    setEditOrdem(modulo.ordem.toString());
    setEditQuizId(modulo.quizId || "");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitulo("");
    setEditDescricao("");
    setEditOrdem("");
    setEditQuizId("");
  };

  const handleSaveEdit = async (id: string) => {
    if (!editTitulo.trim()) {
      alert("Título é obrigatório");
      return;
    }

    try {
      const requestBody = {
        titulo: editTitulo.trim(),
        descricao: editDescricao.trim() || undefined,
        ordem: editOrdem ? parseInt(editOrdem) : undefined,
        quizId: editQuizId || undefined
      };

      console.log('Atualizando módulo:', requestBody);

      const res = await fetch(`/api/admin/modules/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify(requestBody)
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Erro na atualização:', errorData);
        throw new Error(errorData.error || 'Erro ao atualizar módulo');
      }

      alert("Módulo atualizado com sucesso!");
      setEditingId(null);
      await loadModulos();
    } catch (error: any) {
      console.error("Erro ao atualizar módulo:", error);
      alert(`Erro ao atualizar: ${error.message}`);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Modulo>) => {
    try {
      const res = await fetch(`/api/admin/modules/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify(updates)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erro ao atualizar módulo');
      }

      alert("Módulo atualizado com sucesso!");
      await loadModulos();
    } catch (error: any) {
      console.error("Erro ao atualizar módulo:", error);
      alert(`Erro ao atualizar: ${error.message}`);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Módulos do Curso</h1>
          <p className="text-sm text-gray-600">Gerencie módulos e navegue para as aulas.</p>
        </div>
        <Link 
          href={`/admin/cursos/${cursoId}/editar`} 
          className="text-sm px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
        >
          ← Voltar ao Curso
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Formulário de novo módulo */}
      <form onSubmit={handleSubmit} className="p-6 border rounded-lg space-y-4 bg-white shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Novo Módulo</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título *
          </label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex: Introdução ao Sistema de Freios"
            className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
            required
            disabled={submitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descrição opcional do módulo"
            className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
            rows={3}
            disabled={submitting}
          />
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
            Quiz de Avaliação (Opcional) {quizzes.length > 0 && <span className="text-green-600">✓ {quizzes.length} quiz(zes) disponível(eis)</span>}
          </label>
          <select
            value={quizId}
            onChange={(e) => setQuizId(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={submitting}
          >
            <option value="">Nenhum (sem quiz)</option>
            {quizzes.map((quiz) => (
              <option key={quiz.id} value={quiz.id}>
                {quiz.titulo}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            💡 O quiz aparecerá no final do módulo, após todas as aulas
          </p>
          {quizzes.length === 0 && (
            <p className="text-xs text-orange-600 mt-1">
              ⚠️ Nenhum quiz disponível. <Link href="/admin/quizzes/novo" className="underline">Criar novo quiz</Link>
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2 bg-primary text-white rounded hover:bg-primary/90 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Criando..." : "Criar Módulo"}
        </button>
      </form>

      {/* Lista de módulos */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Módulos Cadastrados ({modulos.length})
        </h2>
        
        {modulos.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500">Nenhum módulo cadastrado ainda.</p>
            <p className="text-sm text-gray-400 mt-2">Use o formulário acima para criar o primeiro módulo.</p>
          </div>
        ) : (
          modulos.map((modulo) => (
            <div key={modulo.id} className="p-4 border rounded-lg bg-white shadow-sm space-y-3">
              {editingId === modulo.id ? (
                /* Modo de edição */
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                    <input
                      type="text"
                      value={editTitulo}
                      onChange={(e) => setEditTitulo(e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea
                      value={editDescricao}
                      onChange={(e) => setEditDescricao(e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-primary"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ordem</label>
                      <input
                        type="number"
                        value={editOrdem}
                        onChange={(e) => setEditOrdem(e.target.value)}
                        className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-primary"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quiz</label>
                      <select
                        value={editQuizId}
                        onChange={(e) => setEditQuizId(e.target.value)}
                        className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Nenhum</option>
                        {quizzes.map((quiz) => (
                          <option key={quiz.id} value={quiz.id}>
                            {quiz.titulo}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleSaveEdit(modulo.id)}
                      className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90 transition"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              ) : (
                /* Modo de visualização */
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">
                      {modulo.ordem}. {modulo.titulo}
                    </h3>
                    {modulo.descricao && (
                      <p className="text-sm text-gray-500 mt-1">{modulo.descricao}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>{modulo._count?.aulas || 0} {modulo._count?.aulas === 1 ? 'aula' : 'aulas'}</span>
                      {modulo.quizId && (
                        <span className="text-primary">📝 Com quiz</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/modulos/${modulo.id}/aulas`}
                      className="text-sm px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition font-medium"
                    >
                      📚 Aulas
                    </Link>
                    <button
                      onClick={() => handleEdit(modulo)}
                      className="text-sm px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition font-medium"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDelete(modulo.id)}
                      className="text-sm px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition font-medium"
                    >
                      🗑️ Excluir
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
