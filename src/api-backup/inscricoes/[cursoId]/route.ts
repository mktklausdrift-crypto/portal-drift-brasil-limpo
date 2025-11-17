import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/inscricoes/[cursoId] - Verificar status de inscrição
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cursoId: string }> }
) {
  try {
    const { cursoId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({
        inscrito: false,
        status: null
      });
    }

    const inscricao = await prisma.inscricaoCurso.findUnique({
      where: {
        usuarioId_cursoId: {
          usuarioId: session.user.id,
          cursoId: cursoId
        }
      },
      select: {
        id: true,
        progresso: true,
        concluido: true,
        createdAt: true,
        dataConclusao: true
      }
    });

    return NextResponse.json({
      inscrito: !!inscricao,
      progresso: inscricao?.progresso || 0,
      concluido: inscricao?.concluido || false,
      dataInscricao: inscricao?.createdAt || null,
      dataConclusao: inscricao?.dataConclusao || null
    });

  } catch (error) {
    console.error('Erro ao verificar inscrição:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/inscricoes/[cursoId] - Cancelar inscrição
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ cursoId: string }> }
) {
  try {
    const { cursoId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    const inscricao = await prisma.inscricaoCurso.findUnique({
      where: {
        usuarioId_cursoId: {
          usuarioId: session.user.id,
          cursoId: cursoId
        }
      },
      include: {
        curso: {
          select: { titulo: true }
        }
      }
    });

    if (!inscricao) {
      return NextResponse.json(
        { error: 'Inscrição não encontrada' },
        { status: 404 }
      );
    }

    if (inscricao.concluido) {
      return NextResponse.json(
        { error: 'Não é possível cancelar inscrição de curso concluído' },
        { status: 400 }
      );
    }

    // Deletar a inscrição
    await prisma.inscricaoCurso.delete({
      where: {
        usuarioId_cursoId: {
          usuarioId: session.user.id,
          cursoId: cursoId
        }
      }
    });

    // Criar notificação de cancelamento
    await prisma.notificacao.create({
      data: {
        usuarioId: session.user.id,
        titulo: '❌ Inscrição cancelada',
        mensagem: `Sua inscrição no curso "${inscricao.curso.titulo}" foi cancelada.`,
        tipo: 'INFO'
      }
    }).catch(() => {
      console.log('Erro ao criar notificação de cancelamento');
    });

    return NextResponse.json({
      success: true,
      message: 'Inscrição cancelada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao cancelar inscrição:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}