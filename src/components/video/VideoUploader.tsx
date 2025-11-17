"use client"

import { useState, useRef, ChangeEvent } from "react"
import { 
  Upload, 
  Video, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Play,
  Pause,
  XCircle
} from "lucide-react"

interface VideoUploaderProps {
  onUploadComplete: (url: string, thumbnailUrl?: string) => void
  maxSizeMB?: number
  generateThumbnail?: boolean
}

interface VideoMetadata {
  duration: number
  width: number
  height: number
  size: string
}

export default function VideoUploader({ 
  onUploadComplete, 
  maxSizeMB = 500,
  generateThumbnail = true 
}: VideoUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null)
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const [canCancel, setCanCancel] = useState(false)
  const [uploadController, setUploadController] = useState<AbortController | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const extractVideoMetadata = (file: File, videoElement: HTMLVideoElement): Promise<VideoMetadata> => {
    return new Promise((resolve) => {
      videoElement.onloadedmetadata = () => {
        resolve({
          duration: videoElement.duration,
          width: videoElement.videoWidth,
          height: videoElement.videoHeight,
          size: formatFileSize(file.size)
        })
      }
    })
  }

  const generateVideoThumbnail = (videoElement: HTMLVideoElement): Promise<string> => {
    return new Promise((resolve) => {
      // Aguardar vídeo carregar
      videoElement.onloadeddata = () => {
        // Ir para 1 segundo ou 10% do vídeo
        const seekTime = Math.min(1, videoElement.duration * 0.1)
        videoElement.currentTime = seekTime

        videoElement.onseeked = () => {
          const canvas = document.createElement('canvas')
          canvas.width = videoElement.videoWidth
          canvas.height = videoElement.videoHeight
          
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)
            const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8)
            resolve(thumbnailDataUrl)
          }
        }
      }
    })
  }

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validações
    if (!file.type.startsWith("video/")) {
      setError("Por favor, selecione um arquivo de vídeo válido")
      return
    }

    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSizeMB) {
      setError(`O arquivo deve ter no máximo ${maxSizeMB}MB`)
      return
    }

    setError(null)
    const previewUrl = URL.createObjectURL(file)
    setPreview(previewUrl)

    // Criar elemento de vídeo temporário para extrair metadados
    const videoElement = document.createElement('video')
    videoElement.src = previewUrl

    // Extrair metadados
    const meta = await extractVideoMetadata(file, videoElement)
    setMetadata(meta)

    // Gerar thumbnail
    if (generateThumbnail) {
      try {
        const thumbUrl = await generateVideoThumbnail(videoElement)
        setThumbnail(thumbUrl)
      } catch (err) {
        console.error('Erro ao gerar thumbnail:', err)
      }
    }

    // Fazer upload
    await uploadChunked(file)
  }

  const cancelUpload = () => {
    if (uploadController) {
      uploadController.abort()
      setUploadController(null)
      setUploading(false)
      setProgress(0)
      setError('Upload cancelado')
    }
  }

  const uploadChunked = async (file: File) => {
    setUploading(true)
    setProgress(0)
    setCanCancel(true)

    const controller = new AbortController()
    setUploadController(controller)

    try {
      const CHUNK_SIZE = 5 * 1024 * 1024 // 5MB por chunk
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
      const uploadId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        // Verificar se foi cancelado
        if (controller.signal.aborted) {
          throw new Error('Upload cancelado')
        }

        const start = chunkIndex * CHUNK_SIZE
        const end = Math.min(start + CHUNK_SIZE, file.size)
        const chunk = file.slice(start, end)

        const formData = new FormData()
        formData.append("chunk", chunk)
        formData.append("chunkIndex", chunkIndex.toString())
        formData.append("totalChunks", totalChunks.toString())
        formData.append("uploadId", uploadId)
        formData.append("fileName", file.name)
        // Metadados exigidos pelo backend no primeiro chunk
        if (chunkIndex === 0) {
          formData.append("fileType", file.type)
          formData.append("fileSize", String(file.size))
        }

        // Adicionar thumbnail se disponível e for o último chunk
        if (thumbnail && chunkIndex === totalChunks - 1) {
          formData.append("thumbnail", thumbnail)
        }

        // Retry leve com backoff exponencial para robustez em redes instáveis
        const maxAttempts = 3
        let attempt = 0
        let lastErr: any = null
        while (attempt < maxAttempts) {
          try {
            const response = await fetch("/api/upload/video", {
              method: "POST",
              body: formData,
              signal: controller.signal,
              credentials: "include",
            })
            if (!response.ok) {
              let msg = `Erro ao fazer upload do chunk ${chunkIndex + 1}/${totalChunks} (status ${response.status})`
              try {
                const errData = await response.json()
                if (errData?.error) msg += `: ${errData.error}`
              } catch (_) {}
              throw new Error(msg)
            }
            const data = await response.json()
            // Atualiza progresso
            setProgress(Math.round(((chunkIndex + 1) / totalChunks) * 100))
            // Se foi o último chunk, recebe a URL final
            if (data.url) {
              onUploadComplete(data.url, data.thumbnailUrl)
            }
            lastErr = null
            break
          } catch (e) {
            lastErr = e
            attempt++
            if (attempt >= maxAttempts) break
            // backoff 200ms, 400ms
            await new Promise((r) => setTimeout(r, 200 * attempt))
          }
        }
        if (lastErr) throw lastErr
      }
    } catch (err: any) {
      console.error("Erro no upload:", err)
      if (err.name === 'AbortError' || err.message === 'Upload cancelado') {
        setError('Upload cancelado pelo usuário')
      } else {
        setError(err?.message || "Erro ao fazer upload do vídeo. Tente novamente.")
      }
    } finally {
      setUploading(false)
      setCanCancel(false)
      setUploadController(null)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const file = e.dataTransfer.files[0]
    if (!file) return

    // Simular seleção de arquivo
    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(file)
    if (fileInputRef.current) {
      fileInputRef.current.files = dataTransfer.files
      await handleFileSelect({ target: { files: dataTransfer.files } } as any)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const resetUploader = () => {
    setPreview(null)
    setMetadata(null)
    setThumbnail(null)
    setError(null)
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      {/* Área de Upload/Preview */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />

        {!preview ? (
          <div>
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              Clique ou arraste um vídeo aqui
            </p>
            <p className="text-xs text-gray-500">
              Máximo {maxSizeMB}MB • MP4, MOV, AVI, MKV, WebM
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Preview do Vídeo */}
            <div className="relative">
              <video
                ref={videoRef}
                src={preview}
                controls
                className="max-h-64 mx-auto rounded-lg shadow-lg"
              />
              {thumbnail && (
                <div className="mt-2 text-xs text-gray-500">
                  ✓ Thumbnail gerado automaticamente
                </div>
              )}
            </div>

            {/* Metadados */}
            {metadata && (
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-600">
                    <Video className="inline h-4 w-4 mr-1" />
                    Duração:
                  </div>
                  <div className="font-medium">{formatDuration(metadata.duration)}</div>
                  
                  <div className="text-gray-600">Resolução:</div>
                  <div className="font-medium">{metadata.width}x{metadata.height}</div>
                  
                  <div className="text-gray-600">Tamanho:</div>
                  <div className="font-medium">{metadata.size}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {!uploading && (
          <div className="mt-4 flex gap-2 justify-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {preview ? "Trocar vídeo" : "Selecionar vídeo"}
            </button>
            {preview && (
              <button
                type="button"
                onClick={resetUploader}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Limpar
              </button>
            )}
          </div>
        )}
      </div>

      {/* Progress Bar com Cancelamento */}
      {uploading && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
              <span className="text-sm font-medium">Fazendo upload...</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-blue-600">{progress}%</span>
              {canCancel && (
                <button
                  onClick={cancelUpload}
                  className="text-red-600 hover:text-red-700 flex items-center gap-1 text-sm"
                >
                  <XCircle className="h-4 w-4" />
                  Cancelar
                </button>
              )}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Mensagens de Erro/Sucesso */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {progress === 100 && !error && !uploading && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm">Upload concluído com sucesso!</span>
        </div>
      )}
    </div>
  )
}
