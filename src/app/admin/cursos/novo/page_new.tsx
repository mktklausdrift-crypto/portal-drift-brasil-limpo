"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NovoCursoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    modalidade: "",
    cargaHoraria: "",
    destaque: false,
    inscricoesAbertas: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      setSubmitError(null);
      setSubmitSuccess(false);
      console.log("[page_new] POST /api/admin/cursos", formData);
      const res = await fetch("/api/admin/cursos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      let data: any = {};
      try { data = await res.json(); } catch(_) {}
      console.log("[page_new] Resposta status=", res.status, data);
      if (res.ok) {
        setSubmitSuccess(true);
        setTimeout(() => router.push("/admin/cursos"), 1200);
      } else {
        if (res.status === 401 || res.status === 403) {
          setSubmitError("Sessão inválida ou sem permissão. Faça login como ADMIN ou INSTRUCTOR.");
          router.push(`/auth/signin?callbackUrl=${encodeURIComponent("/admin/cursos/novo")}`);
          return;
        }
        setSubmitError(data?.error || `Erro ao criar curso (status ${res.status})`);
      }
    } catch (error) {
      console.error("Erro ao criar curso:", error);
      setSubmitError("Erro ao criar curso. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/admin/cursos" className="text-primary hover:underline font-medium">
          ← Voltar para cursos
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Novo Curso</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {submitError && (
            <div className="px-4 py-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
              {submitError}
            </div>
          )}
          {submitSuccess && (
            <div className="px-4 py-3 rounded bg-green-50 border border-green-200 text-green-700 text-sm">
              Curso criado! Redirecionando...
            </div>
          )}
          <div>
            <label htmlFor="titulo" className="block text-sm font-semibold text-gray-700 mb-2">
              Título do Curso *
            </label>
            <input
              type="text"
              id="titulo"
              required
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Ex: Técnicas de Drift Avançado"
            />
          </div>

          <div>
            <label htmlFor="descricao" className="block text-sm font-semibold text-gray-700 mb-2">
              Descrição *
            </label>
            <textarea
              id="descricao"
              required
              rows={6}
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Descreva o curso..."
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="modalidade" className="block text-sm font-semibold text-gray-700 mb-2">
                Modalidade *
              </label>
              <select
                id="modalidade"
                required
                value={formData.modalidade}
                onChange={(e) => setFormData({ ...formData, modalidade: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Selecione...</option>
                <option value="Presencial">Presencial</option>
                <option value="Online">Online</option>
                <option value="Híbrido">Híbrido</option>
              </select>
            </div>

            <div>
              <label htmlFor="cargaHoraria" className="block text-sm font-semibold text-gray-700 mb-2">
                Carga Horária *
              </label>
              <input
                type="text"
                id="cargaHoraria"
                required
                value={formData.cargaHoraria}
                onChange={(e) => setFormData({ ...formData, cargaHoraria: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Ex: 40 horas"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="inscricoesAbertas"
                checked={formData.inscricoesAbertas}
                onChange={(e) => setFormData({ ...formData, inscricoesAbertas: e.target.checked })}
                className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="inscricoesAbertas" className="text-sm font-medium text-gray-700">
                Inscrições abertas
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="destaque"
                checked={formData.destaque}
                onChange={(e) => setFormData({ ...formData, destaque: e.target.checked })}
                className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="destaque" className="text-sm font-medium text-gray-700">
                Destacar curso na página inicial
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Salvando..." : "Criar Curso"}
            </button>
            <Link
              href="/admin/cursos"
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
