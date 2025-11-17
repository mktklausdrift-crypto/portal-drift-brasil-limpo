import prisma from '@/lib/prisma'

// Tipos de ações que geram pontos
export enum AcoesPontos {
  AULA_CONCLUIDA = 'aula_concluida',
  CURSO_CONCLUIDO = 'curso_concluido',
  PRIMEIRO_LOGIN = 'primeiro_login',
  QUIZ_COMPLETADO = 'quiz_completado',
  STREAK_SEMANAL = 'streak_semanal',
  PERFIL_COMPLETO = 'perfil_completo',
  COMENTARIO_FORUM = 'comentario_forum',
  TOPICO_FORUM = 'topico_forum'
}

// Pontos por ação
const PONTOS_POR_ACAO: Record<AcoesPontos, number> = {
  [AcoesPontos.AULA_CONCLUIDA]: 10,
  [AcoesPontos.CURSO_CONCLUIDO]: 100,
  [AcoesPontos.PRIMEIRO_LOGIN]: 25,
  [AcoesPontos.QUIZ_COMPLETADO]: 20,
  [AcoesPontos.STREAK_SEMANAL]: 50,
  [AcoesPontos.PERFIL_COMPLETO]: 30,
  [AcoesPontos.COMENTARIO_FORUM]: 5,
  [AcoesPontos.TOPICO_FORUM]: 15
}

interface AdicionarPontosParams {
  usuarioId: string
  acao: AcoesPontos
  descricao?: string
  pontosCustom?: number
}

/**
 * Adiciona pontos a um usuário e verifica conquistas
 */
export async function adicionarPontos({
  usuarioId,
  acao,
  descricao,
  pontosCustom
}: AdicionarPontosParams) {
  try {
    const pontos = pontosCustom || PONTOS_POR_ACAO[acao]
    
    // Evitar duplicação de pontos para certas ações
    const acoesUnicas = [
      AcoesPontos.PRIMEIRO_LOGIN,
      AcoesPontos.PERFIL_COMPLETO
    ]

    if (acoesUnicas.includes(acao)) {
      const jaRecebeu = await prisma.pontosUsuario.findFirst({
        where: {
          usuarioId,
          acao
        }
      })

      if (jaRecebeu) {
        return null // Já recebeu pontos por esta ação
      }
    }

    // Adicionar pontos
    const novoPonto = await prisma.pontosUsuario.create({
      data: {
        usuarioId,
        pontos,
        acao,
        descricao: descricao || getDescricaoAcao(acao)
      }
    })

    // Verificar conquistas
    await verificarConquistas(usuarioId)

    return novoPonto

  } catch (error) {
    console.error('Erro ao adicionar pontos:', error)
    throw error
  }
}

/**
 * Calcula total de pontos de um usuário
 */
export async function calcularTotalPontos(usuarioId: string): Promise<number> {
  const resultado = await prisma.pontosUsuario.aggregate({
    where: { usuarioId },
    _sum: { pontos: true }
  })

  return resultado._sum.pontos || 0
}

/**
 * Busca histórico de pontos do usuário
 */
export async function buscarHistoricoPontos(usuarioId: string, limit = 10) {
  return await prisma.pontosUsuario.findMany({
    where: { usuarioId },
    orderBy: { createdAt: 'desc' },
    take: limit
  })
}

/**
 * Verifica e desbloqueia conquistas automáticas
 */
async function verificarConquistas(usuarioId: string) {
  try {
    // Buscar estatísticas do usuário
    const [totalPontos, aulasCompletas, cursosCompletos, tentativasQuiz] = await Promise.all([
      calcularTotalPontos(usuarioId),
      prisma.progressoAula.count({
        where: { usuarioId, concluido: true }
      }),
      prisma.inscricaoCurso.count({
        where: { usuarioId, concluido: true }
      }),
      prisma.tentativaQuiz.count({
        where: { usuarioId, completa: true }
      })
    ])

    // Buscar conquistas que o usuário ainda não possui
    const conquistasDisponiveis = await prisma.tipoConquista.findMany({
      where: {
        ativo: true,
        conquistasUsuario: {
          none: { usuarioId }
        }
      }
    })

    const conquistasParaDesbloquear = []

    for (const conquista of conquistasDisponiveis) {
      let deveDesbloquear = false

      // Verificar conquistas por pontos
      if (conquista.pontos > 0 && totalPontos >= conquista.pontos) {
        deveDesbloquear = true
      }

      // Verificar conquistas por condições específicas
      if (conquista.condicao) {
        const [tipo, valor] = conquista.condicao.split(':')
        const valorNum = parseInt(valor)

        switch (tipo) {
          case 'aulas_concluidas':
            deveDesbloquear = aulasCompletas >= valorNum
            break
          case 'cursos_concluidos':
            deveDesbloquear = cursosCompletos >= valorNum
            break
          case 'pontos_totais':
            deveDesbloquear = totalPontos >= valorNum
            break
          case 'quizzes_completados':
            deveDesbloquear = tentativasQuiz >= valorNum
            break
        }
      }

      if (deveDesbloquear) {
        conquistasParaDesbloquear.push(conquista)
      }
    }

    // Desbloquear conquistas
    for (const conquista of conquistasParaDesbloquear) {
      await prisma.conquistaUsuario.create({
        data: {
          usuarioId,
          tipoConquistaId: conquista.id
        }
      })

      // Criar notificação
      await prisma.notificacao.create({
        data: {
          usuarioId,
          titulo: "🎉 Nova Conquista!",
          mensagem: `Parabéns! Você conquistou: ${conquista.nome}`,
          tipo: "CONQUISTA",
          link: "/perfil#conquistas"
        }
      })
    }

    return conquistasParaDesbloquear

  } catch (error) {
    console.error('Erro ao verificar conquistas:', error)
    return []
  }
}

/**
 * Gera descrição padrão para cada tipo de ação
 */
function getDescricaoAcao(acao: AcoesPontos): string {
  const descricoes: Record<AcoesPontos, string> = {
    [AcoesPontos.AULA_CONCLUIDA]: 'Aula concluída com sucesso',
    [AcoesPontos.CURSO_CONCLUIDO]: 'Curso finalizado completamente',
    [AcoesPontos.PRIMEIRO_LOGIN]: 'Primeiro acesso ao sistema',
    [AcoesPontos.QUIZ_COMPLETADO]: 'Quiz respondido completamente',
    [AcoesPontos.STREAK_SEMANAL]: 'Uma semana de atividade consecutiva',
    [AcoesPontos.PERFIL_COMPLETO]: 'Perfil preenchido completamente',
    [AcoesPontos.COMENTARIO_FORUM]: 'Participação no fórum com comentário',
    [AcoesPontos.TOPICO_FORUM]: 'Criação de novo tópico no fórum'
  }

  return descricoes[acao]
}

/**
 * Hook automático para quando uma aula é concluída
 */
export async function onAulaConcluida(usuarioId: string, aulaId: string) {
  try {
    await adicionarPontos({
      usuarioId,
      acao: AcoesPontos.AULA_CONCLUIDA,
      descricao: `Aula ${aulaId} concluída`
    })
  } catch (error) {
    console.error('Erro ao processar conclusão da aula:', error)
  }
}

/**
 * Hook automático para quando um curso é concluído
 */
export async function onCursoConcluido(usuarioId: string, cursoId: string) {
  try {
    await adicionarPontos({
      usuarioId,
      acao: AcoesPontos.CURSO_CONCLUIDO,
      descricao: `Curso ${cursoId} finalizado`
    })
  } catch (error) {
    console.error('Erro ao processar conclusão do curso:', error)
  }
}

/**
 * Hook automático para quando um quiz é completado
 */
export async function onQuizCompletado(usuarioId: string, quizId: string, pontuacao: number) {
  try {
    await adicionarPontos({
      usuarioId,
      acao: AcoesPontos.QUIZ_COMPLETADO,
      descricao: `Quiz completado com ${pontuacao}% de acertos`
    })
  } catch (error) {
    console.error('Erro ao processar quiz completado:', error)
  }
}