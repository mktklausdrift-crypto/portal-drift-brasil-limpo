import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'
import { requireInstructorOrAdmin } from '@/lib/auth-middleware'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'files')
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

const ALLOWED_TYPES = {
  // Documentos
  'application/pdf': { ext: '.pdf', maxSize: 50 * 1024 * 1024 },
  'application/msword': { ext: '.doc', maxSize: 25 * 1024 * 1024 },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: '.docx', maxSize: 25 * 1024 * 1024 },
  
  // Planilhas
  'application/vnd.ms-excel': { ext: '.xls', maxSize: 25 * 1024 * 1024 },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { ext: '.xlsx', maxSize: 25 * 1024 * 1024 },
  
  // Apresentações
  'application/vnd.ms-powerpoint': { ext: '.ppt', maxSize: 50 * 1024 * 1024 },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { ext: '.pptx', maxSize: 50 * 1024 * 1024 },
  
  // Texto
  'text/plain': { ext: '.txt', maxSize: 10 * 1024 * 1024 },
  'text/markdown': { ext: '.md', maxSize: 10 * 1024 * 1024 },
  
  // Código
  'application/json': { ext: '.json', maxSize: 10 * 1024 * 1024 },
  'application/xml': { ext: '.xml', maxSize: 10 * 1024 * 1024 },
  'text/html': { ext: '.html', maxSize: 10 * 1024 * 1024 },
  'text/css': { ext: '.css', maxSize: 5 * 1024 * 1024 },
  'text/javascript': { ext: '.js', maxSize: 5 * 1024 * 1024 },
  'application/typescript': { ext: '.ts', maxSize: 5 * 1024 * 1024 },
  
  // Compactados
  'application/zip': { ext: '.zip', maxSize: 100 * 1024 * 1024 },
  'application/x-rar-compressed': { ext: '.rar', maxSize: 100 * 1024 * 1024 },
  'application/x-7z-compressed': { ext: '.7z', maxSize: 100 * 1024 * 1024 },
  
  // Imagens
  'image/jpeg': { ext: '.jpg', maxSize: 10 * 1024 * 1024 },
  'image/png': { ext: '.png', maxSize: 10 * 1024 * 1024 },
  'image/webp': { ext: '.webp', maxSize: 10 * 1024 * 1024 },
  
  // Vídeos (para completude)
  'video/mp4': { ext: '.mp4', maxSize: 500 * 1024 * 1024 },
  'video/quicktime': { ext: '.mov', maxSize: 500 * 1024 * 1024 },
}

/**
 * Garante que o diretório de upload existe
 */
async function ensureUploadDirectory() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true })
  }
}

/**
 * Valida o arquivo
 */
function validateFile(file: File): { valid: boolean; error?: string } {
  // Validar tipo
  const fileInfo = ALLOWED_TYPES[file.type as keyof typeof ALLOWED_TYPES]
  
  if (!fileInfo) {
    return {
      valid: false,
      error: `Tipo de arquivo não permitido: ${file.type}`
    }
  }

  // Validar tamanho
  if (file.size > fileInfo.maxSize) {
    const maxSizeMB = Math.round(fileInfo.maxSize / (1024 * 1024))
    return {
      valid: false,
      error: `Arquivo muito grande. Máximo para ${fileInfo.ext}: ${maxSizeMB}MB`
    }
  }

  // Validar tamanho geral
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Arquivo muito grande. Máximo geral: ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    }
  }

  return { valid: true }
}

/**
 * Gera nome único para o arquivo
 */
function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 8)
  const ext = path.extname(originalName)
  const nameWithoutExt = path.basename(originalName, ext)
  
  // Limpar nome do arquivo (remover caracteres especiais)
  const cleanName = nameWithoutExt
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .substring(0, 50)
  
  return `${cleanName}_${timestamp}_${randomStr}${ext}`
}

/**
 * Valida magic bytes do arquivo para prevenir falsificação de extensão
 */
async function validateFileMagicBytes(file: File): Promise<boolean> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer).slice(0, 4)
    
    // Magic bytes conhecidos
    const magicBytes: Record<string, number[][]> = {
      'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
      'application/zip': [[0x50, 0x4B, 0x03, 0x04]], // PK..
      'image/jpeg': [[0xFF, 0xD8, 0xFF]], // JPEG
      'image/png': [[0x89, 0x50, 0x4E, 0x47]], // PNG
      // Adicionar mais conforme necessário
    }
    
    const expectedBytes = magicBytes[file.type]
    if (!expectedBytes) {
      // Se não temos magic bytes definidos, permitir
      return true
    }
    
    // Verificar se algum dos padrões corresponde
    return expectedBytes.some(pattern => {
      return pattern.every((byte, index) => bytes[index] === byte)
    })
  } catch (error) {
    console.error('Erro ao validar magic bytes:', error)
    return true // Em caso de erro, permitir (pode ajustar conforme necessário)
  }
}

/**
 * POST /api/upload/files
 * Upload de arquivos diversos (PDFs, documentos, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const authResponse = await requireInstructorOrAdmin()
    if (authResponse) {
      return authResponse
    }

    // Garantir que o diretório existe
    await ensureUploadDirectory()

    // Obter arquivo do FormData
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      )
    }

    // Validar arquivo
    const validation = validateFile(file)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Validar magic bytes (segurança extra)
    const magicBytesValid = await validateFileMagicBytes(file)
    if (!magicBytesValid) {
      return NextResponse.json(
        { error: 'Arquivo corrompido ou tipo inválido' },
        { status: 400 }
      )
    }

    // Gerar nome único
    const fileName = generateUniqueFileName(file.name)
    const filePath = path.join(UPLOAD_DIR, fileName)

    // Converter arquivo para buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Salvar arquivo
    await writeFile(filePath, buffer)

    // URL do arquivo (relativo a public/)
    const fileUrl = `/uploads/files/${fileName}`

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: fileName,
      originalName: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Erro no upload de arquivo:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao fazer upload do arquivo' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/upload/files
 * Listar arquivos (futuro)
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const authResponse = await requireInstructorOrAdmin()
    if (authResponse) {
      return authResponse
    }

    return NextResponse.json({
      message: 'Funcionalidade de listagem em desenvolvimento',
      info: 'Use esta rota para listar arquivos enviados'
    })

  } catch (error: any) {
    console.error('Erro ao listar arquivos:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao listar arquivos' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/upload/files
 * Deletar arquivo (futuro)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticação
    const authResponse = await requireInstructorOrAdmin()
    if (authResponse) {
      return authResponse
    }

    return NextResponse.json({
      message: 'Funcionalidade de exclusão em desenvolvimento',
      info: 'Use esta rota para deletar arquivos'
    })

  } catch (error: any) {
    console.error('Erro ao deletar arquivo:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar arquivo' },
      { status: 500 }
    )
  }
}
