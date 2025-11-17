import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-middleware"
import prisma from "@/lib/prisma"

/**
 * GET /api/admin/analytics/overview
 * Retorna estatísticas gerais da plataforma
 */
 /* export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    // Total de usuários
    const totalUsuarios = await prisma.user.count()

    // Total de cursos
    const totalCursos = await prisma.curso.count()

    // Total de inscrições
    const totalInscricoes = await prisma.inscricaoCurso.count()

    // Total de cursos concluídos
    const cursoConcluidos = await prisma.inscricaoCurso.count({
      where: { concluido: true }
    })

    // Taxa média de conclusão
    const taxaConclusao = totalInscricoes > 0
      ? Math.round((cursoConcluidos / totalInscricoes) * 100)
      : 0

    // Novos usuários nos últimos 30 dias
    const novosUsuarios30d = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    })

    // Cursos mais populares
    const cursosMaisPopulares = await prisma.curso.findMany({
      take: 5,
      orderBy: {
        inscricoes: {
          _count: "desc"
        }
      },
      select: {
        id: true,
        titulo: true,
        _count: {
          select: {
            inscricoes: true
          }
        }
      }
    })

    // Progresso médio por curso
    const progressoPorCurso = await prisma.inscricaoCurso.groupBy({
      by: ["cursoId"],
      _avg: {
        progresso: true
      },
      _count: {
        usuarioId: true
      }
    })

    const progressoDetalhado = await Promise.all(
      progressoPorCurso.map(async (item) => {
        const curso = await prisma.curso.findUnique({
          where: { id: item.cursoId },
          select: { titulo: true }
        })
        return {
          cursoId: item.cursoId,
          cursoTitulo: curso?.titulo || "Desconhecido",
          progressoMedio: Math.round(item._avg.progresso || 0),
          totalAlunos: item._count.usuarioId
        }
      })
    )

    return NextResponse.json({
      overview: {
        totalUsuarios,
        totalCursos,
        totalInscricoes,
        cursoConcluidos,
        taxaConclusao,
        novosUsuarios30d
      },
      cursosMaisPopulares: cursosMaisPopulares.map(c => ({
        id: c.id,
        titulo: c.titulo,
        totalInscritos: c._count.inscricoes
      })),
      progressoPorCurso: progressoDetalhado
    })
  } catch (error) {
    console.error("Erro ao buscar analytics:", error)
    return NextResponse.json(
      { error: "Erro ao buscar analytics" },
      { status: 500 }
    )
  }
} */
