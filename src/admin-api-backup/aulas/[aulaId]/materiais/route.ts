import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireInstructorOrAdmin, requireRole, requireEnrollment } from '@/lib/auth-middleware'
import type { AulaMaterial } from '@prisma/client'

// GET /api/admin/aulas/[aulaId]/materiais
// Lista materiais associados à aula
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ aulaId: string }> }
) {
  try {
    // Qualquer usuário autenticado pode ver materiais (ajuste se necessário)
    const session = await requireRole(['ADMIN','INSTRUCTOR','STUDENT'])
    if (session instanceof NextResponse) return session

    const { aulaId } = await params

    const aula = await prisma.aula.findUnique({
      where: { id: aulaId },
      include: { modulo: { select: { cursoId: true } } }
    })
    if (!aula) {
      return NextResponse.json({ error: 'Aula não encontrada' }, { status: 404 })
    }

    // Se usuário for STUDENT, exigir matrícula no curso da aula
    if (session.user.role === 'STUDENT') {
      const gate = await requireEnrollment(aula.modulo.cursoId)
      if (gate instanceof NextResponse) return gate
    }
    const materiais: AulaMaterial[] = await prisma.aulaMaterial.findMany({
      where: { aulaId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ aulaId, count: materiais.length, materiais })
  } catch (error: any) {
    console.error('Erro ao listar materiais da aula:', error)
    return NextResponse.json({ error: 'Erro ao listar materiais' }, { status: 500 })
  }
}

// POST /api/admin/aulas/[aulaId]/materiais
// Associa um ou mais arquivos previamente enviados via /api/upload/files à aula
// Body pode ser { file: {...} } ou { files: [{...},{...}] }
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ aulaId: string }> }
) {
  try {
    const session = await requireInstructorOrAdmin()
    if (session instanceof NextResponse) return session

    const { aulaId } = await params
    const aula = await prisma.aula.findUnique({ where: { id: aulaId } })
    if (!aula) {
      return NextResponse.json({ error: 'Aula não encontrada' }, { status: 404 })
    }

    const body = await request.json()
    let files: any[] = []
    if (body.file) files = [body.file]
    if (Array.isArray(body.files)) files = body.files

    if (files.length === 0) {
      return NextResponse.json({ error: 'Nenhum arquivo fornecido' }, { status: 400 })
    }

    // Validação básica dos campos
    const invalid = files.find(f => !f.originalName || !f.fileName || !f.url || typeof f.size !== 'number' || !f.mimeType)
    if (invalid) {
      return NextResponse.json({ error: 'Arquivo com campos inválidos (originalName, fileName, url, size, mimeType são obrigatórios)' }, { status: 400 })
    }

    // Preparar dados - prevenir path traversal e garantir unicidade
    const sanitizedFiles = files.map(f => ({
      aulaId,
      originalName: String(f.originalName).slice(0, 255),
      fileName: sanitizeFileName(f.fileName),
      url: f.url,
      size: f.size,
      mimeType: f.mimeType,
      tipo: deriveTipo(f.mimeType)
    }))

    // Upsert-like (mas garantimos unicidade aulaId+fileName)
    const created = []
    for (const file of sanitizedFiles) {
      try {
        const material = await prisma.aulaMaterial.upsert({
          where: { aulaId_fileName: { aulaId: file.aulaId, fileName: file.fileName } },
          create: file,
          update: file // idempotente: atualiza metadata se já existir
        })
        created.push(material)
      } catch (e: any) {
        console.error('Falha ao associar material', file.fileName, e)
      }
    }

    return NextResponse.json({ aulaId, createdCount: created.length, materiais: created }, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao associar materiais à aula:', error)
    return NextResponse.json({ error: 'Erro ao associar materiais' }, { status: 500 })
  }
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 180)
}

function deriveTipo(mime: string): string {
  if (mime.startsWith('image/')) return 'imagem'
  if (mime.startsWith('video/')) return 'video'
  if (mime === 'application/pdf') return 'documento'
  if (mime.includes('spreadsheet') || mime.includes('excel')) return 'planilha'
  if (mime.includes('presentation')) return 'apresentacao'
  if (mime.includes('zip')) return 'arquivo_zip'
  return 'arquivo'
}
