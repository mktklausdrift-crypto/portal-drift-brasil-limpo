"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface ImageUploaderProps {
  onUploadComplete: (url: string) => void;
  currentImage?: string;
  folder?: string;
  recommendedSize?: string;
}

export default function ImageUploader({ 
  onUploadComplete, 
  currentImage,
  folder = "portal-drift",
  recommendedSize,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação de tipo
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione apenas imagens");
      return;
    }

    // Validação de tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 5MB");
      return;
    }

    // Preview local
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload para Cloudinary
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erro ao fazer upload");
      }

      const data = await response.json();
      onUploadComplete(data.url);
      alert("Imagem enviada com sucesso!");
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro ao fazer upload da imagem");
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {preview && (
        <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden relative">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-contain"
          />
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "Enviando..." : preview ? "Trocar Imagem" : "Selecionar Imagem"}
        </button>

        {preview && !uploading && (
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              onUploadComplete("");
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Remover
          </button>
        )}
      </div>

      <p className="text-sm text-gray-600">
        Formatos aceitos: JPG, PNG, GIF, WebP • Tamanho máximo: 5MB
      </p>
      {recommendedSize && (
        <p className="text-xs text-gray-500">
          Sugestão de dimensões: {recommendedSize}
        </p>
      )}
    </div>
  );
}
