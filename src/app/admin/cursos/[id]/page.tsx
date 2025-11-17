// Removido 'use client' para permitir uso de generateStaticParams

// Função para exportação estática dos parâmetros dinâmicos
export async function generateStaticParams() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "https://" + process.env.VERCEL_URL || "http://localhost:3000"}/api/admin/cursos?limit=500`, {
      cache: "no-store"
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.courses || []).map((curso: { id: string }) => ({ id: curso.id }));
  } catch (e) {
    return [];
  }
}
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Curso {
  id: string;
  titulo: string;
  descricao: string;
  modalidade: string;
  cargaHoraria: string;
  imagem: string | null;
  destaque: boolean;
  inscricoesAbertas: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function CursoAdminDetalhePage() {
  const { id } = useParams();
  const [curso, setCurso] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function fetchCurso() {
      try {
        const res = await fetch(`/api/admin/cursos/${id}`);
        if (!res.ok) throw new Error("Curso não encontrado");
        const data = await res.json();
        setCurso(data);
      } catch (e) {
        setErro("Curso não encontrado ou erro ao carregar.");
      } finally {
        setLoading(false);
      }
    }
    fetchCurso();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Carregando...</div>;
  if (erro) return <div className="p-8 text-center text-red-600">{erro}</div>;
  if (!curso) return null;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md border border-gray-200 p-8 mt-8">
      <Link href="/admin/cursos" className="text-primary hover:underline font-medium mb-4 inline-block">← Voltar para cursos</Link>
      <h1 className="text-3xl font-bold mb-2">{curso.titulo}</h1>
      <p className="text-gray-600 mb-4">{curso.modalidade} • {curso.cargaHoraria}</p>
      {curso.imagem && <img src={curso.imagem} alt="Imagem do curso" className="mb-4 rounded w-full max-h-64 object-cover" />}
      <p className="mb-4 whitespace-pre-line">{curso.descricao}</p>
      <div className="flex gap-4 mt-6">
        <Link href={`/admin/cursos/${curso.id}/modulos`} className="px-6 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 font-semibold">Módulos</Link>
        <Link href={`/admin/cursos/${curso.id}/editar`} className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold">Editar</Link>
      </div>
    </div>
  );
}
