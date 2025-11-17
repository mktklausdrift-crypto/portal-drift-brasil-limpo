"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

type CursoFormData = {
  id?: string;
  titulo: string;
  descricao: string;
  modalidade: string;
  cargaHoraria: string;
  destaque?: boolean;
  inscricoesAbertas?: boolean;
};

export default function FormCurso({ curso }: { curso?: CursoFormData }) {
  const [titulo, setTitulo] = useState(curso?.titulo || "");
  const [descricao, setDescricao] = useState(curso?.descricao || "");
  const [modalidade, setModalidade] = useState(curso?.modalidade || "");
  const [cargaHoraria, setCargaHoraria] = useState(curso?.cargaHoraria || "");
  const [destaque, setDestaque] = useState(curso?.destaque ?? false);
  const [inscricoesAbertas, setInscricoesAbertas] = useState(curso?.inscricoesAbertas ?? true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(curso ? `/api/admin/cursos/${curso.id}` : "/api/admin/cursos", {
      method: curso ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo, descricao, modalidade, cargaHoraria, destaque, inscricoesAbertas })
    });
    setLoading(false);
    if (res.ok) {
      toast.show(curso ? "Curso atualizado com sucesso!" : "Curso criado com sucesso!", "success");
      setTimeout(() => {
        router.push("/admin/cursos");
        router.refresh();
      }, 800);
    } else {
      toast.show("Erro ao salvar curso", "error");
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
        <label className="block font-semibold mb-1">Descrição</label>
        <textarea
          className="w-full border rounded px-3 py-2 min-h-[80px]"
          value={descricao}
          onChange={e => setDescricao(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Modalidade</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={modalidade}
          onChange={e => setModalidade(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Carga Horária</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={cargaHoraria}
          onChange={e => setCargaHoraria(e.target.value)}
          required
        />
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
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={inscricoesAbertas}
          onChange={e => setInscricoesAbertas(e.target.checked)}
          id="inscricoesAbertas"
        />
        <label htmlFor="inscricoesAbertas">Inscrições Abertas</label>
      </div>
      <button
        type="submit"
        className="px-6 py-2 bg-primary text-white rounded font-bold hover:bg-primary-hover transition"
        disabled={loading}
      >
        {loading ? "Salvando..." : curso ? "Salvar Alterações" : "Criar Curso"}
      </button>
    </form>
  );
}
