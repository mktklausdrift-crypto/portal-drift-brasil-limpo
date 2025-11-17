import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

/**
 * POST /api/progress/aulas
 * Marca uma aula como concluída ou atualiza o tempo assistido
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { aulaId, concluido, tempoAssistido } = body

    if (!aulaId) {
      return NextResponse.json(
        { error: "aulaId é obrigatório" },
        { status: 400 }
      )
    }

    // Busca ou cria o progresso
    const progresso = await prisma.progressoAula.upsert({
      where: {
        usuarioId_aulaId: {
          usuarioId: session.user.id,
          aulaId: aulaId
        }
      },
      update: {
        concluido: concluido ?? undefined,
        tempoAssistido: tempoAssistido ?? undefined,
        updatedAt: new Date()
      },
      create: {
        usuarioId: session.user.id,
        aulaId: aulaId,
        concluido: concluido ?? false,
        tempoAssistido: tempoAssistido ?? 0
      },
      include: {
        aula: {
          include: {
            modulo: true
          }
        }
      }
    })

    // Atualiza progresso do curso
    if (progresso.aula.modulo.cursoId) {
      await updateCursoProgress(session.user.id, progresso.aula.modulo.cursoId)
    }

    return NextResponse.json({
      success: true,
      progresso
    })
  } catch (error) {
    console.error("Erro ao atualizar progresso:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar progresso" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/progress/aulas?aulaId=xxx
 * Busca o progresso de uma aula específica
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const aulaId = searchParams.get("aulaId")

    if (!aulaId) {
      return NextResponse.json(
        { error: "aulaId é obrigatório" },
        { status: 400 }
      )
    }

    const progresso = await prisma.progressoAula.findUnique({
      where: {
        usuarioId_aulaId: {
          usuarioId: session.user.id,
          aulaId: aulaId
        }
      }
    })

    return NextResponse.json({
      progresso: progresso || {
        concluido: false,
        tempoAssistido: 0
      }
    })
  } catch (error) {
    console.error("Erro ao buscar progresso:", error)
    return NextResponse.json(
      { error: "Erro ao buscar progresso" },
      { status: 500 }
    )
  }
}

/**
 * Atualiza o progresso geral do curso baseado nas aulas concluídas
 */
async function updateCursoProgress(usuarioId: string, cursoId: string) {
  // Busca todas as aulas do curso
  const curso = await prisma.curso.findUnique({
    where: { id: cursoId },
    include: {
      modulos: {
        include: {
          aulas: true
        }
      }
    }
  })

  if (!curso) return

  const totalAulas = curso.modulos.reduce(
    (acc, modulo) => acc + modulo.aulas.length,
    0
  )

  if (totalAulas === 0) return

  // Busca aulas concluídas
  const aulasIds = curso.modulos.flatMap(modulo =>
    modulo.aulas.map(aula => aula.id)
  )

  const aulasConcluidas = await prisma.progressoAula.count({
    where: {
      usuarioId,
      aulaId: { in: aulasIds },
      concluido: true
    }
  })

  const progresso = Math.round((aulasConcluidas / totalAulas) * 100)
  const concluido = progresso === 100

  // Atualiza ou cria inscrição no curso
  await prisma.inscricaoCurso.upsert({
    where: {
      usuarioId_cursoId: {
        usuarioId,
        cursoId
      }
    },
    update: {
      progresso,
      concluido,
      dataConclusao: concluido ? new Date() : null
    },
    create: {
      usuarioId,
      cursoId,
      progresso,
      concluido
    }
  })
}
