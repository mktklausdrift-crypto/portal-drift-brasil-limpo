"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import ImageUploader from "@/components/upload/ImageUploader";
import AplicacoesManager from "@/components/admin/AplicacoesManager";

export default function NovoProdutoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    codigo: string;
    nome: string;
    descricao: string;
    preco: string;
    imagem: string;
    imagens: string[];
    videos: string[];
    categoria: string;
    fabricante: string;
    estoque: string;
    peso: string;
  dimensoes: string;
    garantia: string;
    destaque: boolean;
  }>({
    codigo: "",
    nome: "",
    descricao: "",
    preco: "",
    imagem: "", // Imagem principal
    imagens: [], // Galeria de imagens
    videos: [], // Galeria de vídeos
    categoria: "",
    fabricante: "",
    estoque: "",
    peso: "",
    dimensoes: "",
    garantia: "",
    destaque: false,
  });
  const [produtoId, setProdutoId] = useState<string | null>(null);

  // Estado para input de vídeo
  const [videoInput, setVideoInput] = useState("");

  // Função utilitária para extrair o ID do YouTube
  function getYouTubeId(url: string): string | null {
    const match = url.match(/(?:youtu.be\/|youtube.com\/(?:embed\/|v\/|watch\?v=|shorts\/)?)([\w-]{11})/);
    return match ? match[1] : null;
  }

  // Função para adicionar vídeo
  function addVideo() {
    if (!videoInput.trim()) return;
    setFormData(prev => ({ ...prev, videos: [...prev.videos, videoInput.trim()] }));
    setVideoInput("");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/produtos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          imagens: formData.imagens,
        }),
      });
      if (res.ok) {
        const produto = await res.json();
        setProdutoId(produto.id);
        alert("Produto criado com sucesso! Agora cadastre as aplicações abaixo.");
        // Não redireciona, permite cadastrar aplicações
      } else {
        const error = await res.json();
        alert(error.error || "Erro ao criar produto");
      }
    } catch (error) {
      console.error("Erro ao criar produto:", error);
      alert("Erro ao criar produto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link
          href="/admin/produtos"
          className="text-primary hover:underline font-medium"
        >
          ← Voltar para produtos
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Novo Produto</h1>

        {/* Formulário principal */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="codigo" className="block text-sm font-semibold text-gray-700 mb-2">
              Código da Peça (SKU)
            </label>
            <input
              type="text"
              id="codigo"
              value={formData.codigo}
              onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Ex: DK12345"
            />
          </div>
          <div>
            <label htmlFor="nome" className="block text-sm font-semibold text-gray-700 mb-2">
              Nome do Produto *
            </label>
            <input
              type="text"
              id="nome"
              required
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus-border-transparent"
              placeholder="Ex: Sistema de Escape Esportivo"
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
              placeholder="Descreva o produto..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Imagem do Produto
            </label>
            <ImageUploader
              currentImage={formData.imagem}
              onUploadComplete={(url) => setFormData({ ...formData, imagem: url })}
              folder="produtos"
              recommendedSize="Imagem principal quadrada (1:1) - ideal 1200x1200px"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="fabricante" className="block text-sm font-semibold text-gray-700 mb-2">
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Galeria de Imagens (opcional)
                  </label>
                  <div className="flex flex-wrap gap-4 mb-2">
                    {formData.imagens.map((img, idx) => (
                      <div key={idx} className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt={`Imagem ${idx+1}`} className="object-contain w-full h-full" />
                        <button type="button" onClick={() => setFormData({ ...formData, imagens: formData.imagens.filter((_, i) => i !== idx) })} className="absolute top-1 right-1 bg-white/80 rounded-full p-1 text-xs font-bold text-red-600 shadow">×</button>
                      </div>
                    ))}
                  </div>
                  <ImageUploader
                    onUploadComplete={(url) => setFormData({ ...formData, imagens: [...formData.imagens, url] })}
                    folder="produtos"
                    recommendedSize="Galeria: usar imagens 1:1 ou 4:3 - ideal 1200x1200px ou 1200x900px"
                  />
                  <p className="text-xs text-gray-500 mt-1">Adicione quantas imagens desejar para a galeria.</p>
                  <div className="mt-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Galeria de Vídeos (YouTube, opcional)
                    </label>
                    <div className="flex flex-wrap gap-4 mb-2">
                      {formData.videos.map((video, idx) => (
                        <div key={idx} className="relative w-40 h-24 bg-gray-100 rounded-lg overflow-hidden border flex items-center justify-center">
                          <iframe
                            src={getYouTubeId(video) ? `https://www.youtube.com/embed/${getYouTubeId(video)}` : undefined}
                            title={`Vídeo ${idx+1}`}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                          <button type="button" onClick={() => setFormData({ ...formData, videos: formData.videos.filter((_, i) => i !== idx) })} className="absolute top-1 right-1 bg-white/80 rounded-full p-1 text-xs font-bold text-red-600 shadow">×</button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Cole o link do vídeo do YouTube"
                        className="px-3 py-2 border border-gray-300 rounded-lg w-72"
                        value={videoInput}
                        onChange={e => setVideoInput(e.target.value)}
                      />
                      <button
                        type="button"
                        className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition"
                        onClick={addVideo}
                        disabled={!videoInput.trim()}
                      >
                        Adicionar Vídeo
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Cole o link completo do vídeo do YouTube e clique em adicionar.</p>
                  </div>
                </div>
                Fabricante
              </label>
              <input
                type="text"
                id="fabricante"
                value={formData.fabricante}
                onChange={(e) => setFormData({ ...formData, fabricante: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Ex: Bosch, Valeo, etc."
              />
            </div>
            <div>
              <label htmlFor="estoque" className="block text-sm font-semibold text-gray-700 mb-2">
                Estoque
              </label>
              <input
                type="number"
                id="estoque"
                min="0"
                value={formData.estoque}
                onChange={(e) => setFormData({ ...formData, estoque: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Quantidade em estoque"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="peso" className="block text-sm font-semibold text-gray-700 mb-2">
                Peso (kg)
              </label>
              <input
                type="number"
                id="peso"
                min="0"
                step="0.01"
                value={formData.peso}
                onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Ex: 1.25"
              />
            </div>
            <div>
              <label htmlFor="dimensoes" className="block text-sm font-semibold text-gray-700 mb-2">
                Dimensões
              </label>
              <input
                type="text"
                id="dimensoes"
                value={formData.dimensoes}
                onChange={(e) => setFormData({ ...formData, dimensoes: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Ex: 10x20x5 cm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="garantia" className="block text-sm font-semibold text-gray-700 mb-2">
              Garantia
            </label>
            <input
              type="text"
              id="garantia"
              value={formData.garantia}
              onChange={(e) => setFormData({ ...formData, garantia: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus-border-transparent"
              placeholder="Ex: 12 meses"
            />
          </div>
          <div>
            <label htmlFor="preco" className="block text-sm font-semibold text-gray-700 mb-2">
              Preço (R$) *
            </label>
            <input
              type="number"
              id="preco"
              required
              step="0.01"
              value={formData.preco}
              onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus-border-transparent"
              placeholder="0.00"
            />
          </div>
          <div>
            <label htmlFor="categoria" className="block text-sm font-semibold text-gray-700 mb-2">
              Categoria *
            </label>
            <input
              type="text"
              id="categoria"
              required
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus-border-transparent"
              placeholder="Ex: Performance"
            />
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
              Destacar produto na página inicial
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading || !!produtoId}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Salvando..." : produtoId ? "Produto Criado" : "Criar Produto"}
            </button>
            <Link
              href="/admin/produtos"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold text-center"
            >
              Cancelar
            </Link>
          </div>
        </form>

        {/* Formulário de aplicações, só aparece após criar produto */}
        {produtoId && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Aplicações em Veículos</h2>
            <AplicacoesManager produtoId={produtoId} />
          </div>
        )}
      </div>

    </div>
  );
}

