import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

/**
 * GET /api/progress/cursos/[id]
 * Busca o progresso do usuário em um curso específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    const { id: cursoId } = await params

    // Busca inscrição no curso
    const inscricao = await prisma.inscricaoCurso.findUnique({
      where: {
        usuarioId_cursoId: {
          usuarioId: session.user.id,
          cursoId
        }
      }
    })

    // Busca progresso detalhado das aulas
    const curso = await prisma.curso.findUnique({
      where: { id: cursoId },
      include: {
        modulos: {
          orderBy: { ordem: "asc" },
          include: {
            aulas: {
              orderBy: { ordem: "asc" },
              include: {
                progresso: {
                  where: {
                    usuarioId: session.user.id
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!curso) {
      return NextResponse.json(
        { error: "Curso não encontrado" },
        { status: 404 }
      )
    }

    // Calcula estatísticas
    const totalAulas = curso.modulos.reduce(
      (acc, modulo) => acc + modulo.aulas.length,
      0
    )

    const aulasConcluidas = curso.modulos.reduce(
      (acc, modulo) =>
        acc +
        modulo.aulas.filter(aula => aula.progresso[0]?.concluido).length,
      0
    )

    const tempoTotal = curso.modulos.reduce(
      (acc, modulo) =>
        acc +
        modulo.aulas.reduce(
          (sum, aula) => sum + (aula.progresso[0]?.tempoAssistido || 0),
          0
        ),
      0
    )

    return NextResponse.json({
      inscricao: inscricao || {
        progresso: 0,
        concluido: false,
        dataInicio: null,
        dataConclusao: null
      },
      estatisticas: {
        totalAulas,
        aulasConcluidas,
        progresso: totalAulas > 0 ? Math.round((aulasConcluidas / totalAulas) * 100) : 0,
        tempoTotalAssistido: tempoTotal
      },
      modulos: curso.modulos.map(modulo => ({
        id: modulo.id,
        titulo: modulo.titulo,
        ordem: modulo.ordem,
        aulas: modulo.aulas.map(aula => ({
          id: aula.id,
          titulo: aula.titulo,
          ordem: aula.ordem,
          tipo: aula.tipo,
          concluido: aula.progresso[0]?.concluido || false,
          tempoAssistido: aula.progresso[0]?.tempoAssistido || 0
        }))
      }))
    })
  } catch (error) {
    console.error("Erro ao buscar progresso do curso:", error)
    return NextResponse.json(
      { error: "Erro ao buscar progresso" },
      { status: 500 }
    )
  }
}
