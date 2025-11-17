"use client";
import { useState, useEffect } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/upload/ImageUploader";

export default function EditarProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    imagem: "",
    preco: "",
    publicado: false,
  });

  useEffect(() => {
    fetchProduto();
    // eslint-disable-next-line
  }, []);

  async function fetchProduto() {
    try {
      const res = await fetch(`/api/admin/produtos/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          nome: data.nome || "",
          descricao: data.descricao || "",
          imagem: data.imagem || "",
          preco: data.preco || "",
          publicado: data.publicado || false,
        });
      }
    } catch (err) {}
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/produtos/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert("Produto atualizado com sucesso!");
        router.push("/admin/produtos");
      } else {
        const error = await res.json();
        alert(error.error || "Erro ao atualizar produto");
      }
    } catch (err) {
      alert("Erro ao atualizar produto");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Editar Produto</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="nome" className="block font-semibold mb-1">Nome do produto *</label>
          <input
            id="nome"
            type="text"
            required
            value={formData.nome}
            onChange={e => setFormData({ ...formData, nome: e.target.value })}
            className="w-full border rounded px-3 py-2"
            placeholder="Digite o nome do produto"
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
            placeholder="Digite a descrição do produto"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Imagem</label>
          <ImageUploader
            currentImage={formData.imagem}
            onUploadComplete={url => setFormData({ ...formData, imagem: url })}
            folder="produtos"
            recommendedSize="Imagem principal quadrada (1:1) - ideal 1200x1200px"
          />
        </div>
        <div>
          <label htmlFor="preco" className="block font-semibold mb-1">Preço *</label>
          <input
            id="preco"
            type="text"
            required
            value={formData.preco}
            onChange={e => setFormData({ ...formData, preco: e.target.value })}
            className="w-full border rounded px-3 py-2"
            placeholder="Digite o preço do produto"
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
          <label htmlFor="publicado" className="text-sm font-medium text-gray-700">Produto publicado</label>
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
