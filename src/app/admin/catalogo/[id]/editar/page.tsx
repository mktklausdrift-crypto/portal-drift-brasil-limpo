"use client";
import { useState, useEffect } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/upload/ImageUploader";

export default function EditarCatalogoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    imagem: "",
    publicado: false,
  });

  useEffect(() => {
    fetchItem();
  }, []);

  async function fetchItem() {
    try {
      const res = await fetch(`/api/admin/catalogo/${id}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          nome: data.nome || "",
          descricao: data.descricao || "",
          imagem: data.imagem || "",
          publicado: data.publicado || false,
        });
      }
    } catch (err) {}
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/catalogo/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert("Item do catálogo atualizado com sucesso!");
        router.push("/admin/catalogo");
      } else {
        const error = await res.json();
        alert(error.error || "Erro ao atualizar item");
      }
    } catch (err) {
      alert("Erro ao atualizar item");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Editar Item do Catálogo</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="nome" className="block font-semibold mb-1">Nome *</label>
          <input
            id="nome"
            type="text"
            required
            value={formData.nome}
            onChange={e => setFormData({ ...formData, nome: e.target.value })}
            className="w-full border rounded px-3 py-2"
            placeholder="Digite o nome do item"
          />
        </div>
        <div>
          <label htmlFor="descricao" className="block font-semibold mb-1">Descrição *</label>
          <textarea
            id="descricao"
            required
            value={formData.descricao}
            onChange={e => setFormData({ ...formData, descricao: e.target.value })}
            className="w-full border rounded px-3 py-2 min-h-[80px]"
            placeholder="Digite a descrição do item"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Imagem</label>
          <ImageUploader
            currentImage={formData.imagem}
            onUploadComplete={url => setFormData({ ...formData, imagem: url })}
            folder="catalogo"
            recommendedSize="Imagem quadrada para catálogo (1:1) - ideal 1200x1200px"
          />
        </div>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="publicado"
            checked={formData.publicado}
            onChange={e => setFormData({ ...formData, publicado: e.target.checked })}
            className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
          />
          <label htmlFor="publicado" className="text-sm font-medium text-gray-700">Publicado</label>
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </div>
  );
}
