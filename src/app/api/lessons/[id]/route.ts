import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/lessons/[id] - Buscar aula (requer autenticação e inscrição)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar autenticação
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado. Faça login para acessar as aulas.' },
        { status: 401 }
      )
    }

    // Buscar aula com informações do curso
    const aula = await prisma.aula.findUnique({
      where: { id },
      include: {
        modulo: {
          include: {
            curso: {
              select: {
                id: true,
                titulo: true,
              }
            },
            aulas: {
              orderBy: { ordem: 'asc' },
              select: {
                id: true,
                titulo: true,
                tipo: true,
                duracao: true,
                ordem: true,
              }
            }
          }
        }
      }
    })

    if (!aula) {
      return NextResponse.json({ error: 'Aula não encontrada' }, { status: 404 })
    }

    // Verificar se o usuário está inscrito no curso
    const inscricao = await prisma.inscricaoCurso.findUnique({
      where: {
        usuarioId_cursoId: {
          usuarioId: session.user.id,
          cursoId: aula.modulo.curso.id
        }
      }
    })

    if (!inscricao) {
      return NextResponse.json(
        { error: 'Você não está inscrito neste curso. Faça a inscrição para acessar as aulas.' },
        { status: 403 }
      )
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
