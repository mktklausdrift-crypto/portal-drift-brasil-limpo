"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

type TopicoFormData = {
  id?: string;
  titulo: string;
  conteudo: string;
  categoria: string;
  autorId: string;
};

export default function FormTopico({ topico }: { topico?: TopicoFormData }) {
  const [titulo, setTitulo] = useState(topico?.titulo || "");
  const [conteudo, setConteudo] = useState(topico?.conteudo || "");
  const [categoria, setCategoria] = useState(topico?.categoria || "");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(topico ? `/api/admin/forum/${topico.id}` : "/api/admin/forum", {
      method: topico ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo, conteudo, categoria })
    });
    setLoading(false);
    if (res.ok) {
      toast.show(topico ? "Tópico atualizado com sucesso!" : "Tópico criado com sucesso!", "success");
      setTimeout(() => {
        router.push("/admin/forum");
        router.refresh();
      }, 800);
    } else {
      toast.show("Erro ao salvar tópico", "error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <div>
        <label className="block font-semibold mb-1">Título</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Conteúdo</label>
        <textarea
          className="w-full border rounded px-3 py-2 min-h-[80px]"
          value={conteudo}
          onChange={e => setConteudo(e.target.value)}
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
      <button
        type="submit"
        className="px-6 py-2 bg-primary text-white rounded font-bold hover:bg-primary-hover transition"
        disabled={loading}
      >
        {loading ? "Salvando..." : topico ? "Salvar Alterações" : "Criar Tópico"}
      </button>
    </form>
  );
}
