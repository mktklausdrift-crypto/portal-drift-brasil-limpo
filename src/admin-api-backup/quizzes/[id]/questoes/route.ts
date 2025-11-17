import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// POST - Criar nova questão
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Autenticação necessária' },
        { status: 401 }
      );
    }

    // Verificar permissão
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (!user || !['ADMIN', 'INSTRUCTOR'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const quizId = params.id;
    const body = await request.json();
    const { pergunta, tipo, ordem, pontos, opcoes } = body;

    // Validar campos obrigatórios
    if (!pergunta?.trim()) {
      return NextResponse.json(
        { error: 'Pergunta é obrigatória' },
        { status: 400 }
      );
    }

    // Criar questão com opções
    const questao = await prisma.questaoQuiz.create({
      data: {
        quizId: quizId,
        pergunta: pergunta.trim(),
        tipo: tipo || 'MULTIPLA_ESCOLHA',
        ordem: ordem ? parseInt(ordem) : 0,
        pontos: pontos ? parseInt(pontos) : 1,
        opcoes: {
          create: opcoes?.map((opcao: any, index: number) => ({
            texto: opcao.texto,
            correta: opcao.correta || false,
            ordem: index
          })) || []
        }
      },
      include: {
        opcoes: {
          orderBy: { ordem: 'asc' }
        }
      }
    });

    return NextResponse.json(questao, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar questão:', error);
    return NextResponse.json(
      { error: 'Erro ao criar questão' },
      { status: 500 }
    );
  }
}

// GET - Listar questões do quiz
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Autenticação necessária' },
        { status: 401 }
      );
    }

    const quizId = params.id;

    const questoes = await prisma.questaoQuiz.findMany({
      where: { quizId: quizId },
      orderBy: { ordem: 'asc' },
      include: {
        opcoes: {
          orderBy: { ordem: 'asc' }
        }
      }
    });

    return NextResponse.json(questoes);

  } catch (error) {
    console.error('Erro ao listar questões:', error);
    return NextResponse.json(
      { error: 'Erro ao listar questões' },
      { status: 500 }
    );
  }
}
