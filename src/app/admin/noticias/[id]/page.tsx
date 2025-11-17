"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Noticia {
  id: string;
  titulo: string;
  conteudo: string;
  imagem?: string;
  createdAt: string;
}

export default function NoticiaAdminDetalhePage() {
  const { id } = useParams();
  const [noticia, setNoticia] = useState<Noticia | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function fetchNoticia() {
      try {
        const res = await fetch(`/api/admin/noticias/${id}`);
        if (!res.ok) throw new Error("Notícia não encontrada");
        const data = await res.json();
        setNoticia(data);
      } catch (e) {
        setErro("Notícia não encontrada ou erro ao carregar.");
      } finally {
        setLoading(false);
      }
    }
    fetchNoticia();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Carregando...</div>;
  if (erro) return <div className="p-8 text-center text-red-600">{erro}</div>;
  if (!noticia) return null;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md border border-gray-200 p-8 mt-8">
      <Link href="/admin/noticias" className="text-primary hover:underline font-medium mb-4 inline-block">← Voltar para notícias</Link>
      <h1 className="text-3xl font-bold mb-2">{noticia.titulo}</h1>
      <p className="text-gray-600 mb-4">{new Date(noticia.createdAt).toLocaleDateString()}</p>
      {noticia.imagem && <img src={noticia.imagem} alt="Imagem da notícia" className="mb-4 rounded w-full max-h-64 object-cover" />}
      <p className="mb-4 whitespace-pre-line">{noticia.conteudo}</p>
      <div className="flex gap-4 mt-6">
        <Link href={`/admin/noticias/${noticia.id}/editar`} className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold">Editar</Link>
      </div>
    </div>
  );
}
