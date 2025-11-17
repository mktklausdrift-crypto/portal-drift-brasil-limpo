import prisma from '@/lib/prisma'
import { TipoNotificacaoGamificacao } from '@prisma/client'

interface EnviarNotificacaoParams {
  usuarioId: string
  titulo: string
  mensagem: string
  tipo?: TipoNotificacaoGamificacao
  link?: string
}

/**
 * Envia uma notificação para um usuário
 */
export async function enviarNotificacao({
  usuarioId,
  titulo,
  mensagem,
  tipo = 'INFO',
  link
}: EnviarNotificacaoParams) {
  try {
    const notificacao = await prisma.notificacao.create({
      data: {
        usuarioId,
        titulo,
        mensagem,
        tipo,
        link: link || null
      }
    })

    return notificacao
  } catch (error) {
    console.error('Erro ao enviar notificação:', error)
    throw error
  }
}

/**
 * Envia notificação para múltiplos usuários
 */
export async function enviarNotificacaoParaMultiplos({
  usuarioIds,
  titulo,
  mensagem,
  tipo = 'INFO',
  link
}: {
  usuarioIds: string[]
  titulo: string
  mensagem: string
  tipo?: TipoNotificacaoGamificacao
  link?: string
}) {
  try {
    const notificacoes = await prisma.notificacao.createMany({
      data: usuarioIds.map(usuarioId => ({
        usuarioId,
        titulo,
        mensagem,
        tipo,
        link: link || null
      }))
    })

    return notificacoes
  } catch (error) {
    console.error('Erro ao enviar notificações:', error)
    throw error
  }
}

/**
 * Envia notificação para todos os usuários de um determinado role
 */
export async function enviarNotificacaoParaRole({
  role,
  titulo,
  mensagem,
  tipo = 'INFO',
  link
}: {
  role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
  titulo: string
  mensagem: string
  tipo?: TipoNotificacaoGamificacao
  link?: string
}) {
  try {
    // Buscar usuários do role especificado
    const usuarios = await prisma.user.findMany({
      where: { role },
      select: { id: true }
    })

    const usuarioIds = usuarios.map(u => u.id)

    return await enviarNotificacaoParaMultiplos({
      usuarioIds,
      titulo,
      mensagem,
      tipo,
      link
    })
  } catch (error) {
    console.error('Erro ao enviar notificação para role:', error)
    throw error
  }
}

/**
 * Envia notificação quando um novo curso é publicado
 */
export async function notificarNovoCurso(cursoId: string, cursoTitulo: string) {
  return await enviarNotificacaoParaRole({
    role: 'STUDENT',
    titulo: '📚 Novo Curso Disponível!',
    mensagem: `O curso "${cursoTitulo}" foi publicado e está disponível para inscrição.`,
    tipo: 'INFO',
    link: `/cursos/${cursoId}`
  })
}

/**
 * Envia notificação quando uma nova conquista é desbloqueada
 */
export async function notificarNovaConquista(
  usuarioId: string, 
  conquistaNome: string, 
  conquistaDescricao: string
) {
  return await enviarNotificacao({
    usuarioId,
    titulo: '🏆 Nova Conquista Desbloqueada!',
    mensagem: `Parabéns! Você conquistou: ${conquistaNome} - ${conquistaDescricao}`,
    tipo: 'CONQUISTA',
    link: '/perfil#conquistas'
  })
}

/**
 * Envia notificação quando um curso é concluído
 */
export async function notificarCursoConcluido(
  usuarioId: string, 
  cursoTitulo: string,
  cursoId: string
) {
  return await enviarNotificacao({
    usuarioId,
    titulo: '🎉 Curso Concluído!',
    mensagem: `Parabéns! Você concluiu o curso "${cursoTitulo}". Seu certificado está disponível.`,
    tipo: 'SUCCESS',
    link: `/certificados/${cursoId}`
  })
}

/**
 * Envia notificação de lembrete para continuar um curso
 */
export async function notificarLembreteCurso(
  usuarioId: string, 
  cursoTitulo: string,
  cursoId: string,
  progresso: number
) {
  return await enviarNotificacao({
    usuarioId,
    titulo: '📖 Continue seus estudos!',
    mensagem: `Você está com ${progresso}% de progresso no curso "${cursoTitulo}". Que tal continuar?`,
    tipo: 'INFO',
    link: `/cursos/${cursoId}`
  })
}

/**
 * Envia notificação quando há uma nova resposta no fórum
 */
export async function notificarRespostaForum(
  usuarioId: string,
  topicoTitulo: string,
  topicoId: string
) {
  return await enviarNotificacao({
    usuarioId,
    titulo: '💬 Nova resposta no fórum',
    mensagem: `Há uma nova resposta no tópico "${topicoTitulo}"`,
    tipo: 'INFO',
    link: `/forum/topicos/${topicoId}`
  })
}

/**
 * Envia notificação de sistema (manutenção, atualizações, etc.)
 */
export async function notificarSistema(
  titulo: string,
  mensagem: string,
  tipo: TipoNotificacaoGamificacao = 'INFO'
) {
  // Buscar todos os usuários ativos
  const usuarios = await prisma.user.findMany({
    select: { id: true }
  })

  const usuarioIds = usuarios.map(u => u.id)

  return await enviarNotificacaoParaMultiplos({
    usuarioIds,
    titulo,
    mensagem,
    tipo
  })
}
