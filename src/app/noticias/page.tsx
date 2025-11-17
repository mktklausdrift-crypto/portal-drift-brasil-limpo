'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import { PostCard } from "@/components/features/PostCard";
import { PostWithRelations } from "@/types/database";

// Server Component da página de notícias
export default function NoticiasPage() {
  const [categorias, setCategorias] = useState<{ id: string; name: string }[]>([]);
  const [noticias, setNoticias] = useState<PostWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchNoticias() {
      try {
        const res = await fetch('/api/noticias', {
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          setCategorias(data.categorias || []);
          setNoticias(data.noticias || []);
        }
      } catch (error) {
        console.error("Erro ao carregar notícias:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchNoticias();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando notícias...</p>
        </div>
      </div>
    );
  }

  // Simulação de notícias mais lidas (substitua por dados reais se necessário)
  const maisLidas = noticias.slice(0, 4);

  return (
    <div className="max-w-[1400px] mx-auto py-8 px-2 md:px-6 flex flex-col gap-8">
      {/* Banner superior */}
      <div className="bg-primary text-white rounded-xl shadow-lg px-6 py-7 md:py-8 flex flex-col md:flex-row md:items-center md:justify-between relative">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black mb-2">Portal Drift Brasil: Informação e Inovação</h1>
          <p className="text-base md:text-lg max-w-2xl">Fique por dentro das novidades, lançamentos e tendências do setor automotivo. Aqui você encontra conteúdo de qualidade, dicas técnicas e tudo sobre performance e inovação!</p>
        </div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:block">
          <span className="bg-primary/80 rounded-full px-8 py-3 text-lg font-bold shadow-lg border-2 border-white/30">#DriftNews</span>
        </div>
      </div>

      {/* Filtros e busca - removidos para build estático */}
      {/* <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Link href="/noticias" className={`px-4 py-2 rounded-full font-semibold transition ${!categoriaId ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-primary hover:text-white"}`}>Todos</Link>
          {categorias.map((cat) => (
            <Link
              key={cat.id}
              href={`/noticias?categoria=${cat.id}${busca ? `&busca=${encodeURIComponent(busca)}` : ""}`}
              className={`px-4 py-2 rounded-full font-semibold transition ${categoriaId === cat.id ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-primary hover:text-white"}`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
        <form className="flex gap-2" method="get">
          <input
            type="text"
            name="busca"
            placeholder="Buscar notícias..."
            defaultValue={busca}
            className="border border-gray-300 rounded px-4 py-2 w-48 focus:outline-primary"
          />
          <button type="submit" className="px-4 py-2 rounded bg-primary text-white font-bold hover:bg-primary-hover transition">Buscar</button>
        </form>
      </div> */}

      {/* Conteúdo principal: grid e sidebar */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Grid de notícias */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Card de destaque (primeira notícia) */}
          {noticias.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-0 overflow-hidden">
              {noticias[0].image && (
                <img src={noticias[0].image} alt={noticias[0].title} className="w-full h-60 md:h-72 object-cover rounded-t-2xl" />
              )}
              <div className="p-6">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2 line-clamp-2">{noticias[0].title}</h2>
                <p className="text-base text-gray-700 mb-2 line-clamp-2">{noticias[0].content?.replace(/<[^>]+>/g, '').slice(0, 120)}...</p>
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                  <span>{noticias[0].author?.name || "Usuário"}</span>
                  <span>•</span>
                  <span>{new Date(noticias[0].createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                </div>
                <Link href={`/noticias/${noticias[0].id}`} className="inline-block mt-2 px-6 py-2 rounded bg-primary text-white font-bold shadow hover:bg-primary-hover transition">Ler notícia completa</Link>
              </div>
            </div>
          )}
          {/* Cards das demais notícias */}
          <div className="grid gap-6 md:grid-cols-2">
            {noticias.length <= 1 ? (
              <div className="col-span-full text-center text-gray-400 py-16">Nenhuma notícia encontrada para este filtro.</div>
            ) : (
              noticias.slice(1).map((post) => <PostCard key={post.id} post={post} />)
            )}
          </div>
        </div>
        {/* Sidebar */}
        <aside className="w-full lg:w-80 flex flex-col gap-6">
          {/* Mais lidas */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-black text-primary mb-4">Mais lidas</h3>
            <ol className="list-decimal list-inside text-primary font-bold space-y-2">
              {maisLidas.map((noticia, idx) => (
                <li key={noticia.id} className="text-base font-bold flex flex-col">
                  <span>{noticia.title}</span>
                  <span className="text-xs text-gray-500 font-normal">{noticia.categories?.[0]?.category?.name || ""}</span>
                </li>
              ))}
            </ol>
          </div>
          {/* Receba novidades */}
          <div className="bg-primary/10 rounded-2xl shadow p-6 flex flex-col gap-2">
            <h3 className="text-lg font-black text-primary mb-2">Receba novidades</h3>
            <div className="bg-white rounded-xl p-4 shadow text-primary font-bold mb-2">Receba novidades</div>
            <p className="text-gray-700 text-sm">Assine nossa newsletter e fique por dentro das últimas notícias, lançamentos e dicas técnicas do setor automotivo.</p>
            <form className="flex gap-2 mt-2">
              <input type="email" placeholder="Seu e-mail" className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-primary" />
              <button type="submit" className="px-4 py-2 rounded bg-primary text-white font-bold hover:bg-primary-hover transition">Assinar</button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}
