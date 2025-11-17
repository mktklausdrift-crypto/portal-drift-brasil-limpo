import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/admin/lessons/[id] - Buscar aula específica
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

    const aula = await prisma.aula.findUnique({
      where: { id },
      include: {
        modulo: {
          include: {
            curso: {
              select: { id: true, titulo: true }
            }
          }
        }
      }
    })

    if (!aula) {
      return NextResponse.json({ error: 'Aula não encontrada' }, { status: 404 })
    }

    return NextResponse.json(aula)
  } catch (error) {
    console.error('Erro ao buscar aula:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar aula' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/lessons/[id] - Atualizar aula
export async function PUT(
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

    if (!titulo || !tipo) {
      return NextResponse.json(
        { error: 'Título e tipo são obrigatórios' },
        { status: 400 }
      )
    }

    const aula = await prisma.aula.update({
      where: { id },
      data: {
        titulo,
        descricao,
        tipo,
        conteudo,
        videoUrl,
        duracao,
        ordem: ordem || 0,
      }
    })

    return NextResponse.json(aula)
  } catch (error) {
    console.error('Erro ao atualizar aula:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar aula' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/lessons/[id] - Excluir aula
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params

    await prisma.aula.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Aula excluída com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir aula:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir aula' },
      { status: 500 }
    )
  }
}
