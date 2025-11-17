"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

type PostFormData = {
  id?: string;
  title: string;
  content: string;
  excerpt?: string | null;
  coverImage?: string | null;
  published?: boolean;
  categoriesIds?: string[];
};

export default function FormNoticia({ noticia }: { noticia?: PostFormData }) {
  const [title, setTitle] = useState(noticia?.title || "");
  const [content, setContent] = useState(noticia?.content || "");
  const [published, setPublished] = useState(noticia?.published ?? true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(noticia ? `/api/admin/noticias/${noticia.id}` : "/api/admin/noticias", {
      method: noticia ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, published })
    });
    setLoading(false);
    if (res.ok) {
      toast.show(noticia ? "Notícia atualizada com sucesso!" : "Notícia criada com sucesso!", "success");
      setTimeout(() => {
        router.push("/admin/noticias");
        router.refresh();
      }, 800);
    } else {
      toast.show("Erro ao salvar notícia", "error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <div>
        <label className="block font-semibold mb-1">Título</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Conteúdo</label>
        <textarea
          className="w-full border rounded px-3 py-2 min-h-[120px]"
          value={content}
          onChange={e => setContent(e.target.value)}
          required
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={published}
          onChange={e => setPublished(e.target.checked)}
          id="published"
        />
        <label htmlFor="published">Publicado</label>
      </div>
      <button
        type="submit"
        className="px-6 py-2 bg-primary text-white rounded font-bold hover:bg-primary-hover transition"
        disabled={loading}
      >
        {loading ? "Salvando..." : noticia ? "Salvar Alterações" : "Criar Notícia"}
      </button>
    </form>
  );
}
