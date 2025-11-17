"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

type ProdutoFormData = {
  id?: string;
  nome: string;
  descricao: string;
  preco: number;
  categoriaId: string;
  imagemUrl?: string | null;
  destaque?: boolean;
};

export default function FormProduto({ produto }: { produto?: ProdutoFormData }) {
  const [nome, setNome] = useState(produto?.nome || "");
  const [descricao, setDescricao] = useState(produto?.descricao || "");
  const [preco, setPreco] = useState(produto?.preco || 0);
  const [categoria, setCategoria] = useState(produto?.categoriaId || "");
  const [destaque, setDestaque] = useState(produto?.destaque ?? false);
  const [imagem, setImagem] = useState(produto?.imagemUrl || "");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(produto ? `/api/admin/produtos/${produto.id}` : "/api/admin/produtos", {
      method: produto ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, descricao, preco, categoria, destaque, imagem })
    });
    setLoading(false);
    if (res.ok) {
      toast.show(produto ? "Produto atualizado com sucesso!" : "Produto criado com sucesso!", "success");
      setTimeout(() => {
        router.push("/admin/produtos");
        router.refresh();
      }, 800);
    } else {
      toast.show("Erro ao salvar produto", "error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <div>
        <label className="block font-semibold mb-1">Nome</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={nome}
          onChange={e => setNome(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Descrição</label>
        <textarea
          className="w-full border rounded px-3 py-2 min-h-[80px]"
          value={descricao}
          onChange={e => setDescricao(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Preço (R$)</label>
        <input
          type="number"
          className="w-full border rounded px-3 py-2"
          value={preco}
          onChange={e => setPreco(Number(e.target.value))}
          min={0}
          step={0.01}
          required
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Categoria</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={categoria}
          onChange={e => setCategoria(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Imagem (URL)</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={imagem}
          onChange={e => setImagem(e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-1">
          Sugestão de dimensões: imagem principal quadrada (1:1) - ideal 1200x1200px
        </p>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={destaque}
          onChange={e => setDestaque(e.target.checked)}
          id="destaque"
        />
        <label htmlFor="destaque">Destaque</label>
      </div>
      <button
        type="submit"
        className="px-6 py-2 bg-primary text-white rounded font-bold hover:bg-primary-hover transition"
        disabled={loading}
      >
        {loading ? "Salvando..." : produto ? "Salvar Alterações" : "Criar Produto"}
      </button>
    </form>
  );
}
