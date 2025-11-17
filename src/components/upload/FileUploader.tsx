'use client'

import React, { useState, useRef } from 'react'
import { 
  FileText, 
  Upload, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  File,
  FileSpreadsheet,
  FileImage,
  FileVideo,
  FileArchive,
  FileCode
} from 'lucide-react'

interface FileUploaderProps {
  onUploadComplete?: (files: UploadedFile[]) => void
  maxSizeMB?: number
  maxFiles?: number
  allowedTypes?: string[]
  multiple?: boolean
}

export interface UploadedFile {
  url: string
  fileName: string
  originalName: string
  size: number
  type: string
}

interface UploadProgress {
  fileName: string
  progress: number
  status: 'uploading' | 'complete' | 'error'
  error?: string
}

const ALLOWED_TYPES = {
  // Documentos
  'application/pdf': { ext: '.pdf', icon: FileText, color: 'text-red-500' },
  'application/msword': { ext: '.doc', icon: FileText, color: 'text-blue-500' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: '.docx', icon: FileText, color: 'text-blue-500' },
  
  // Planilhas
  'application/vnd.ms-excel': { ext: '.xls', icon: FileSpreadsheet, color: 'text-green-500' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { ext: '.xlsx', icon: FileSpreadsheet, color: 'text-green-500' },
  
  // Apresentações
  'application/vnd.ms-powerpoint': { ext: '.ppt', icon: FileImage, color: 'text-orange-500' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { ext: '.pptx', icon: FileImage, color: 'text-orange-500' },
  
  // Texto
  'text/plain': { ext: '.txt', icon: FileText, color: 'text-gray-500' },
  'text/markdown': { ext: '.md', icon: FileText, color: 'text-purple-500' },
  
  // Código
  'application/json': { ext: '.json', icon: FileCode, color: 'text-yellow-500' },
  'application/xml': { ext: '.xml', icon: FileCode, color: 'text-cyan-500' },
  'text/html': { ext: '.html', icon: FileCode, color: 'text-orange-500' },
  'text/css': { ext: '.css', icon: FileCode, color: 'text-blue-400' },
  'text/javascript': { ext: '.js', icon: FileCode, color: 'text-yellow-400' },
  'application/typescript': { ext: '.ts', icon: FileCode, color: 'text-blue-600' },
  
  // Compactados
  'application/zip': { ext: '.zip', icon: FileArchive, color: 'text-indigo-500' },
  'application/x-rar-compressed': { ext: '.rar', icon: FileArchive, color: 'text-indigo-600' },
  'application/x-7z-compressed': { ext: '.7z', icon: FileArchive, color: 'text-indigo-700' },
  
  // Imagens (caso necessário)
  'image/jpeg': { ext: '.jpg', icon: FileImage, color: 'text-pink-500' },
  'image/png': { ext: '.png', icon: FileImage, color: 'text-pink-600' },
  'image/webp': { ext: '.webp', icon: FileImage, color: 'text-pink-400' },
  
  // Vídeos (caso necessário)
  'video/mp4': { ext: '.mp4', icon: FileVideo, color: 'text-purple-600' },
  'video/quicktime': { ext: '.mov', icon: FileVideo, color: 'text-purple-500' },
}

const DEFAULT_ALLOWED_TYPES = Object.keys(ALLOWED_TYPES)

export default function FileUploader({
  onUploadComplete,
  maxSizeMB = 50,
  maxFiles = 10,
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  multiple = true
}: FileUploaderProps) {
  const [uploads, setUploads] = useState<UploadProgress[]>([])
  const [completedFiles, setCompletedFiles] = useState<UploadedFile[]>([])
  const [error, setError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFileIcon = (mimeType: string) => {
    const fileInfo = ALLOWED_TYPES[mimeType as keyof typeof ALLOWED_TYPES]
    return fileInfo ? fileInfo.icon : File
  }

  const getFileColor = (mimeType: string) => {
    const fileInfo = ALLOWED_TYPES[mimeType as keyof typeof ALLOWED_TYPES]
    return fileInfo ? fileInfo.color : 'text-gray-500'
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const validateFile = (file: File): string | null => {
    // Validar tipo
    if (!allowedTypes.includes(file.type)) {
      return `Tipo de arquivo não permitido: ${file.type}`
    }

    // Validar tamanho
    const maxSize = maxSizeMB * 1024 * 1024
    if (file.size > maxSize) {
      return `Arquivo muito grande. Máximo: ${maxSizeMB}MB`
    }

    return null
  }

  const uploadFile = async (file: File): Promise<UploadedFile | null> => {
    try {
      // Validar arquivo
      const validationError = validateFile(file)
      if (validationError) {
        throw new Error(validationError)
      }

      // Atualizar progresso
      setUploads(prev => [...prev, {
        fileName: file.name,
        progress: 0,
        status: 'uploading'
      }])

      // Criar FormData
      const formData = new FormData()
      formData.append('file', file)

      // Upload com progress tracking
      const xhr = new XMLHttpRequest()

      // Criar promise para aguardar upload
      const uploadPromise = new Promise<UploadedFile>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100)
            setUploads(prev => prev.map(u =>
              u.fileName === file.name
                ? { ...u, progress: percentComplete }
                : u
            ))
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText)
            resolve(response)
          } else {
            reject(new Error(xhr.responseText || 'Erro no upload'))
          }
        })

        xhr.addEventListener('error', () => {
          reject(new Error('Erro de rede'))
        })

        xhr.open('POST', '/api/upload/files')
        xhr.send(formData)
      })

      const result = await uploadPromise

      // Atualizar status para completo
      setUploads(prev => prev.map(u =>
        u.fileName === file.name
          ? { ...u, status: 'complete' as const, progress: 100 }
          : u
      ))

      return result

    } catch (err: any) {
      // Atualizar status para erro
      setUploads(prev => prev.map(u =>
        u.fileName === file.name
          ? { ...u, status: 'error' as const, error: err.message }
          : u
      ))
      return null
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (files.length === 0) return

    // Verificar limite de arquivos
    if (files.length > maxFiles) {
      setError(`Máximo de ${maxFiles} arquivos permitidos`)
      return
    }

    setError('')
    setUploads([])

    // Upload de todos os arquivos
    const results = await Promise.all(files.map(uploadFile))
    
    // Filtrar apenas sucesso
    const successful = results.filter((r): r is UploadedFile => r !== null)
    
    setCompletedFiles(successful)
    
    if (onUploadComplete && successful.length > 0) {
      onUploadComplete(successful)
    }

    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeUpload = (fileName: string) => {
    setUploads(prev => prev.filter(u => u.fileName !== fileName))
    setCompletedFiles(prev => prev.filter(f => f.originalName !== fileName))
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const files = Array.from(e.dataTransfer.files)
    
    if (files.length === 0) return

    // Verificar limite de arquivos
    if (files.length > maxFiles) {
      setError(`Máximo de ${maxFiles} arquivos permitidos`)
      return
    }

    setError('')
    setUploads([])

    // Upload de todos os arquivos
    const results = await Promise.all(files.map(uploadFile))
    
    // Filtrar apenas sucesso
    const successful = results.filter((r): r is UploadedFile => r !== null)
    
    setCompletedFiles(successful)
    
    if (onUploadComplete && successful.length > 0) {
      onUploadComplete(successful)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <div className="w-full">
      {/* Área de Upload */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-sm text-gray-600 mb-2">
          Clique ou arraste arquivos aqui
        </p>
        <p className="text-xs text-gray-500">
          Máximo: {maxSizeMB}MB por arquivo • {maxFiles} arquivos
        </p>
        <p className="text-xs text-gray-400 mt-2">
          PDF, Word, Excel, PowerPoint, ZIP, etc.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        multiple={multiple}
        accept={allowedTypes.join(',')}
      />

      {/* Erro Geral */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Lista de Uploads */}
      {uploads.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploads.map((upload, idx) => {
            const Icon = getFileIcon('')
            const isCompleted = upload.status === 'complete'
            const isError = upload.status === 'error'

            return (
              <div
                key={idx}
                className={`p-4 border rounded-lg ${
                  isCompleted
                    ? 'bg-green-50 border-green-200'
                    : isError
                    ? 'bg-red-50 border-red-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : isError ? (
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    ) : (
                      <Loader2 className="h-5 w-5 text-blue-500 animate-spin flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{upload.fileName}</p>
                      {isError && upload.error && (
                        <p className="text-xs text-red-600">{upload.error}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeUpload(upload.fileName)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Progress Bar */}
                {!isError && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isCompleted ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Arquivos Completados */}
      {completedFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Arquivos Enviados ({completedFiles.length})
          </h4>
          <div className="space-y-2">
            {completedFiles.map((file, idx) => {
              const Icon = getFileIcon(file.type)
              const color = getFileColor(file.type)

              return (
                <div
                  key={idx}
                  className="p-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Icon className={`h-8 w-8 ${color} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.originalName}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                  >
                    Abrir
                  </a>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
