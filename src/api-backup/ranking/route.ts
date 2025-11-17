import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    const { searchParams } = new URL(request.url)
    const periodo = searchParams.get("periodo") || "geral"
    const limit = parseInt(searchParams.get("limit") || "50")

    // Definir filtros de data baseado no período
    let dataFiltro = {}
    const agora = new Date()
    
    if (periodo === "semanal") {
      const inicioSemana = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000)
      dataFiltro = { createdAt: { gte: inicioSemana } }
    } else if (periodo === "mensal") {
      const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1)
      dataFiltro = { createdAt: { gte: inicioMes } }
    }

    // Buscar usuários ordenados por pontos
    const usuarios = await prisma.user.findMany({
      where: {
        pontosTotal: { gt: 0 }, // Apenas usuários com pontos
        ...dataFiltro
      },
      orderBy: { pontosTotal: "desc" },
      take: limit,
      include: {
        _count: {
          select: {
            inscricoesCurso: true,
            conquistas: true,
          }
        }
      }
    })

    // Calcular dados dos usuários
    const topUsuarios = await Promise.all(
      usuarios.map(async (usuario, index) => {
        const nivel = Math.floor(usuario.pontosTotal / 100) + 1
        
        // Cursos completos (simplificado)
        const cursosCompletos = await prisma.curso.count({
          where: {
            inscricoes: {
              some: { usuarioId: usuario.id }
            },
            modulos: {
              every: {
                aulas: {
                  every: {
                    progresso: {
                      some: {
                        usuarioId: usuario.id,
                        concluido: true
                      }
                    }
                  }
                }
              }
            }
          }
        })

        return {
          id: usuario.id,
          name: usuario.name,
          image: usuario.image,
          pontosTotal: usuario.pontosTotal,
          nivel,
          posicao: index + 1,
          cursosCompletos,
          conquistasTotal: usuario._count.conquistas,
          isCurrentUser: session?.user?.email === usuario.email
        }
      })
    )

    // Encontrar usuário atual se não estiver no top
    let usuarioAtual = null
    let minhaPosicao = 0

    if (session?.user?.email) {
      const currentUser = topUsuarios.find(u => u.isCurrentUser)
      
      if (currentUser) {
        usuarioAtual = currentUser
        minhaPosicao = currentUser.posicao
      } else {
        // Buscar posição do usuário atual se não estiver no top
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          include: {
            _count: {
              select: {
                inscricoesCurso: true,
                conquistas: true,
              }
            }
          }
        })

        if (user) {
          minhaPosicao = await prisma.user.count({
            where: {
              pontosTotal: { gt: user.pontosTotal },
              ...dataFiltro
            }
          }) + 1

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

          usuarioAtual = {
            id: user.id,
            name: user.name,
            image: user.image,
            pontosTotal: user.pontosTotal,
            nivel: Math.floor(user.pontosTotal / 100) + 1,
            posicao: minhaPosicao,
            cursosCompletos,
            conquistasTotal: user._count.conquistas,
            isCurrentUser: true
          }
        }
      }
    }

    const totalUsuarios = await prisma.user.count({
      where: {
        pontosTotal: { gt: 0 },
        ...dataFiltro
      }
    })

    return NextResponse.json({
      topUsuarios,
      usuarioAtual,
      totalUsuarios,
      minhaPosicao,
      periodo
    })

  } catch (error) {
    console.error("Erro ao buscar ranking:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}