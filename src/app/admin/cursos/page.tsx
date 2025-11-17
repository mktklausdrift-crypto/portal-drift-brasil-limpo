"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import Link from "next/link";

interface Course {
  id: string;
  titulo: string;
  descricao: string;
  modalidade: string;
  cargaHoraria: string;
  destaque: boolean;
  inscricoesAbertas: boolean;
  createdAt: string;
}

export default function CursosAdminPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/cursos?limit=500`, {
        credentials: 'include',
        cache: 'no-store'
      });
      const data = await res.json();
      setCourses(data.courses || []);
    } catch (error) {
      console.error("Erro ao carregar cursos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este curso?")) return;

    try {
      const res = await fetch(`/api/admin/cursos/${id}`, {
        method: "DELETE",
        credentials: 'include',
        cache: 'no-store'
      });

      if (res.ok) {
        alert("Curso excluído com sucesso!");
        fetchCourses();
      } else {
        const errorData = await res.json();
        alert(`Erro ao excluir curso: ${errorData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error("Erro ao excluir curso:", error);
      alert("Erro ao excluir curso");
    }
  };

  const toggleInscricoes = async (course: Course) => {
    try {
      const res = await fetch(`/api/admin/cursos/${course.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify({
          ...course,
          inscricoesAbertas: !course.inscricoesAbertas,
        }),
      });

      if (res.ok) {
        fetchCourses();
      } else {
        const errorData = await res.json();
        alert(`Erro ao atualizar inscrições: ${errorData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error("Erro ao atualizar inscrições:", error);
      alert("Erro ao atualizar inscrições");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Carregando cursos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Gerenciar Cursos</h1>
        <Link
          href="/admin/cursos/novo"
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-semibold"
        >
          + Novo Curso
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-200">
          <p className="text-gray-600 text-lg mb-4">Nenhum curso cadastrado ainda.</p>
          <Link
            href="/admin/cursos/novo"
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-semibold"
          >
            Criar primeiro curso
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Título</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Modalidade</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Carga</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{course.titulo}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {course.descricao.substring(0, 60)}...
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{course.modalidade}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{course.cargaHoraria}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleInscricoes(course)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          course.inscricoesAbertas
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {course.inscricoesAbertas ? "✓ Abertas" : "✗ Fechadas"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/admin/cursos/${course.id}/modulos`}
                        className="inline-block px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition text-sm font-medium"
                      >
                        Módulos
                      </Link>
                      <Link
                        href={`/admin/cursos/${course.id}/editar`}
                        className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm font-medium"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm font-medium"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
