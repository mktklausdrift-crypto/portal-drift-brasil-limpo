"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  content: string;
  published: boolean;
  createdAt: string;
  image?: string | null;
  author: {
    name: string;
  };
  categories: Array<{
    category: {
      id: string;
      name: string;
    };
  }>;
}

export default function NoticiasAdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/posts?limit=500`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Erro ao carregar notícias:", errorData);
        alert(errorData.error || "Erro ao carregar notícias");
        return;
      }

      const data = await res.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error("Erro ao carregar notícias:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta notícia?")) return;

    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "DELETE",
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Erro ao excluir notícia");
        return;
      }

      alert("Notícia excluída com sucesso!");
      setPosts((prev) => prev.filter((post) => post.id !== id));
  fetchPosts();
    } catch (error) {
      console.error("Erro ao excluir notícia:", error);
      alert("Erro ao excluir notícia");
    }
  };

  const togglePublish = async (post: Post) => {
    try {
      const res = await fetch(`/api/admin/posts/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          title: post.title,
          content: post.content,
          published: !post.published,
          categoryIds: post.categories.map((c) => c.category.id),
          image: (post as any).image || null,
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        alert(error.error || "Erro ao atualizar status da noticia");
        return;
      }

      fetchPosts();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert("Erro ao atualizar status da noticia");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Carregando notícias...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Gerenciar Notícias</h1>
        <Link
          href="/admin/noticias/nova"
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-semibold"
        >
          + Nova Notícia
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-200">
          <p className="text-gray-600 text-lg mb-4">Nenhuma notícia cadastrada ainda.</p>
          <Link
            href="/admin/noticias/nova"
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-semibold"
          >
            Criar primeira notícia
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Título</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Autor</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Data</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{post.title}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">{post.content.replace(/<[^>]+>/g, '').substring(0, 80)}...</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{post.author.name}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => togglePublish(post)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          post.published
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {post.published ? "Publicado" : "Rascunho"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/admin/noticias/${post.id}/editar`}
                        className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm font-medium"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
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
