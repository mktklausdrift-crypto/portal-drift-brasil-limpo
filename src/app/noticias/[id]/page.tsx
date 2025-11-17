"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Noticia {
  id: string;
  titulo: string;
  conteudo: string;
  imagem: string | null;
  categoriaId?: string;
  categoria?: {
    nome: string;
  };
  autor?: {
    name: string;
  };
  createdAt: string;
}

export default function NoticiaDetalhePage() {
  const params = useParams();
  const id = params.id as string;
  const [noticia, setNoticia] = useState<Noticia | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNoticia = async () => {
      try {
        const res = await fetch(`/api/noticias/${id}`);
        if (!res.ok) throw new Error("Notícia não encontrada");
        const data = await res.json();
        setNoticia(data);
      } catch (err: any) {
        setError(err.message || "Erro ao carregar notícia");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchNoticia();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando notícia...</p>
        </div>
      </div>
    );
  }

  if (error || !noticia) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">📰</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Notícia não encontrada</h1>
          <p className="text-gray-600 mb-6">{error || "A notícia que você procura não existe."}</p>
          <Link href="/noticias" className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition">
            ← Voltar para notícias
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/noticias" className="text-primary hover:underline mb-6 inline-block font-medium">
          ← Voltar para notícias
        </Link>

        <article className="bg-white rounded-xl shadow-lg overflow-hidden">
          {noticia.imagem && (
            <div className="relative w-full h-96">
              <div className="relative w-full h-full">
                <Image
                  src={noticia.imagem}
                  alt={noticia.titulo}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          )}

          <div className="p-8">
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              {noticia.categoria && (
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                  {noticia.categoria.nome}
                </span>
              )}
              <time dateTime={noticia.createdAt}>
                {new Date(noticia.createdAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </time>
              {noticia.autor && (
                <span>Por {noticia.autor.name}</span>
              )}
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              {noticia.titulo}
            </h1>

            <div 
              className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: noticia.conteudo }}
            />
          </div>

          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <Link 
                href="/noticias" 
                className="text-primary hover:underline font-medium"
              >
                ← Ver todas as notícias
              </Link>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: noticia.titulo,
                        text: noticia.titulo,
                        url: window.location.href,
                      });
                    }
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  🔗 Compartilhar
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
