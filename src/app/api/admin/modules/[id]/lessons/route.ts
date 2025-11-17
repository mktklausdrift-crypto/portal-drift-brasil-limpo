import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/admin/modules/[id]/lessons - Listar aulas do módulo
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params

    const aulas = await prisma.aula.findMany({
      where: { moduloId: id },
      orderBy: { ordem: 'asc' }
    })

    return NextResponse.json(aulas)
  } catch (error) {
    console.error('Erro ao buscar aulas:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar aulas' },
      { status: 500 }
    )
  }
}

// POST /api/admin/modules/[id]/lessons - Criar nova aula
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { titulo, descricao, tipo, conteudo, videoUrl, duracao, ordem } = body

    // Validar campos obrigatórios
    if (!titulo || !tipo) {
      return NextResponse.json(
        { error: 'Título e tipo são obrigatórios' },
        { status: 400 }
      )
    }

    const aula = await prisma.aula.create({
      data: {
        titulo,
        descricao,
        tipo,
        conteudo,
        videoUrl,
        duracao,
        ordem: ordem || 0,
        moduloId: id,
      }
    })

    return NextResponse.json(aula, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar aula:', error)
    return NextResponse.json(
      { error: 'Erro ao criar aula' },
      { status: 500 }
    )
  }
}
