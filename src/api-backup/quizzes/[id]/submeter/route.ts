import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/quizzes/[id]/submeter - Buscar última tentativa do usuário
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id: quizId } = await params

    // Buscar última tentativa completa do usuário neste quiz
    const tentativa = await prisma.tentativaQuiz.findFirst({
      where: {
        usuarioId: session.user.id,
        quizId: quizId,
        completa: true
      },
      include: {
        respostas: true
      },
      orderBy: {
        finalizadaEm: 'desc'
      }
    })

    if (!tentativa) {
      return NextResponse.json({ tentativa: null })
    }

    // Buscar quiz para calcular total de questões
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questoes: true
      }
    })

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz não encontrado' }, { status: 404 })
    }

    // Montar respostas no formato esperado
    const respostas: Record<string, string> = {}
    tentativa.respostas.forEach(resposta => {
      respostas[resposta.questaoId] = resposta.opcaoId
    })

    // Calcular quantas corretas
    const corretas = tentativa.respostas.filter(r => r.correta).length
    const aprovado = tentativa.percentual >= 70

    return NextResponse.json({
      tentativa: {
        id: tentativa.id,
        corretas,
        total: quiz.questoes.length,
        pontuacao: tentativa.pontuacao,
        aprovado,
        percentual: tentativa.percentual,
        respostas,
        respostasDetalhadas: tentativa.respostas.map(r => ({
          questaoId: r.questaoId,
          opcaoId: r.opcaoId,
          correta: r.correta
        })),
        finalizadaEm: tentativa.finalizadaEm
      }
    })

  } catch (error) {
    console.error('Erro ao buscar tentativa:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar tentativa' },
      { status: 500 }
    )
  }
}

// POST /api/quizzes/[id]/submeter - Submeter respostas do quiz
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id: quizId } = await params
    const body = await request.json()
    const { respostas } = body // { questaoId: opcaoId, ... }

    if (!respostas || typeof respostas !== 'object') {
      return NextResponse.json(
        { error: 'Respostas inválidas' },
        { status: 400 }
      )
    }

    // Buscar quiz com questões e opções corretas
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questoes: {
          include: {
            opcoes: true
          }
        }
      }
    })

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz não encontrado' },
        { status: 404 }
      )
    }

    // Calcular respostas corretas
    let corretas = 0
    const totalQuestoes = quiz.questoes.length
    const respostasParaSalvar: Array<{
      questaoId: string;
      opcaoId: string;
      correta: boolean;
      pontos: number;
    }> = [];

    quiz.questoes.forEach(questao => {
      const respostaUsuario = respostas[questao.id]
      if (respostaUsuario) {
        const opcaoCorreta = questao.opcoes.find(o => o.correta)
        const isCorreta = opcaoCorreta && opcaoCorreta.id === respostaUsuario
        
        if (isCorreta) {
          corretas++
        }

        respostasParaSalvar.push({
          questaoId: questao.id,
          opcaoId: respostaUsuario,
          correta: isCorreta || false,
          pontos: isCorreta ? (questao.pontos || 1) : 0
        });
      }
    })

    // Calcular pontuação (proporcional)
    const pontuacao = Math.round((corretas / totalQuestoes) * quiz.pontos)
    const percentual = (corretas / totalQuestoes) * 100
    const aprovado = percentual >= 70 // 70% para aprovar

    // Salvar tentativa no banco com as respostas
    const tentativa = await prisma.tentativaQuiz.create({
      data: {
        usuarioId: session.user.id,
        quizId: quizId,
        pontuacao: pontuacao,
        pontuacaoMaxima: quiz.pontos,
        percentual: percentual,
        completa: true,
        iniciadaEm: new Date(),
        finalizadaEm: new Date(),
        respostas: {
          create: respostasParaSalvar
        }
      }
    })

    console.log('✅ Quiz submetido:', {
      usuario: session.user.id,
      quiz: quiz.titulo,
      corretas,
      total: totalQuestoes,
      pontuacao,
      aprovado
    })

    return NextResponse.json({
      corretas,
      total: totalQuestoes,
      pontuacao,
      aprovado,
      percentual,
      tentativaId: tentativa.id,
      respostasDetalhadas: respostasParaSalvar.map(r => ({
        questaoId: r.questaoId,
        opcaoId: r.opcaoId,
        correta: r.correta
      }))
    })

  } catch (error) {
    console.error('Erro ao submeter quiz:', error)
    return NextResponse.json(
      { error: 'Erro ao submeter quiz' },
      { status: 500 }
    )
  }
}
