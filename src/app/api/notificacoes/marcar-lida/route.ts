import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// PATCH /api/notificacoes/marcar-lida - Marcar notificação como lida
export async function PATCH(request: NextRequest) {
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

    const { notificacaoId, todasLidas } = await request.json()

    if (todasLidas) {
      // Marcar todas as notificações como lidas
      await prisma.notificacao.updateMany({
        where: {
          usuarioId: user.id,
          lida: false
        },
        data: {
          lida: true
        }
      })

      return NextResponse.json({ message: 'Todas as notificações foram marcadas como lidas' })
    } else if (notificacaoId) {
      // Marcar uma notificação específica como lida
      const notificacao = await prisma.notificacao.findFirst({
        where: {
          id: notificacaoId,
          usuarioId: user.id
        }
      })

      if (!notificacao) {
        return NextResponse.json(
          { error: "Notificação não encontrada" },
          { status: 404 }
        )
      }

      const notificacaoAtualizada = await prisma.notificacao.update({
        where: { id: notificacaoId },
        data: { lida: true }
      })

      return NextResponse.json(notificacaoAtualizada)
    } else {
      return NextResponse.json(
        { error: "É necessário fornecer notificacaoId ou todasLidas=true" },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}