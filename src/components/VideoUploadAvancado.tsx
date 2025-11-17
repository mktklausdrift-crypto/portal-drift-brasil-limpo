"use client"

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Upload, 
  Video, 
  X, 
  Check, 
  AlertCircle, 
  FileVideo,
  Play,
  Pause,
  Volume2,
  VolumeX
} from "lucide-react"
// import { useDropzone } from "react-dropzone" // Removido para evitar dependência extra

interface VideoUploadProps {
  onUpload: (file: File, thumbnail?: string) => Promise<string>
  onError?: (error: string) => void
  maxSize?: number // em MB
  allowedFormats?: string[]
  className?: string
  existing?: {
    url: string
    name: string
  }
}

interface VideoPreview {
  file: File
  url: string
  thumbnail?: string
  duration?: number
  size: string
  format: string
}

export default function VideoUploadAvancado({
  onUpload,
  onError,
  maxSize = 100, // 100MB por padrão
  allowedFormats = ['mp4', 'mov', 'avi', 'mkv', 'webm'],
  className = "",
  existing
}: VideoUploadProps) {
  const [preview, setPreview] = useState<VideoPreview | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string>("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Gerar thumbnail do vídeo
  const generateThumbnail = useCallback((videoFile: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      video.crossOrigin = 'anonymous'
      video.currentTime = 1 // Pegar frame no segundo 1
      
      video.onloadeddata = () => {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        
        if (ctx) {
          ctx.drawImage(video, 0, 0)
          const thumbnail = canvas.toDataURL('image/jpeg', 0.8)
          resolve(thumbnail)
        } else {
          reject(new Error('Não foi possível criar contexto do canvas'))
        }
      }
      
      video.onerror = () => reject(new Error('Erro ao carregar vídeo'))
      video.src = URL.createObjectURL(videoFile)
    })
  }, [])

  // Validar arquivo de vídeo
  const validateVideo = useCallback((file: File): string | null => {
    // Verificar tamanho
    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > maxSize) {
      return `Arquivo muito grande. Máximo permitido: ${maxSize}MB`
    }

    // Verificar formato
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!extension || !allowedFormats.includes(extension)) {
      return `Formato não suportado. Formatos aceitos: ${allowedFormats.join(', ')}`
    }

    return null
  }, [maxSize, allowedFormats])

  // Obter informações do vídeo
  const getVideoInfo = useCallback((file: File): Promise<{ duration: number }> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      
      video.onloadedmetadata = () => {
        resolve({
          duration: video.duration
        })
      }
      
      video.onerror = () => reject(new Error('Erro ao carregar metadados do vídeo'))
      video.src = URL.createObjectURL(file)
    })
  }, [])

  // Processar arquivo selecionado
  const processFile = useCallback(async (file: File) => {
    setError("")
    
    // Validar arquivo
    const validationError = validateVideo(file)
    if (validationError) {
      setError(validationError)
      onError?.(validationError)
      return
    }

    try {
      // Obter informações do vídeo
      const videoInfo = await getVideoInfo(file)
      
      // Gerar thumbnail
      const thumbnail = await generateThumbnail(file)
      
      // Criar preview
      const videoPreview: VideoPreview = {
        file,
        url: URL.createObjectURL(file),
        thumbnail,
        duration: videoInfo.duration,
        size: (file.size / (1024 * 1024)).toFixed(2),
        format: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN'
      }
      
      setPreview(videoPreview)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao processar vídeo'
      setError(errorMsg)
      onError?.(errorMsg)
    }
  }, [validateVideo, getVideoInfo, generateThumbnail, onError])

  // Implementação nativa de drag & drop
  const [isDragActive, setIsDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      processFile(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processFile(files[0])
    }
  }

  // Upload do vídeo
  const handleUpload = async () => {
    if (!preview) return

    setUploading(true)
    setUploadProgress(0)

    try {
      // Simular progresso
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 15
        })
      }, 200)

      const uploadUrl = await onUpload(preview.file, preview.thumbnail)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      // Limpar após sucesso
      setTimeout(() => {
        setPreview(null)
        setUploading(false)
        setUploadProgress(0)
      }, 1500)
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro no upload'
      setError(errorMsg)
      onError?.(errorMsg)
      setUploading(false)
      setUploadProgress(0)
    }
  }

  // Controles do player
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  // Remover preview
  const removePreview = () => {
    if (preview) {
      URL.revokeObjectURL(preview.url)
      setPreview(null)
    }
    setError("")
  }

  // Formatar duração
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={`w-full ${className}`}>
      <AnimatePresence mode="wait">
        {!preview && !existing ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
              ${isDragActive 
                ? 'border-primary bg-primary/5 scale-105' 
                : 'border-gray-300 hover:border-primary hover:bg-gray-50'
              }
            `}
          >
            <input 
              ref={fileInputRef}
              type="file"
              accept={allowedFormats.map(format => `.${format}`).join(',')}
              onChange={handleFileInput}
              className="hidden"
            />
            
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className={`
                  w-16 h-16 rounded-full flex items-center justify-center transition-colors
                  ${isDragActive ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}
                `}>
                  {isDragActive ? <Video className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {isDragActive ? 'Solte o vídeo aqui' : 'Upload de Vídeo'}
                </h3>
                <p className="text-gray-600 mb-4">
                  Arraste um vídeo ou clique para selecionar
                </p>
                
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Formatos aceitos: {allowedFormats.join(', ').toUpperCase()}</p>
                  <p>Tamanho máximo: {maxSize}MB</p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : existing && !preview ? (
          <motion.div
            key="existing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 rounded-xl p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileVideo className="w-6 h-6 text-primary" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{existing.name}</h3>
                <p className="text-sm text-gray-600">Vídeo atual</p>
              </div>
              
              <button
                onClick={() => setPreview(null)}
                className="px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
              >
                Alterar vídeo
              </button>
            </div>
          </motion.div>
        ) : preview && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Preview do vídeo */}
            <div className="relative bg-black rounded-xl overflow-hidden">
              <video
                ref={videoRef}
                src={preview.url}
                className="w-full h-64 object-contain"
                muted={isMuted}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              
              {/* Controles do player */}
              <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="flex items-center gap-4">
                  <button
                    onClick={togglePlay}
                    className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                  </button>
                  
                  <button
                    onClick={toggleMute}
                    className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              {/* Botão remover */}
              <button
                onClick={removePreview}
                className="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Informações do arquivo */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Nome:</span>
                  <p className="font-medium truncate">{preview.file.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Tamanho:</span>
                  <p className="font-medium">{preview.size} MB</p>
                </div>
                <div>
                  <span className="text-gray-600">Formato:</span>
                  <p className="font-medium">{preview.format}</p>
                </div>
                {preview.duration && (
                  <div>
                    <span className="text-gray-600">Duração:</span>
                    <p className="font-medium">{formatDuration(preview.duration)}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Barra de progresso */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Enviando vídeo...</span>
                  <span className="text-primary font-medium">{Math.round(uploadProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-primary h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}
            
            {/* Botão de upload */}
            <button
              onClick={handleUpload}
              disabled={uploading || uploadProgress === 100}
              className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {uploadProgress === 100 ? (
                <>
                  <Check className="w-5 h-5" />
                  Upload concluído
                </>
              ) : uploading ? (
                'Enviando...'
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Fazer upload
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Mensagens de erro */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-900">Erro no upload</h4>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}