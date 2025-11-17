"use client"

import { useState } from "react"
import VideoUploader from "@/components/video/VideoUploader"
import toast from "react-hot-toast"

interface VideoFieldProps {
  value?: string
  onChange: (url: string) => void
  label?: string
}

export default function VideoField({ value, onChange, label = "Vídeo da Aula" }: VideoFieldProps) {
  const [videoUrl, setVideoUrl] = useState(value || "")

  const handleUploadComplete = (url: string) => {
    setVideoUrl(url)
    onChange(url)
    toast.success("Vídeo enviado com sucesso!")
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {videoUrl ? (
        <div className="space-y-4">
          <div className="relative">
            <video
              src={videoUrl}
              controls
              className="w-full rounded-lg shadow-md"
            />
            <button
              type="button"
              onClick={() => {
                setVideoUrl("")
                onChange("")
                toast.success("Vídeo removido")
              }}
              className="absolute top-2 right-2 px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600"
            >
              Remover
            </button>
          </div>
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => {
              setVideoUrl(e.target.value)
              onChange(e.target.value)
            }}
            placeholder="Ou insira a URL do vídeo"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ) : (
        <div>
          <VideoUploader
            onUploadComplete={handleUploadComplete}
            maxSizeMB={500}
          />
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Ou insira a URL diretamente:</p>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => {
                setVideoUrl(e.target.value)
                onChange(e.target.value)
              }}
              placeholder="https://..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  )
}
