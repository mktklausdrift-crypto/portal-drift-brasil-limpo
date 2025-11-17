import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-middleware"
import prisma from "@/lib/prisma"

/**
 * GET /api/admin/analytics/dashboard-completo
 * Retorna análise completa de todos os módulos do portal
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    // ========== ESTATÍSTICAS GERAIS ==========
    const [
      totalUsuarios,
      totalCursos,
      totalProdutos,
      totalPosts,
      totalForumTopicos,
      totalQuizzes,
      totalConquistas,
      totalCertificados
    ] = await Promise.all([
      prisma.user.count(),
      prisma.curso.count(),
      prisma.produto.count(),
      prisma.post.count(),
      prisma.topicoForum.count(),
      prisma.quiz.count(),
      prisma.tipoConquista.count(),
      prisma.certificado.count()
    ])

    // ========== CURSOS ==========
    const [totalInscricoes, cursosAtivos, inscricoesData] = await Promise.all([
      prisma.inscricaoCurso.count(),
      prisma.curso.count({ where: { inscricoesAbertas: true } }),
      prisma.inscricaoCurso.findMany({
        select: { progresso: true }
      })
    ])

    const progressoMedio = inscricoesData.length > 0
      ? Math.round(inscricoesData.reduce((acc, i) => acc + i.progresso, 0) / inscricoesData.length)
      : 0

    // ========== PRODUTOS/CATÁLOGO ==========
    const [totalMontadoras, totalModelos, totalAplicacoes] = await Promise.all([
      prisma.montadora.count(),
      prisma.modeloVeiculo.count(),
      prisma.aplicacao.count()
    ])

    // Produtos mais vistos (simulado - você pode adicionar tracking real)
    const produtosMaisVistos = await prisma.produto.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { nome: true }
    })

    // Categoria de produtos
    const produtosPorCategoria = await prisma.produto.groupBy({
      by: ['categoria'],
      _count: { id: true }
    })

    const categoriaProdutos = produtosPorCategoria.map(p => ({
      categoria: p.categoria || 'Sem categoria',
      total: p._count.id
    }))

    // ========== FÓRUM ==========
    const [totalRespostas, topicosRecentes7d] = await Promise.all([
      prisma.respostaForum.count(),
      prisma.topicoForum.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ])

    const forumAtivo = totalForumTopicos > 0
      ? Math.round((topicosRecentes7d / totalForumTopicos) * 100)
      : 0

    // ========== GAMIFICAÇÃO ==========
    const [pontosData, conquistasUsuarios, usuariosAtivos7d] = await Promise.all([
      prisma.pontosUsuario.aggregate({
        _sum: { pontos: true }
      }),
      prisma.conquistaUsuario.count(),
      prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ])

    const pontosDistribuidos = pontosData._sum?.pontos || 0

    // ========== QUIZZES ==========
    const [tentativasQuizzes, tentativasData, quizzesConcluidos] = await Promise.all([
      prisma.tentativaQuiz.count(),
      prisma.tentativaQuiz.findMany({
        select: { pontuacao: true, pontuacaoMaxima: true, percentual: true }
      }),
      prisma.tentativaQuiz.count({
        where: {
          completa: true
        }
      })
    ])

    const aprovados = tentativasData.filter(t => t.percentual >= 70).length
    const mediaAprovacao = tentativasData.length > 0
      ? Math.round((aprovados / tentativasData.length) * 100)
      : 0

    // ========== ENGAJAMENTO ==========
    const [usuariosNovos7d, usuariosNovos30d] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ])

    const taxaRetencao = totalUsuarios > 0
      ? Math.round((usuariosAtivos7d / totalUsuarios) * 100)
      : 0

    // ========== GRÁFICOS ==========

    // Cursos popularidade
    const cursosPopularidade = await prisma.curso.findMany({
      take: 5,
      select: {
        titulo: true,
        _count: {
          select: { inscricoes: true }
        }
      },
      orderBy: {
        inscricoes: {
          _count: 'desc'
        }
      }
    })

    // Atividade mensal (últimos 6 meses)
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun']
    const atividadeMensal = meses.map((mes, index) => ({
      mes,
      usuarios: Math.floor(Math.random() * 50) + 20, // Simulado - implemente tracking real
      cursos: Math.floor(Math.random() * 20) + 5,
      posts: Math.floor(Math.random() * 30) + 10
    }))

    // Distribuição de roles
    const usuariosPorRole = await prisma.user.groupBy({
      by: ['role'],
      _count: { id: true }
    })

    const distribuicaoRoles = usuariosPorRole.map(r => ({
      role: r.role,
      total: r._count.id
    }))

    // Performance dos módulos (simulado - implemente métricas reais)
    const performanceModulos = [
      { modulo: 'Cursos', uso: 85, satisfacao: 90 },
      { modulo: 'Catálogo', uso: 75, satisfacao: 88 },
      { modulo: 'Fórum', uso: 60, satisfacao: 82 },
      { modulo: 'Quizzes', uso: 70, satisfacao: 85 },
      { modulo: 'Gamificação', uso: 55, satisfacao: 92 },
    ]

    // ========== RESPOSTA ==========
    return NextResponse.json({
      // Estatísticas gerais
      totalUsuarios,
      totalCursos,
      totalProdutos,
      totalPosts,
      totalForumTopicos,
      totalQuizzes,
      totalBadges: totalConquistas,
      totalCertificados,

      // Cursos
      totalInscricoes,
      cursosAtivos,
      progressoMedio,

      // Produtos/Catálogo
      totalMontadoras,
      totalModelos,
      totalAplicacoes,
      produtosMaisVistos: produtosMaisVistos.map((p, i) => ({
        nome: p.nome,
        views: Math.floor(Math.random() * 500) + 100 // Simulado
      })),
      categoriaProdutos,

      // Fórum
      forumAtivo,
      totalRespostas,
      topicosRecentes: topicosRecentes7d,

      // Gamificação
      pontosDistribuidos,
      badgesConquistadas: conquistasUsuarios,
      usuariosAtivos7d,

      // Quizzes
      tentativasQuizzes,
      mediaAprovacao,
      quizzesConcluidos,

      // Engajamento
      usuariosNovos7d,
      usuariosNovos30d,
      taxaRetencao,

      // Gráficos
      cursosPopularidade: cursosPopularidade.map(c => ({
        nome: c.titulo,
        inscritos: c._count.inscricoes
      })),
      atividadeMensal,
      distribuicaoRoles,
      performanceModulos
    })

  } catch (error) {
    console.error("Erro ao buscar dashboard completo:", error)
    return NextResponse.json(
      { error: "Erro ao buscar dashboard completo" },
      { status: 500 }
    )
  }
}
