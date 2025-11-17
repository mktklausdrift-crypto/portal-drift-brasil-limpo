"use client";
import { useState, useEffect } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";

export default function EditarQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    publicado: false,
  });

  useEffect(() => {
    fetchQuiz();
  }, []);

  async function fetchQuiz() {
    try {
      const res = await fetch(`/api/admin/quizzes/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          titulo: data.titulo || "",
          descricao: data.descricao || "",
          publicado: data.publicado || false,
        });
      }
    } catch (err) {}
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/quizzes/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert("Quiz atualizado com sucesso!");
        router.push("/admin/quizzes");
      } else {
        const error = await res.json();
        alert(error.error || "Erro ao atualizar quiz");
      }
    } catch (err) {
      alert("Erro ao atualizar quiz");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Editar Quiz</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="titulo" className="block font-semibold mb-1">Título *</label>
          <input
            id="titulo"
            type="text"
            required
            value={formData.titulo}
            onChange={e => setFormData({ ...formData, titulo: e.target.value })}
            className="w-full border rounded px-3 py-2"
            placeholder="Digite o título do quiz"
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
            placeholder="Digite a descrição do quiz"
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
