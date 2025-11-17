import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/notificacoes - Buscar notificações do usuário
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const somenteNaoLidas = searchParams.get('nao_lidas') === 'true'

    const where = {
      usuarioId: user.id,
      ...(somenteNaoLidas && { lida: false })
    }

    const [notificacoes, totalNaoLidas] = await Promise.all([
      prisma.notificacao.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.notificacao.count({
        where: { usuarioId: user.id, lida: false }
      })
    ])

    return NextResponse.json({
      notificacoes,
      totalNaoLidas,
      hasMore: notificacoes.length === limit
    })

  } catch (error) {
    console.error('Erro ao buscar notificações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/notificacoes - Criar notificação (interno)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { usuarioId, titulo, mensagem, tipo, link } = data

    if (!usuarioId || !titulo || !mensagem) {
      return NextResponse.json(
        { error: "Dados obrigatórios faltando" },
        { status: 400 }
      )
    }

    const notificacao = await prisma.notificacao.create({
      data: {
        usuarioId,
        titulo,
        mensagem,
        tipo: tipo || 'INFO',
        link: link || null
      }
    })

    return NextResponse.json(notificacao)

  } catch (error) {
    console.error('Erro ao criar notificação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
