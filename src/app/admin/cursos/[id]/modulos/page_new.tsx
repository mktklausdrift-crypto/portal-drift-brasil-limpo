"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface Modulo {
  id: string;
  titulo: string;
  descricao?: string;
  ordem: number;
  _count?: { aulas: number };
}

export default function ModulosPage() {
  const params = useParams();
  const router = useRouter();
  const cursoId = params.id as string;
  
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Form state
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [ordem, setOrdem] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadModulos();
  }, [cursoId]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!titulo.trim()) {
      alert("Título é obrigatório");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      
      const res = await fetch(`/api/admin/courses/${cursoId}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify({
          titulo: titulo.trim(),
          descricao: descricao.trim() || undefined,
          ordem: ordem ? parseInt(ordem) : undefined
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erro ao criar módulo');
      }

      // Limpar formulário
      setTitulo("");
      setDescricao("");
      setOrdem("");
      
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Carregando módulos...</p>
      </div>
    );
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
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">
                    {modulo.ordem}. {modulo.titulo}
                  </h3>
                  {modulo.descricao && (
                    <p className="text-sm text-gray-500 mt-1">{modulo.descricao}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {modulo._count?.aulas || 0} {modulo._count?.aulas === 1 ? 'aula' : 'aulas'}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Link
                    href={`/admin/modulos/${modulo.id}/aulas`}
                    className="text-sm px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition font-medium"
                  >
                    📚 Aulas
                  </Link>
                  <button
                    onClick={() => handleDelete(modulo.id)}
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
