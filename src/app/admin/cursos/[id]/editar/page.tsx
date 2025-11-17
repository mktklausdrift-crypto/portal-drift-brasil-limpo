"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ImageUploader from "@/components/upload/ImageUploader";

// Em Next.js 15 os params podem ser entregues como Promise e o access direto gera warning.
// Usamos React.use() para desembrulhar a Promise conforme recomendação do runtime.
export default function EditarCursoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    modalidade: "",
    cargaHoraria: "",
    imagem: "",
    destaque: false,
    inscricoesAbertas: true,
  });

  useEffect(() => {
    fetchCurso();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchCurso() {
    try {
      const res = await fetch(`/api/admin/cursos/${id}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setFormData({
          titulo: data.titulo || "",
          descricao: data.descricao || "",
          modalidade: data.modalidade || "",
          cargaHoraria: data.cargaHoraria || "",
          imagem: data.imagem || "",
          destaque: data.destaque || false,
          inscricoesAbertas: data.inscricoesAbertas ?? true,
        });
      }
    } catch (err) {}
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/cursos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert("Curso atualizado com sucesso!");
        router.push("/admin/cursos");
      } else {
        const error = await res.json();
        alert(error.error || "Erro ao atualizar curso");
      }
    } catch (err) {
      alert("Erro ao atualizar curso");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/admin/cursos" className="text-primary hover:underline font-medium">
          ← Voltar para cursos
        </Link>
      </div>
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="titulo" className="block text-sm font-semibold text-gray-700 mb-2">
                  Título do Curso *
                </label>
                <input
                  type="text"
                  id="titulo"
                  required
                  value={formData.titulo}
                  onChange={e => setFormData({ ...formData, titulo: e.target.value })}
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
                  onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Descreva o curso..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Imagem do Curso
                </label>
                <ImageUploader
                  currentImage={formData.imagem}
                  onUploadComplete={url => setFormData({ ...formData, imagem: url })}
                  folder="cursos"
                  recommendedSize="Imagem horizontal 16:9 - ideal 1920x1080px"
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
                    onChange={e => setFormData({ ...formData, modalidade: e.target.value })}
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
                    onChange={e => setFormData({ ...formData, cargaHoraria: e.target.value })}
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
                    onChange={e => setFormData({ ...formData, inscricoesAbertas: e.target.checked })}
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
                    onChange={e => setFormData({ ...formData, destaque: e.target.checked })}
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
                  {loading ? "Salvando..." : "Salvar"}
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
