import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir, readFile, unlink } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import crypto from "crypto"
import { requireInstructorOrAdmin } from "@/lib/auth-middleware"

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "videos")
const THUMB_DIR = path.join(process.cwd(), "public", "uploads", "thumbnails")
const TEMP_DIR = path.join(process.cwd(), "temp", "uploads")

// Configurações
// Alinha com o front (VideoUploader default 500MB)
const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB
const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime', 
  'video/x-msvideo',
  'video/x-matroska',
  'video/webm'
]

// Garante que os diretórios existem
async function ensureDirectories() {
  const dirs = [UPLOAD_DIR, THUMB_DIR, TEMP_DIR]
  for (const dir of dirs) {
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true })
    }
  }
}

// Processar thumbnail (versão básica sem Sharp para evitar dependências)
async function processThumbnail(thumbnailData: string, fileName: string): Promise<string> {
  try {
    // Converter base64 para buffer
    const base64Data = thumbnailData.replace(/^data:image\/[a-z]+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')
    
    // Gerar nome do thumbnail
    const thumbName = fileName.replace(/\.[^/.]+$/, '.jpg')
    const thumbPath = path.join(THUMB_DIR, thumbName)
    
    // Salvar thumbnail (sem otimização por enquanto)
    await writeFile(thumbPath, buffer)
    
    return `/uploads/thumbnails/${thumbName}`
  } catch (error) {
    console.error('Erro ao processar thumbnail:', error)
    throw new Error('Erro ao processar thumbnail')
  }
}

// Validar arquivo de vídeo
function validateVideoFile(fileType: string, fileSize: number): { valid: boolean; error?: string } {
  // Verificar tipo
  if (!ALLOWED_VIDEO_TYPES.includes(fileType)) {
    return {
      valid: false,
      error: `Tipo de arquivo não suportado. Tipos aceitos: ${ALLOWED_VIDEO_TYPES.map(t => t.split('/')[1]).join(', ')}`
    }
  }
  
  // Verificar tamanho
  if (fileSize > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    }
  }
  
  return { valid: true }
}

export async function POST(request: NextRequest) {
  try {
    // Verifica autenticação e permissão
    const authResult = await requireInstructorOrAdmin()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    await ensureDirectories()

    const formData = await request.formData()
    
    // Verificar se é upload chunked ou simples
    const chunk = formData.get("chunk") as File
    const thumbnailData = formData.get("thumbnail") as string
    
    if (chunk) {
      // Upload chunked (existente)
      return handleChunkedUpload(formData)
    } else {
      // Upload simples com thumbnail
      return handleSimpleUpload(formData, thumbnailData)
    }
  } catch (error) {
    console.error("Erro no upload:", error)
    return NextResponse.json(
      { error: "Erro ao processar upload" },
      { status: 500 }
    )
  }
}

// Upload chunked (mantém funcionalidade existente)
async function handleChunkedUpload(formData: FormData) {
  const chunk = formData.get("chunk") as File
  const chunkIndex = parseInt(formData.get("chunkIndex") as string)
  const totalChunks = parseInt(formData.get("totalChunks") as string)
  const uploadId = formData.get("uploadId") as string
  const fileName = formData.get("fileName") as string
  const fileType = formData.get("fileType") as string
  const fileSize = parseInt(formData.get("fileSize") as string)

  if (!chunk || isNaN(chunkIndex) || isNaN(totalChunks) || !uploadId || !fileName) {
    return NextResponse.json(
      { error: "Dados do chunk inválidos" },
      { status: 400 }
    )
  }

  // Validar arquivo no primeiro chunk
  if (chunkIndex === 0) {
    // Validação somente se metadados presentes
    if (fileType && Number.isFinite(fileSize)) {
      const validation = validateVideoFile(fileType, fileSize)
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        )
      }
    }
  }

  // Salva o chunk temporário
  const chunkPath = path.join(TEMP_DIR, `${uploadId}-chunk-${chunkIndex}`)
  const bytes = await chunk.arrayBuffer()
  const buffer = Buffer.from(bytes)
  await writeFile(chunkPath, buffer)

  // Se é o último chunk, monta o arquivo final
  if (chunkIndex === totalChunks - 1) {
    const fileExtension = path.extname(fileName)
    const finalFileName = `${uploadId}${fileExtension}`
    const finalPath = path.join(UPLOAD_DIR, finalFileName)

    // Lê e combina todos os chunks
    const chunks: Buffer[] = []
    for (let i = 0; i < totalChunks; i++) {
      const chunkFilePath = path.join(TEMP_DIR, `${uploadId}-chunk-${i}`)
      const chunkData = await readFile(chunkFilePath)
      chunks.push(chunkData)
    }

    // Escreve arquivo final
    const finalBuffer = Buffer.concat(chunks)
    await writeFile(finalPath, finalBuffer)

    // Remove chunks temporários
    for (let i = 0; i < totalChunks; i++) {
      const chunkFilePath = path.join(TEMP_DIR, `${uploadId}-chunk-${i}`)
      try {
        await unlink(chunkFilePath)
      } catch (err) {
        console.error("Erro ao remover chunk:", err)
      }
    }

    const url = `/uploads/videos/${finalFileName}`

    return NextResponse.json({
      success: true,
      url,
      fileName: finalFileName,
      message: "Upload concluído com sucesso"
    })
  }

  return NextResponse.json({
    success: true,
    message: `Chunk ${chunkIndex + 1}/${totalChunks} recebido`
  })
}

// Upload simples com thumbnail
async function handleSimpleUpload(formData: FormData, thumbnailData?: string) {
  const videoFile = formData.get("video") as File
  
  if (!videoFile) {
    return NextResponse.json(
      { error: "Nenhum arquivo de vídeo fornecido" },
      { status: 400 }
    )
  }

  // Validar arquivo
  const validation = validateVideoFile(videoFile.type, videoFile.size)
  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400 }
    )
  }

  // Gerar nome único
  const uniqueId = crypto.randomBytes(16).toString('hex')
  const timestamp = Date.now()
  const fileExtension = path.extname(videoFile.name)
  const finalFileName = `${timestamp}_${uniqueId}${fileExtension}`
  const videoPath = path.join(UPLOAD_DIR, finalFileName)
  
  // Salvar vídeo
  const videoBuffer = Buffer.from(await videoFile.arrayBuffer())
  await writeFile(videoPath, videoBuffer)
  
  // Processar thumbnail se fornecido
  let thumbnailUrl = null
  if (thumbnailData) {
    try {
      thumbnailUrl = await processThumbnail(thumbnailData, finalFileName)
    } catch (error) {
      console.warn('Erro ao processar thumbnail, continuando sem thumbnail:', error)
    }
  }
  
  // URLs de retorno
  const videoUrl = `/uploads/videos/${finalFileName}`
  
  return NextResponse.json({
    success: true,
    message: 'Vídeo enviado com sucesso',
    url: videoUrl,
    thumbnailUrl,
    fileName: finalFileName,
    originalName: videoFile.name,
    size: videoFile.size,
    type: videoFile.type
  })
}

// Permite uploads grandes
export const config = {
  api: {
    bodyParser: false
  }
}
