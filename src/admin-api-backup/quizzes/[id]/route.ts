import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Obter quiz específico
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

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questoes: {
          orderBy: { ordem: 'asc' },
          include: {
            opcoes: {
              orderBy: { ordem: 'asc' }
            }
          }
        },
        _count: {
          select: {
            questoes: true,
            tentativas: true
          }
        }
      }
    });

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(quiz);

  } catch (error) {
    console.error('Erro ao buscar quiz:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar quiz' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar quiz
export async function PUT(
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

    const quiz = await prisma.quiz.update({
      where: { id: quizId },
      data: {
        titulo: body.titulo,
        descricao: body.descricao || null,
        categoria: body.categoria || null,
        dificuldade: body.dificuldade,
        tempo: body.tempo ? parseInt(body.tempo) : null,
        pontos: body.pontos ? parseInt(body.pontos) : 10,
        ativo: body.ativo
      }
    });

    return NextResponse.json(quiz);

  } catch (error) {
    console.error('Erro ao atualizar quiz:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar quiz' },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar parcialmente (ex: apenas ativo)
export async function PATCH(
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

    const quiz = await prisma.quiz.update({
      where: { id: quizId },
      data: body
    });

    return NextResponse.json(quiz);

  } catch (error) {
    console.error('Erro ao atualizar quiz:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar quiz' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir quiz
export async function DELETE(
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

    // Verificar permissão (apenas ADMIN pode excluir)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Apenas administradores podem excluir quizzes' },
        { status: 403 }
      );
    }

    const quizId = params.id;

    await prisma.quiz.delete({
      where: { id: quizId }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erro ao excluir quiz:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir quiz' },
      { status: 500 }
    );
  }
}
