import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    // Buscar dados do dashboard
    const [
      cursosInscritos,
      aulasConcluidas,
      totalAulas,
      conquistas,
      posicaoRanking,
      proximasAulas,
      conquistasRecentes
    ] = await Promise.all([
      // Cursos inscritos
      prisma.inscricaoCurso.count({
        where: { usuarioId: user.id }
      }),

      // Aulas concluídas
      prisma.progressoAula.count({
        where: { 
          usuarioId: user.id,
          concluido: true
        }
      }),

      // Total de aulas em cursos inscritos
      prisma.aula.count({
        where: {
          modulo: {
            curso: {
              inscricoes: {
                some: { usuarioId: user.id }
              }
            }
          }
        }
      }),

      // Conquistas desbloqueadas
      prisma.conquistaUsuario.count({
        where: { usuarioId: user.id }
      }),

      // Posição no ranking (simplificado)
      prisma.user.count({
        where: {
          pontosTotal: { gt: user.pontosTotal }
        }
      }).then(count => count + 1),

      // Próximas aulas (últimas 5 não concluídas)
      prisma.aula.findMany({
        where: {
          modulo: {
            curso: {
              inscricoes: {
                some: { usuarioId: user.id }
              }
            }
          },
          progresso: {
            none: {
              usuarioId: user.id,
              concluido: true
            }
          }
        },
        take: 5,
        include: {
          modulo: {
            include: {
              curso: true
            }
          },
          progresso: {
            where: { usuarioId: user.id }
          }
        },
        orderBy: { ordem: 'asc' }
      }),

      // Conquistas recentes (últimas 3)
      prisma.conquistaUsuario.findMany({
        where: { usuarioId: user.id },
        take: 3,
        orderBy: { desbloqueadaEm: 'desc' },
        include: {
          tipoConquista: true
        }
      })
    ])

    // Calcular nível baseado nos pontos
    const nivel = Math.floor(user.pontosTotal / 100) + 1

    // Cursos completos (simplificado - onde todas as aulas foram concluídas)
    const cursosCompletos = await prisma.curso.count({
      where: {
        inscricoes: {
          some: { usuarioId: user.id }
        },
        modulos: {
          every: {
            aulas: {
              every: {
                progresso: {
                  some: {
                    usuarioId: user.id,
                    concluido: true
                  }
                }
              }
            }
          }
        }
      }
    })

    // Formatar próximas aulas
    const proximasAulasFormatadas = proximasAulas.map(aula => {
      const progresso = aula.progresso.length > 0 ? 50 : 0 // Simplificado
      return {
        id: aula.id,
        titulo: aula.titulo,
        cursoNome: aula.modulo.curso.titulo,
        modulo: aula.modulo.titulo,
        progresso
      }
    })

    // Formatar conquistas recentes
    const conquistasRecentesFormatadas = conquistasRecentes.map(conquista => ({
      id: conquista.id,
      titulo: conquista.tipoConquista.nome,
      descricao: conquista.tipoConquista.descricao,
      icone: conquista.tipoConquista.icone || "🏆",
      desbloqueadaEm: conquista.desbloqueadaEm.toISOString()
    }))

    const dashboardData = {
      cursosInscritos,
      cursosCompletos,
      aulasConcluidas,
      totalAulas,
      pontosTotal: user.pontosTotal,
      nivel,
      posicaoRanking,
      conquistas,
      proximasAulas: proximasAulasFormatadas,
      conquistasRecentes: conquistasRecentesFormatadas,
      cursosFavoritos: [] // Implementar depois se necessário
    }

    return NextResponse.json(dashboardData)

  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}