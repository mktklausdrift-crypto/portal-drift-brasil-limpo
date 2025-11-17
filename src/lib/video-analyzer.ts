export interface VideoMetadata {
  duration: number
  width: number
  height: number
  size: number
  format: string
  bitrate?: number
  fps?: number
  hasAudio: boolean
  thumbnails: string[]
}

export interface VideoAnalysisResult {
  metadata: VideoMetadata
  quality: 'baixa' | 'media' | 'alta' | 'muito-alta'
  recommendations: string[]
  compressionSuggested: boolean
  estimatedCompressionRatio?: number
}

export class VideoAnalyzer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  constructor() {
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')!
  }

  async analyzeVideo(file: File): Promise<VideoAnalysisResult> {
    const video = document.createElement('video')
    
    return new Promise((resolve, reject) => {
      video.onloadedmetadata = async () => {
        try {
          const metadata = await this.extractMetadata(video, file)
          const analysis = this.analyzeQuality(metadata)
          
          resolve(analysis)
        } catch (error) {
          reject(error)
        }
      }

      video.onerror = () => reject(new Error('Erro ao carregar vídeo'))
      video.src = URL.createObjectURL(file)
    })
  }

  private async extractMetadata(video: HTMLVideoElement, file: File): Promise<VideoMetadata> {
    const duration = video.duration
    const width = video.videoWidth
    const height = video.videoHeight
    const size = file.size
    const format = file.type.split('/')[1] || 'unknown'

    // Estimar bitrate
    const bitrate = Math.floor((size * 8) / duration) // bits por segundo

    // Gerar thumbnails em momentos específicos
    const thumbnails = await this.generateThumbnails(video, duration)

    // Detectar áudio (método simplificado)
    const hasAudio = await this.detectAudio(video)

    return {
      duration,
      width,
      height,
      size,
      format,
      bitrate,
      fps: 30, // Assumir 30fps por padrão
      hasAudio,
      thumbnails
    }
  }

  private async generateThumbnails(video: HTMLVideoElement, duration: number): Promise<string[]> {
    const thumbnails: string[] = []
    const times = [
      duration * 0.1,  // 10%
      duration * 0.25, // 25%
      duration * 0.5,  // 50%
      duration * 0.75, // 75%
      duration * 0.9   // 90%
    ]

    this.canvas.width = 160
    this.canvas.height = 90

    for (const time of times) {
      try {
        video.currentTime = time
        await this.waitForSeek()
        
        this.ctx.drawImage(video, 0, 0, 160, 90)
        const thumbnail = this.canvas.toDataURL('image/jpeg', 0.8)
        thumbnails.push(thumbnail)
      } catch (error) {
        console.warn('Erro ao gerar thumbnail:', error)
      }
    }

    return thumbnails
  }

  private waitForSeek(): Promise<void> {
    return new Promise((resolve) => {
      const video = document.querySelector('video')
      if (video) {
        video.addEventListener('seeked', () => resolve(), { once: true })
      } else {
        setTimeout(resolve, 100) // Fallback
      }
    })
  }

  private async detectAudio(video: HTMLVideoElement): Promise<boolean> {
    try {
      // Método simplificado - verifica se o vídeo tem trilhas de áudio
      // Em uma implementação real, você usaria Web Audio API
      const videoElement = video as any
      return videoElement.mozHasAudio || 
             videoElement.webkitAudioDecodedByteCount > 0 ||
             video.duration > 0 // Assumir que vídeos com duração têm áudio
    } catch {
      return true // Assumir que tem áudio por padrão
    }
  }

  private analyzeQuality(metadata: VideoMetadata): VideoAnalysisResult {
    const { width, height, size, duration, bitrate } = metadata
    const resolution = width * height
    const sizeMB = size / (1024 * 1024)
    
    let quality: VideoAnalysisResult['quality']
    let recommendations: string[] = []
    let compressionSuggested = false
    let estimatedCompressionRatio: number | undefined

    // Análise de qualidade baseada na resolução e bitrate
    if (resolution >= 3840 * 2160) {
      quality = 'muito-alta'
      recommendations.push('Vídeo em 4K detectado')
      if (sizeMB > 50) {
        compressionSuggested = true
        estimatedCompressionRatio = 60
        recommendations.push('Compressão recomendada para melhor performance')
      }
    } else if (resolution >= 1920 * 1080) {
      quality = 'alta'
      recommendations.push('Vídeo em Full HD')
      if (sizeMB > 30) {
        compressionSuggested = true
        estimatedCompressionRatio = 40
        recommendations.push('Considere compressão para uploads mais rápidos')
      }
    } else if (resolution >= 1280 * 720) {
      quality = 'media'
      recommendations.push('Vídeo em HD')
      if (sizeMB > 20) {
        compressionSuggested = true
        estimatedCompressionRatio = 30
      }
    } else {
      quality = 'baixa'
      recommendations.push('Resolução baixa detectada')
      if (sizeMB > 10) {
        compressionSuggested = true
        estimatedCompressionRatio = 25
      }
    }

    // Análise de bitrate
    if (bitrate && bitrate > 8000000) { // 8 Mbps
      recommendations.push('Bitrate alto - ótima qualidade mas arquivo grande')
    } else if (bitrate && bitrate < 2000000) { // 2 Mbps
      recommendations.push('Bitrate baixo - arquivo pequeno mas qualidade limitada')
    }

    // Análise de duração
    if (duration > 1800) { // 30 minutos
      recommendations.push('Vídeo longo - considere dividir em partes menores')
    } else if (duration < 60) { // 1 minuto
      recommendations.push('Vídeo curto - ideal para engajamento')
    }

    // Análise de formato
    if (metadata.format !== 'mp4' && metadata.format !== 'webm') {
      recommendations.push('Considere converter para MP4 ou WebM para melhor compatibilidade')
    }

    return {
      metadata,
      quality,
      recommendations,
      compressionSuggested,
      estimatedCompressionRatio
    }
  }

  // Método para otimizar configurações de compressão baseado na análise
  getOptimalCompressionSettings(analysis: VideoAnalysisResult): {
    quality: number
    maxWidth: number
    maxHeight: number
    targetBitrate?: number
  } {
    const { metadata, quality } = analysis
    
    let compressionQuality: number
    let maxWidth: number
    let maxHeight: number
    let targetBitrate: number | undefined

    switch (quality) {
      case 'muito-alta':
        compressionQuality = 0.8
        maxWidth = Math.min(metadata.width, 1920)
        maxHeight = Math.min(metadata.height, 1080)
        targetBitrate = 4000000 // 4 Mbps
        break
      
      case 'alta':
        compressionQuality = 0.85
        maxWidth = Math.min(metadata.width, 1920)
        maxHeight = Math.min(metadata.height, 1080)
        targetBitrate = 3000000 // 3 Mbps
        break
      
      case 'media':
        compressionQuality = 0.9
        maxWidth = metadata.width
        maxHeight = metadata.height
        targetBitrate = 2000000 // 2 Mbps
        break
      
      default:
        compressionQuality = 0.95
        maxWidth = metadata.width
        maxHeight = metadata.height
        break
    }

    return {
      quality: compressionQuality,
      maxWidth,
      maxHeight,
      targetBitrate
    }
  }

  // Estimar tamanho final após compressão
  estimateCompressedSize(
    originalSize: number, 
    compressionSettings: { quality: number }
  ): number {
    return Math.floor(originalSize * compressionSettings.quality)
  }

  // Formatar dados para exibição
  formatMetadata(metadata: VideoMetadata): {
    duration: string
    resolution: string
    size: string
    bitrate: string
    format: string
  } {
    const formatDuration = (seconds: number): string => {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = Math.floor(seconds % 60)
      
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      }
      return `${minutes}:${secs.toString().padStart(2, '0')}`
    }

    const formatBytes = (bytes: number): string => {
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      if (bytes === 0) return '0 Bytes'
      const i = Math.floor(Math.log(bytes) / Math.log(1024))
      return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`
    }

    const formatBitrate = (bitrate: number): string => {
      const mbps = bitrate / 1000000
      return `${Math.round(mbps * 100) / 100} Mbps`
    }

    return {
      duration: formatDuration(metadata.duration),
      resolution: `${metadata.width}x${metadata.height}`,
      size: formatBytes(metadata.size),
      bitrate: metadata.bitrate ? formatBitrate(metadata.bitrate) : 'N/A',
      format: metadata.format.toUpperCase()
    }
  }
}