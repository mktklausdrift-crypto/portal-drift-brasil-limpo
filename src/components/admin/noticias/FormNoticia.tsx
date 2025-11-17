"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

type PostFormData = {
  id?: string;
  title: string;
  content: string;
  excerpt?: string | null;
  coverImage?: string | null;
  image?: string | null;
  published?: boolean;
  categoriesIds?: string[];
};

export default function FormNoticia({ noticia }: { noticia?: PostFormData }) {
  const [title, setTitle] = useState(noticia?.title || "");
  const [content, setContent] = useState(noticia?.content || "");
  const [published, setPublished] = useState(noticia?.published ?? true);
  const [image, setImage] = useState<string | null>(noticia?.image || noticia?.coverImage || null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const toast = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    let imageUrl = image;
    // Se um novo arquivo foi selecionado, faz upload
    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("folder", "noticias");
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      if (uploadRes.ok) {
        const data = await uploadRes.json();
        imageUrl = data.url;
      } else {
        toast.show("Erro ao fazer upload da imagem", "error");
        setLoading(false);
        return;
      }
    }
    const res = await fetch(noticia ? `/api/admin/noticias/${noticia.id}` : "/api/admin/noticias", {
      method: noticia ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, published, image: imageUrl })
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
      {/* Upload de imagem */}
      <div>
        <label className="block font-semibold mb-1">Imagem da notícia</label>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="block mb-2"
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) {
              setImageFile(file);
              setImage(URL.createObjectURL(file));
            }
          }}
        />
        <p className="text-xs text-gray-500 mb-2">
          Sugestão de dimensões: imagem horizontal 16:9 (ex: 1280x720px ou 1920x1080px)
        </p>
        {image && (
          <img src={image} alt="Preview" className="w-full max-w-xs rounded shadow mb-2" />
        )}
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
