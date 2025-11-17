"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import toast from "react-hot-toast";

export default function CriarTopicoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [categoria, setCategoria] = useState("Geral");
  const [loading, setLoading] = useState(false);

  // Redirecionar se não estiver logado
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  const categorias = [
    "Geral",
    "Suspensão",
    "Motor",
    "Transmissão",
    "Freios",
    "Elétrica",
    "Carroceria",
    "Dicas e Truques",
    "Eventos",
    "Outro"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo.trim() || !conteudo.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/forum/topicos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titulo: titulo.trim(),
          conteudo: conteudo.trim(),
          categoria,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erro ao criar tópico");
      }

      const data = await res.json();
      toast.success("Tópico criado com sucesso!");
      router.push(`/forum/topico/${data.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao criar tópico");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/forum"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-hover transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Fórum
          </Link>

          <h1 className="text-3xl font-bold text-gray-900">Criar Novo Tópico</h1>
          <p className="text-gray-600 mt-2">
            Compartilhe suas dúvidas, dicas ou experiências com a comunidade
          </p>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
            <div>
              <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-2">
                Título do Tópico *
              </label>
              <input
                type="text"
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Digite um título claro e descritivo..."
                required
                maxLength={200}
              />
              <p className="text-sm text-gray-500 mt-1">{titulo.length}/200 caracteres</p>
            </div>

            {/* Categoria */}
            <div>
              <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <select
                id="categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Conteúdo */}
            <div>
              <label htmlFor="conteudo" className="block text-sm font-medium text-gray-700 mb-2">
                Conteúdo *
              </label>
              <textarea
                id="conteudo"
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                rows={8}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
                placeholder="Descreva sua pergunta, dúvida ou compartilhe sua experiência em detalhes..."
                required
                maxLength={5000}
              />
              <p className="text-sm text-gray-500 mt-1">{conteudo.length}/5000 caracteres</p>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Link
                href="/forum"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Criando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Criar Tópico
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Dicas */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Dicas para um bom tópico</h3>
          <ul className="text-blue-800 space-y-2 text-sm">
            <li>• Use um título claro e específico sobre o assunto</li>
            <li>• Forneça detalhes sobre o problema ou dúvida</li>
            <li>• Mencione o modelo do veículo, ano e sintomas quando aplicável</li>
            <li>• Seja respeitoso e ajude outros membros da comunidade</li>
            <li>• Use a categoria mais apropriada para seu tópico</li>
          </ul>
        </div>
      </div>
    </div>
  );
}