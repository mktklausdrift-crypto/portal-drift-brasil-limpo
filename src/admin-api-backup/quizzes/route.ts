import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// POST - Criar novo quiz
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Autenticação necessária' },
        { status: 401 }
      );
    }

    // Verificar se usuário é admin ou instrutor
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

    const body = await request.json();
    const { titulo, descricao, categoria, dificuldade, tempo, pontos, ativo } = body;

    // Validar campos obrigatórios
    if (!titulo?.trim()) {
      return NextResponse.json(
        { error: 'Título é obrigatório' },
        { status: 400 }
      );
    }

    // Criar quiz
    const quiz = await prisma.quiz.create({
      data: {
        titulo: titulo.trim(),
        descricao: descricao?.trim() || null,
        categoria: categoria?.trim() || null,
        dificuldade: dificuldade || 'intermediario',
        tempo: tempo ? parseInt(tempo) : null,
        pontos: pontos ? parseInt(pontos) : 10,
        ativo: ativo !== false
      }
    });

    return NextResponse.json(quiz, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar quiz:', error);
    return NextResponse.json(
      { error: 'Erro ao criar quiz' },
      { status: 500 }
    );
  }
}

// GET - Listar todos os quizzes
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Autenticação necessária' },
        { status: 401 }
      );
    }

    // Verificar se usuário é admin ou instrutor
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

    // Parâmetros de paginação
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Buscar quizzes com contagem
    const [quizzes, total] = await Promise.all([
      prisma.quiz.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              questoes: true,
              tentativas: true
            }
          }
        }
      }),
      prisma.quiz.count()
    ]);

    return NextResponse.json({
      quizzes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao listar quizzes:', error);
    return NextResponse.json(
      { error: 'Erro ao listar quizzes' },
      { status: 500 }
    );
  }
}
