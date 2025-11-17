'use client'

import { useState, useEffect } from "react";
import Link from "next/link";

interface Topico {
  id: string;
  titulo: string;
  conteudo: string;
  categoria: string;
  createdAt: string;
  autor: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export default function ForumPage() {
  const [topicos, setTopicos] = useState<Topico[]>([]);
  const [categorias, setCategorias] = useState<string[]>(["Todos"]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchForumData() {
      try {
        const res = await fetch('/api/forum/topicos');
        if (res.ok) {
          const data = await res.json();
          setTopicos(data.topicos || []);
          setCategorias(data.categorias || ["Todos"]);
        }
      } catch (error) {
        console.error('Erro ao carregar fórum:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchForumData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando fórum...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl md:text-5xl font-black text-primary">Fórum</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/signin"
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
          >
            Fazer Login
          </Link>
          <Link
            href="/auth/signup"
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-semibold"
          >
            Criar Conta
          </Link>
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
        <div className="flex gap-2 flex-wrap">
          {categorias.map((cat) => (
            <a
              key={cat}
              href={`/forum`}
              className={`px-4 py-2 rounded-full font-semibold transition bg-gray-100 text-gray-700`}
            >
              {cat}
            </a>
          ))}
        </div>
        <div className="text-sm text-gray-500">
          Busca temporariamente indisponível no modo estático
        </div>
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {topicos.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 py-16">Nenhum tópico encontrado.</div>
        ) : (
          topicos.map((topico) => (
            <div key={topico.id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col gap-2 hover:shadow-2xl transition-all">
              <h3 className="text-lg font-bold text-primary mb-2 line-clamp-2">
                <Link href={`/forum/topico/${topico.id}`} className="hover:underline">
                  {topico.titulo}
                </Link>
              </h3>
              <p className="text-gray-600 mb-2 line-clamp-3">{topico.conteudo.slice(0, 120)}{topico.conteudo.length > 120 ? "..." : ""}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-auto">
                {topico.autor?.image ? (
                  <img src={topico.autor.image} alt={topico.autor.name || "Usuário"} className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">{(topico.autor?.name || "U").charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <span className="font-medium text-gray-700">{topico.autor?.name || "Usuário"}</span>
                <span>•</span>
                <span>{new Date(topico.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
