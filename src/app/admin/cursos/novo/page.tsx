"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ImageUploader from "@/components/upload/ImageUploader";
import VideoUploader from "@/components/video/VideoUploader";
import FileUploader, { UploadedFile } from "@/components/upload/FileUploader";
import { BookOpen, Clock, Users, Image as ImageIcon, Settings, CheckCircle, XCircle } from "lucide-react";

interface FormErrors {
  titulo?: string;
  descricao?: string;
  modalidade?: string;
  cargaHoraria?: string;
}

export default function NovoCursoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    modalidade: "",
    cargaHoraria: "",
    imagem: "",
    destaque: false,
    inscricoesAbertas: true,
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoThumbnailUrl, setVideoThumbnailUrl] = useState<string | undefined>(undefined);
  const [materiais, setMateriais] = useState<UploadedFile[]>([]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = "Título é obrigatório";
    } else if (formData.titulo.length < 5) {
      newErrors.titulo = "Título deve ter pelo menos 5 caracteres";
    } else if (formData.titulo.length > 100) {
      newErrors.titulo = "Título deve ter no máximo 100 caracteres";
    }

    if (!formData.descricao.trim()) {
      newErrors.descricao = "Descrição é obrigatória";
    } else if (formData.descricao.length < 20) {
      newErrors.descricao = "Descrição deve ter pelo menos 20 caracteres";
    } else if (formData.descricao.length > 5000) {
      newErrors.descricao = "Descrição deve ter no máximo 5000 caracteres";
    }

    if (!formData.modalidade) {
      newErrors.modalidade = "Modalidade é obrigatória";
    }

    if (!formData.cargaHoraria.trim()) {
      newErrors.cargaHoraria = "Carga horária é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar formulário
    const isValid = validateForm();
    if (!isValid) {
      // Focar primeiro campo com erro para feedback imediato
      const firstErrorKey = Object.keys(errors)[0];
      if (firstErrorKey) {
        const el = document.getElementById(firstErrorKey);
        el?.focus();
      }
      return;
    }

    setLoading(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      console.log("[NovoCursoPage] Enviando POST /api/admin/cursos", formData);
      const res = await fetch("/api/admin/cursos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          imagem: formData.imagem || null,
          // Observação: videoUrl e materiais são usados nas aulas; não persistidos no curso neste momento
          _videoUrlPreview: videoUrl,
          _videoThumbnailUrlPreview: videoThumbnailUrl,
          _materiaisPreview: materiais,
        }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch (_) {}

      console.log("[NovoCursoPage] Resposta POST status=", res.status, "payload=", data);

      if (res.ok) {
        setSubmitSuccess(true);
        // Mostrar mensagem de sucesso
        const successMessage = document.createElement("div");
        successMessage.className = "fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-fade-in";
        successMessage.innerHTML = `
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span class="font-semibold">Curso criado com sucesso!</span>
        `;
        document.body.appendChild(successMessage);

        setTimeout(() => {
          successMessage.remove();
          router.push("/admin/cursos");
        }, 2000);
      } else {
        if (res.status === 401 || res.status === 403) {
          setSubmitError("Sessão inválida ou sem permissão. Faça login como ADMIN ou INSTRUCTOR.");
          router.push(`/auth/signin?callbackUrl=${encodeURIComponent("/admin/cursos/novo")}`);
          return;
        }
        const msg = data?.error || `Erro ao criar curso (status ${res.status})`;
        setSubmitError(msg);
      }
    } catch (error) {
      console.error("Erro ao criar curso:", error);
      setSubmitError("Erro ao criar curso. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link 
            href="/admin/cursos" 
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium mb-3 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar para cursos
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            Novo Curso
          </h1>
          <p className="text-gray-600 mt-2">Preencha os dados abaixo para criar um novo curso</p>
        </div>
      </div>

      {/* Formulário */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {submitError && (
              <div className="px-4 py-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
                <XCircle className="w-4 h-4 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}
            {submitSuccess && (
              <div className="px-4 py-3 rounded bg-green-50 border border-green-200 text-green-700 text-sm flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5" />
                <span>Curso criado com sucesso! Redirecionando...</span>
              </div>
            )}
        {/* Header do Card */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-8 py-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Informações do Curso
          </h2>
          <p className="text-sm text-gray-600 mt-1">* Campos obrigatórios</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-8">
            {/* Informações Básicas */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-200">
                <BookOpen className="w-5 h-5 text-primary" />
                Informações Básicas
              </h3>

              {/* Título */}
              <div>
                <label htmlFor="titulo" className="block text-sm font-semibold text-gray-700 mb-2">
                  Título do Curso *
                </label>
                <input
                  type="text"
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => {
                    setFormData({ ...formData, titulo: e.target.value });
                    if (errors.titulo) setErrors({ ...errors, titulo: undefined });
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
                    errors.titulo ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="Ex: Técnicas de Drift Avançado"
                  maxLength={100}
                />
                {errors.titulo && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <XCircle className="w-4 h-4" />
                    {errors.titulo}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.titulo.length}/100 caracteres
                </p>
              </div>

              {/* Descrição */}
              <div>
                <label htmlFor="descricao" className="block text-sm font-semibold text-gray-700 mb-2">
                  Descrição do Curso *
                </label>
                <textarea
                  id="descricao"
                  rows={6}
                  value={formData.descricao}
                  onChange={(e) => {
                    setFormData({ ...formData, descricao: e.target.value });
                    if (errors.descricao) setErrors({ ...errors, descricao: undefined });
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none ${
                    errors.descricao ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="Descreva o curso, seus objetivos, público-alvo e o que os alunos irão aprender..."
                  maxLength={5000}
                />
                {errors.descricao && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <XCircle className="w-4 h-4" />
                    {errors.descricao}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.descricao.length}/5000 caracteres
                </p>
              </div>
            </div>

            {/* Imagem */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-200">
                <ImageIcon className="w-5 h-5 text-primary" />
                Imagem do Curso
              </h3>
              <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
                <ImageUploader
                  currentImage={formData.imagem}
                  onUploadComplete={(url) => setFormData({ ...formData, imagem: url })}
                  folder="cursos"
                  recommendedSize="Imagem horizontal 16:9 - ideal 1920x1080px"
                />
              </div>
            </div>

            {/* Vídeo de Apresentação (opcional) */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-200">
                <ImageIcon className="w-5 h-5 text-primary" />
                Vídeo do Curso (opcional)
              </h3>
              <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
                <VideoUploader
                  onUploadComplete={(url, thumbnailUrl) => {
                    setVideoUrl(url);
                    setVideoThumbnailUrl(thumbnailUrl);
                  }}
                  maxSizeMB={500}
                  generateThumbnail
                />
                {videoUrl && (
                  <div className="mt-4 text-sm text-gray-600">
                    <p className="mb-1">Vídeo enviado: <a className="text-primary hover:underline" href={videoUrl} target="_blank" rel="noreferrer">abrir</a></p>
                    {videoThumbnailUrl && (
                      <div className="mt-2">
                        <p className="mb-1">Thumbnail gerado:</p>
                        <img src={videoThumbnailUrl} alt="Thumbnail" className="w-56 rounded border" />
                      </div>
                    )}
                    <p className="mt-3 text-xs text-gray-500">Dica: associe este vídeo a uma aula após criar o curso.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Materiais e Arquivos (opcional) */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-200">
                <ImageIcon className="w-5 h-5 text-primary" />
                Materiais do Curso (PDF, DOC, ZIP)
              </h3>
              <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
                <FileUploader
                  onUploadComplete={(files) => setMateriais(files)}
                  maxSizeMB={50}
                  maxFiles={10}
                  multiple
                />
                {materiais.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Arquivos enviados ({materiais.length})</h4>
                    <ul className="space-y-2">
                      {materiais.map((f, idx) => (
                        <li key={idx} className="text-sm flex items-center justify-between bg-white border rounded p-2">
                          <span className="truncate mr-3">{f.originalName}</span>
                          <a href={f.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">Abrir</a>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-xs text-gray-500">Dica: vincule os materiais às aulas após criar o curso.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Configurações */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-200">
                <Settings className="w-5 h-5 text-primary" />
                Configurações do Curso
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Modalidade */}
                <div>
                  <label htmlFor="modalidade" className="block text-sm font-semibold text-gray-700 mb-2">
                    Modalidade *
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      id="modalidade"
                      value={formData.modalidade}
                      onChange={(e) => {
                        setFormData({ ...formData, modalidade: e.target.value });
                        if (errors.modalidade) setErrors({ ...errors, modalidade: undefined });
                      }}
                      className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors appearance-none ${
                        errors.modalidade ? "border-red-500 bg-red-50" : "border-gray-300"
                      }`}
                    >
                      <option value="">Selecione a modalidade</option>
                      <option value="Presencial">🏫 Presencial</option>
                      <option value="Online">💻 Online</option>
                      <option value="Híbrido">🔄 Híbrido</option>
                    </select>
                  </div>
                  {errors.modalidade && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <XCircle className="w-4 h-4" />
                      {errors.modalidade}
                    </p>
                  )}
                </div>

                {/* Carga Horária */}
                <div>
                  <label htmlFor="cargaHoraria" className="block text-sm font-semibold text-gray-700 mb-2">
                    Carga Horária *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="cargaHoraria"
                      value={formData.cargaHoraria}
                      onChange={(e) => {
                        setFormData({ ...formData, cargaHoraria: e.target.value });
                        if (errors.cargaHoraria) setErrors({ ...errors, cargaHoraria: undefined });
                      }}
                      className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
                        errors.cargaHoraria ? "border-red-500 bg-red-50" : "border-gray-300"
                      }`}
                      placeholder="Ex: 40 horas"
                    />
                  </div>
                  {errors.cargaHoraria && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <XCircle className="w-4 h-4" />
                      {errors.cargaHoraria}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Ex: "40 horas", "2 semanas", "3 meses"
                  </p>
                </div>
              </div>
            </div>

            {/* Opções */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-200">
                <CheckCircle className="w-5 h-5 text-primary" />
                Opções Adicionais
              </h3>

              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-primary/50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    id="inscricoesAbertas"
                    checked={formData.inscricoesAbertas}
                    onChange={(e) => setFormData({ ...formData, inscricoesAbertas: e.target.checked })}
                    className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary mt-0.5"
                  />
                  <label htmlFor="inscricoesAbertas" className="flex-1 cursor-pointer">
                    <span className="block text-sm font-semibold text-gray-900">Inscrições abertas</span>
                    <span className="block text-xs text-gray-600 mt-1">
                      Permitir que novos alunos se inscrevam neste curso
                    </span>
                  </label>
                </div>

                <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-primary/50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    id="destaque"
                    checked={formData.destaque}
                    onChange={(e) => setFormData({ ...formData, destaque: e.target.checked })}
                    className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary mt-0.5"
                  />
                  <label htmlFor="destaque" className="flex-1 cursor-pointer">
                    <span className="block text-sm font-semibold text-gray-900">Destacar curso</span>
                    <span className="block text-xs text-gray-600 mt-1">
                      Exibir este curso em destaque na página inicial
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-4 pt-8 mt-8 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Criando curso...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Criar Curso
                </>
              )}
            </button>
            <Link
              href="/admin/cursos"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold text-center flex items-center justify-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
