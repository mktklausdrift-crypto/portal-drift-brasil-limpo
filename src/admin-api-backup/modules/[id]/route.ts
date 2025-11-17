import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/admin/modules/[id] - Buscar módulo específico
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

    const modulo = await prisma.modulo.findUnique({
      where: { id },
      include: {
        curso: {
          select: { id: true, titulo: true }
        },
        quiz: {
          select: { id: true, titulo: true }
        },
        _count: {
          select: { aulas: true }
        }
      }
    })

    if (!modulo) {
      return NextResponse.json({ error: 'Módulo não encontrado' }, { status: 404 })
    }

    return NextResponse.json(modulo)
  } catch (error) {
    console.error('Erro ao buscar módulo:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar módulo' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/modules/[id] - Atualizar módulo
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
    const { titulo, descricao, ordem, quizId } = body

    console.log('📝 PUT /api/admin/modules/[id] - Body recebido:', { titulo, descricao, ordem, quizId })

    // Preparar dados para atualização (apenas campos fornecidos)
    const updateData: any = {}
    if (titulo !== undefined) updateData.titulo = titulo
    if (descricao !== undefined) updateData.descricao = descricao
    if (ordem !== undefined) updateData.ordem = ordem
    if (quizId !== undefined) updateData.quizId = quizId || null

    // Validar se há pelo menos um campo para atualizar
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Nenhum campo para atualizar' },
        { status: 400 }
      )
    }

    // Se título for fornecido, validar que não está vazio
    if (updateData.titulo !== undefined && !updateData.titulo.trim()) {
      return NextResponse.json(
        { error: 'Título não pode ser vazio' },
        { status: 400 }
      )
    }

    const modulo = await prisma.modulo.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(modulo)
  } catch (error) {
    console.error('Erro ao atualizar módulo:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar módulo' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/modules/[id] - Excluir módulo
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

    await prisma.modulo.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Módulo excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir módulo:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir módulo' },
      { status: 500 }
    )
  }
}
