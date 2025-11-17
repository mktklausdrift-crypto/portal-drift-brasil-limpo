"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RichTextEditor from "@/components/editor/RichTextEditor";
import ImageUploader from "@/components/upload/ImageUploader";

interface Category {
  id: string;
  name: string;
}

export default function NovaNoticiaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image: "",
    published: true,
    categoryIds: [] as string[],
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(data || []);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Notícia criada com sucesso!");
        router.push("/admin/noticias");
      } else {
        const error = await res.json();
        alert(error.error || "Erro ao criar notícia");
      }
    } catch (error) {
      console.error("Erro ao criar notícia:", error);
      alert("Erro ao criar notícia");
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter((id) => id !== categoryId)
        : [...prev.categoryIds, categoryId],
    }));
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link
          href="/admin/noticias"
          className="text-primary hover:underline font-medium"
        >
          ← Voltar para notícias
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Nova Notícia</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Digite o título da notícia"
            />
          </div>

          {/* Conteúdo */}
          <div>
            <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2">
              Conteúdo *
            </label>
            <RichTextEditor
              content={formData.content}
              onChange={(newContent) => setFormData({ ...formData, content: newContent })}
              placeholder="Digite o conteúdo da notícia..."
            />
          </div>

          {/* Imagem de Destaque */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Imagem de Destaque
            </label>
            <ImageUploader
              currentImage={formData.image}
              onUploadComplete={(url) => setFormData({ ...formData, image: url })}
              folder="noticias"
              recommendedSize="Imagem horizontal 16:9 (ex: 1280x720px ou 1920x1080px)"
            />
          </div>

          {/* Categorias */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Categorias
            </label>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    formData.categoryIds.includes(category.id)
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Status de Publicação */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="published" className="text-sm font-medium text-gray-700">
              Publicar imediatamente
            </label>
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Salvando..." : "Criar Notícia"}
            </button>
            <Link
              href="/admin/noticias"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold text-center"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
