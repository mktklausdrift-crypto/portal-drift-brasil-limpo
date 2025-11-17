"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Video, Upload, Settings, Zap } from "lucide-react"
import VideoUploadAvancado from "@/components/VideoUploadAvancado"
import { useVideoCompression } from "@/hooks/useVideoCompression"
// import { useToast } from "@/hooks/use-toast" // Hook personalizado não implementado ainda

// Toast simples para demonstração
const useToast = () => ({
  toast: ({ title, description, variant }: { title: string; description: string; variant?: string }) => {
    console.log(`Toast: ${title} - ${description}${variant ? ` (${variant})` : ''}`)
    // Aqui você pode implementar um sistema de toast personalizado
  }
})

interface VideoUploadIntegradoProps {
  onVideoUploaded: (videoData: {
    url: string
    thumbnailUrl?: string
    fileName: string
    originalName: string
    size: number
    compressed?: boolean
  }) => void
  existingVideo?: {
    url: string
    name: string
  }
  className?: string
}

export default function VideoUploadIntegrado({
  onVideoUploaded,
  existingVideo,
  className = ""
}: VideoUploadIntegradoProps) {
  const [showCompression, setShowCompression] = useState(false)
  const [compressionSettings, setCompressionSettings] = useState({
    enabled: false,
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080
  })
  
  const { 
    compressVideo, 
    isCompressing, 
    progress: compressionProgress 
  } = useVideoCompression()
  
  const { toast } = useToast()

  const handleUpload = async (file: File, thumbnail?: string): Promise<string> => {
    try {
      let finalFile = file
      
      // Compressão se habilitada
      if (compressionSettings.enabled) {
        toast({
          title: "Comprimindo vídeo",
          description: "Aguarde enquanto otimizamos seu vídeo..."
        })
        
        finalFile = await compressVideo(file, {
          quality: compressionSettings.quality,
          maxWidth: compressionSettings.maxWidth,
          maxHeight: compressionSettings.maxHeight
        })
        
        toast({
          title: "Compressão concluída",
          description: `Arquivo reduzido em ${Math.round(((file.size - finalFile.size) / file.size) * 100)}%`
        })
      }

      // Preparar FormData
      const formData = new FormData()
      formData.append('video', finalFile)
      
      if (thumbnail) {
        formData.append('thumbnail', thumbnail)
      }

      // Upload
      const response = await fetch('/api/upload/video', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro no upload')
      }

      const result = await response.json()
      
      // Notificar componente pai
      onVideoUploaded({
        url: result.url,
        thumbnailUrl: result.thumbnailUrl,
        fileName: result.fileName,
        originalName: result.originalName || file.name,
        size: finalFile.size,
        compressed: compressionSettings.enabled
      })

      toast({
        title: "Upload concluído",
        description: "Vídeo enviado com sucesso!"
      })

      return result.url

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no upload'
      toast({
        title: "Erro no upload",
        description: errorMessage,
        variant: "destructive"
      })
      throw error
    }
  }

  const handleError = (error: string) => {
    toast({
      title: "Erro no vídeo",
      description: error,
      variant: "destructive"
    })
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header com configurações */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Video className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Upload de Vídeo</h3>
            <p className="text-sm text-gray-600">
              Envie vídeos com compressão automática e geração de thumbnails
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCompression(!showCompression)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4" />
          Configurações
        </button>
      </div>

      {/* Configurações de compressão */}
      {showCompression && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-50 rounded-lg p-4 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="font-medium">Compressão de Vídeo</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={compressionSettings.enabled}
                onChange={(e) => setCompressionSettings(prev => ({
                  ...prev,
                  enabled: e.target.checked
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {compressionSettings.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualidade
                </label>
                <select
                  value={compressionSettings.quality}
                  onChange={(e) => setCompressionSettings(prev => ({
                    ...prev,
                    quality: parseFloat(e.target.value)
                  }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value={0.5}>Baixa (50%)</option>
                  <option value={0.7}>Média (70%)</option>
                  <option value={0.8}>Alta (80%)</option>
                  <option value={0.9}>Muito Alta (90%)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Largura Máxima
                </label>
                <select
                  value={compressionSettings.maxWidth}
                  onChange={(e) => setCompressionSettings(prev => ({
                    ...prev,
                    maxWidth: parseInt(e.target.value)
                  }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value={1280}>HD (1280px)</option>
                  <option value={1920}>Full HD (1920px)</option>
                  <option value={2560}>2K (2560px)</option>
                  <option value={3840}>4K (3840px)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Altura Máxima
                </label>
                <select
                  value={compressionSettings.maxHeight}
                  onChange={(e) => setCompressionSettings(prev => ({
                    ...prev,
                    maxHeight: parseInt(e.target.value)
                  }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value={720}>HD (720px)</option>
                  <option value={1080}>Full HD (1080px)</option>
                  <option value={1440}>2K (1440px)</option>
                  <option value={2160}>4K (2160px)</option>
                </select>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Progresso da compressão */}
      {isCompressing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <Zap className="w-3 h-3 text-blue-600" />
            </div>
            <span className="font-medium text-blue-900">
              Comprimindo vídeo - {compressionProgress.stage}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-blue-700">
              <span>Progresso</span>
              <span>{Math.round(compressionProgress.progress)}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <motion.div
                className="bg-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${compressionProgress.progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            {compressionProgress.estimatedTime && (
              <p className="text-xs text-blue-600">
                Tempo estimado: {Math.round(compressionProgress.estimatedTime / 1000)}s
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Componente de upload */}
      <VideoUploadAvancado
        onUpload={handleUpload}
        onError={handleError}
        existing={existingVideo}
        maxSize={100}
        allowedFormats={['mp4', 'mov', 'avi', 'mkv', 'webm']}
      />

      {/* Dicas */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-900 mb-2">💡 Dicas para melhor qualidade</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Use formatos MP4 ou WebM para melhor compatibilidade</li>
          <li>• Ative a compressão para arquivos grandes (&gt;50MB)</li>
          <li>• Mantenha a resolução em até 1920x1080 para carregamento rápido</li>
          <li>• Vídeos entre 5-15 minutos têm melhor engajamento</li>
        </ul>
      </div>
    </div>
  )
}