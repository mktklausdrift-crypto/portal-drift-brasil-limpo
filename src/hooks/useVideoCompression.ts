import { useState, useCallback } from 'react'

interface CompressionOptions {
  quality?: number // 0.1 - 1.0
  maxWidth?: number
  maxHeight?: number
  format?: string
}

interface CompressionProgress {
  progress: number
  stage: 'preparing' | 'processing' | 'finalizing' | 'complete'
  estimatedTime?: number
}

export const useVideoCompression = () => {
  const [isCompressing, setIsCompressing] = useState(false)
  const [progress, setProgress] = useState<CompressionProgress>({ progress: 0, stage: 'preparing' })

  const compressVideo = useCallback(async (
    file: File, 
    options: CompressionOptions = {}
  ): Promise<File> => {
    const {
      quality = 0.8,
      maxWidth = 1920,
      maxHeight = 1080,
      format = 'mp4'
    } = options

    setIsCompressing(true)
    setProgress({ progress: 0, stage: 'preparing' })

    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('Não foi possível criar contexto do canvas'))
        return
      }

      video.onloadedmetadata = () => {
        setProgress({ progress: 10, stage: 'processing' })

        // Calcular dimensões mantendo proporção
        let { videoWidth, videoHeight } = video
        
        if (videoWidth > maxWidth || videoHeight > maxHeight) {
          const ratio = Math.min(maxWidth / videoWidth, maxHeight / videoHeight)
          videoWidth *= ratio
          videoHeight *= ratio
        }

        canvas.width = videoWidth
        canvas.height = videoHeight

        // Configurar MediaRecorder para gravação
        const stream = canvas.captureStream(30) // 30 FPS
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: `video/${format}`,
          videoBitsPerSecond: Math.floor(file.size * quality / video.duration)
        })

        const chunks: Blob[] = []
        let currentTime = 0
        const duration = video.duration

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data)
          }
        }

        mediaRecorder.onstop = () => {
          setProgress({ progress: 90, stage: 'finalizing' })
          
          const compressedBlob = new Blob(chunks, { type: `video/${format}` })
          const compressedFile = new File(
            [compressedBlob], 
            file.name.replace(/\.[^/.]+$/, `.${format}`),
            { type: `video/${format}` }
          )

          setProgress({ progress: 100, stage: 'complete' })
          setTimeout(() => {
            setIsCompressing(false)
            resolve(compressedFile)
          }, 500)
        }

        mediaRecorder.onerror = (event) => {
          reject(new Error('Erro na compressão do vídeo'))
        }

        // Iniciar gravação
        mediaRecorder.start()

        // Função para processar frame por frame
        const processFrame = () => {
          if (currentTime >= duration) {
            mediaRecorder.stop()
            return
          }

          video.currentTime = currentTime
          
          video.onseeked = () => {
            ctx.drawImage(video, 0, 0, videoWidth, videoHeight)
            
            const progressPercent = Math.floor((currentTime / duration) * 80) + 10
            setProgress({ 
              progress: progressPercent, 
              stage: 'processing',
              estimatedTime: Math.floor((duration - currentTime) * 1000 / 30)
            })
            
            currentTime += 1/30 // Próximo frame (30 FPS)
            setTimeout(processFrame, 33) // ~30 FPS
          }
        }

        processFrame()
      }

      video.onerror = () => {
        reject(new Error('Erro ao carregar vídeo para compressão'))
      }

      video.src = URL.createObjectURL(file)
    })
  }, [])

  const getCompressionRatio = useCallback((originalSize: number, compressedSize: number): number => {
    return Math.round(((originalSize - compressedSize) / originalSize) * 100)
  }, [])

  const estimateCompressedSize = useCallback((
    originalSize: number, 
    quality: number = 0.8
  ): number => {
    return Math.floor(originalSize * quality)
  }, [])

  return {
    compressVideo,
    isCompressing,
    progress,
    getCompressionRatio,
    estimateCompressedSize
  }
}