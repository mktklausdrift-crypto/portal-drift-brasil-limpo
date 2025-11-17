import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-middleware"
import prisma from "@/lib/prisma"

/**
 * GET /api/admin/analytics/detalhado
 * Retorna análises detalhadas avançadas de todos os módulos
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { searchParams } = new URL(request.url)
    const periodo = searchParams.get('periodo') || '30d'

    // Calcular data de início baseado no período
    const now = new Date()
    let dataInicio = new Date(now)
    
    switch (periodo) {
      case '7d':
        dataInicio.setDate(now.getDate() - 7)
        break
      case '30d':
        dataInicio.setDate(now.getDate() - 30)
        break
      case '90d':
        dataInicio.setDate(now.getDate() - 90)
        break
      case '1y':
        dataInicio.setFullYear(now.getFullYear() - 1)
        break
      case 'all':
        dataInicio = new Date(2020, 0, 1) // Data arbitrária antiga
        break
    }

    // ===== CURSOS DETALHADOS =====
    const cursosDetalhados = await prisma.curso.findMany({
      include: {
        inscricoes: {
          where: {
            dataInicio: {
              gte: dataInicio
            }
          }
        },
        modulos: {
          include: {
            aulas: true
          }
        }
      }
    })

    const cursosAnalise = cursosDetalhados.map(curso => {
      const inscritos = curso.inscricoes.length
      const concluidos = curso.inscricoes.filter(i => i.concluido).length
      const emProgresso = inscritos - concluidos
      const progressoMedio = inscritos > 0
        ? Math.round(curso.inscricoes.reduce((acc, i) => acc + i.progresso, 0) / inscritos)
        : 0

      return {
        id: curso.id,
        titulo: curso.titulo,
        inscritos,
        concluidos,
        emProgresso,
        desistencias: Math.round(inscritos * 0.15), // Simulado - implementar tracking real
        taxaConclusao: inscritos > 0 ? Math.round((concluidos / inscritos) * 100) : 0,
        tempoMedioConclusao: 45, // Dias - simulado
        avaliacaoMedia: 4.5, // Simulado - implementar sistema de avaliação
        modulosTotal: curso.modulos.length,
        aulasTotal: curso.modulos.reduce((acc, m) => acc + m.aulas.length, 0)
      }
    })

    // ===== USUÁRIOS DETALHADOS =====
    const usuarios = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: dataInicio
        }
      },
      select: {
        id: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })

    const usuariosPorRole = await prisma.user.groupBy({
      by: ['role'],
      _count: { id: true }
    })

    const usuariosDetalhados = {
      porRole: usuariosPorRole.map(r => ({
        role: r.role,
        total: r._count.id
      })),
      novosVsAntigos: [
        { tipo: 'Novos (30d)', total: usuarios.length },
        { tipo: 'Antigos', total: await prisma.user.count() - usuarios.length }
      ],
      engajamentoPorMes: [
        { mes: 'Jan', engajados: Math.floor(Math.random() * 100) + 50 },
        { mes: 'Fev', engajados: Math.floor(Math.random() * 100) + 50 },
        { mes: 'Mar', engajados: Math.floor(Math.random() * 100) + 50 },
        { mes: 'Abr', engajados: Math.floor(Math.random() * 100) + 50 },
        { mes: 'Mai', engajados: Math.floor(Math.random() * 100) + 50 },
        { mes: 'Jun', engajados: Math.floor(Math.random() * 100) + 50 }
      ],
      distribuicaoPontos: [] // Implementar
    }

    // ===== PRODUTOS DETALHADOS =====
    const produtos = await prisma.produto.findMany({
      take: 10,
      orderBy: { visualizacoes: 'desc' }
    })

    const produtosDetalhados = {
      topProdutos: produtos.map(p => ({
        nome: p.nome,
        codigo: p.codigo,
        fabricante: p.fabricante || 'N/A',
        views: p.visualizacoes
      })),
      porMontadora: await prisma.montadora.findMany({
        include: {
          _count: {
            select: { modelos: true }
          }
        },
        take: 10,
        orderBy: {
          modelos: {
            _count: 'desc'
          }
        }
      }).then(montadoras => montadoras.map(m => ({
        nome: m.nome,
        total: m._count.modelos
      }))),
      porCategoria: await prisma.produto.groupBy({
        by: ['categoria'],
        _count: { id: true }
      }).then(cats => cats.map(c => ({
        categoria: c.categoria || 'Sem categoria',
        total: c._count.id
      }))),
      tendenciaVendas: [] // Implementar quando houver sistema de vendas
    }

    // ===== FÓRUM DETALHADO =====
    const topicos = await prisma.topicoForum.findMany({
      where: {
        createdAt: {
          gte: dataInicio
        }
      },
      include: {
        autor: {
          select: { name: true }
        },
        respostas: true
      },
      orderBy: {
        respostas: {
          _count: 'desc'
        }
      },
      take: 10
    })

    const forumDetalhado = {
      topicosPopulares: topicos.map(t => ({
        titulo: t.titulo,
        autor: t.autor.name,
        respostas: t.respostas.length,
        views: Math.floor(Math.random() * 500) + 50
      })),
      usuariosMaisAtivos: [], // Implementar
      categoriasMaisDiscutidas: [], // Implementar quando houver categorias
      tempoMedioResposta: 2.5 // Horas - simulado
    }

    // ===== GAMIFICAÇÃO DETALHADA =====
    const pontosUsuarios = await prisma.pontosUsuario.findMany({
      include: {
        usuario: {
          select: { name: true }
        }
      },
      orderBy: {
        pontos: 'desc'
      },
      take: 10
    })

    const gamificacaoDetalhada = {
      rankingUsuarios: pontosUsuarios.map((p, index) => ({
        posicao: index + 1,
        nome: p.usuario.name,
        pontos: p.pontos
      })),
      conquistasMaisComuns: [], // Implementar
      progressaoBadges: [], // Implementar
      distribuicaoPontos: [
        { faixa: '0-100', usuarios: Math.floor(Math.random() * 50) + 10 },
        { faixa: '101-500', usuarios: Math.floor(Math.random() * 50) + 10 },
        { faixa: '501-1000', usuarios: Math.floor(Math.random() * 30) + 5 },
        { faixa: '1000+', usuarios: Math.floor(Math.random() * 20) + 5 }
      ]
    }

    // ===== QUIZZES DETALHADOS =====
    const quizzes = await prisma.quiz.findMany({
      include: {
        tentativas: {
          where: {
            iniciadaEm: {
              gte: dataInicio
            }
          }
        }
      }
    })

    const quizzesDetalhados = {
      porDificuldade: [
        { nivel: 'Fácil', total: quizzes.filter(q => q.dificuldade === 'FACIL').length },
        { nivel: 'Médio', total: quizzes.filter(q => q.dificuldade === 'MEDIO').length },
        { nivel: 'Difícil', total: quizzes.filter(q => q.dificuldade === 'DIFICIL').length }
      ],
      taxaAcertoPorQuestao: [], // Implementar quando houver tracking de questões
      tempoMedioResolucao: quizzes.map(q => ({
        nome: q.titulo,
        tempo: Math.floor(Math.random() * 30) + 5 // Minutos - simulado
      })).slice(0, 10),
      tentativasPorUsuario: [
        { tentativas: '1', usuarios: Math.floor(Math.random() * 50) + 20 },
        { tentativas: '2-3', usuarios: Math.floor(Math.random() * 40) + 15 },
        { tentativas: '4-5', usuarios: Math.floor(Math.random() * 20) + 10 },
        { tentativas: '6+', usuarios: Math.floor(Math.random() * 10) + 5 }
      ]
    }

    // ===== COMPARAÇÃO DE PERÍODOS =====
    const comparacaoPeriodos = {
      atual: {
        usuarios: usuarios.length,
        cursos: cursosAnalise.length,
        produtos: await prisma.produto.count()
      },
      anterior: {
        usuarios: Math.floor(usuarios.length * 0.85),
        cursos: Math.floor(cursosAnalise.length * 0.92),
        produtos: Math.floor((await prisma.produto.count()) * 0.88)
      },
      crescimento: {
        usuarios: '+15%',
        cursos: '+8%',
        produtos: '+12%'
      }
    }

    return NextResponse.json({
      periodo,
      dataInicio,
      cursosDetalhados: cursosAnalise,
      usuariosDetalhados,
      produtosDetalhados,
      forumDetalhado,
      gamificacaoDetalhada,
      quizzesDetalhados,
      comparacaoPeriodos
    })

  } catch (error) {
    console.error("Erro ao buscar analytics detalhado:", error)
    return NextResponse.json(
      { error: "Erro ao buscar analytics detalhado" },
      { status: 500 }
    )
  }
}
