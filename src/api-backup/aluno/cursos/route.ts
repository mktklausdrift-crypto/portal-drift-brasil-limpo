import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/auth'
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
  const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    // Buscar cursos inscritos
    const inscricoes = await prisma.inscricaoCurso.findMany({
      where: {
        usuarioId: user.id
      },
      include: {
        curso: {
          select: {
            id: true,
            titulo: true,
            descricao: true,
            cargaHoraria: true,
            modalidade: true
          }
        }
      },
      orderBy: {
        dataInicio: 'desc'
      }
    })

    return NextResponse.json(inscricoes)
  } catch (error) {
    console.error("Erro ao buscar cursos do aluno:", error)
    return NextResponse.json(
      { error: "Erro ao buscar cursos" },
      { status: 500 }
    )
  }
}
