import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// POST - Marcar aula como concluída
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Autenticação necessária' },
        { status: 401 }
      );
    }

    const aulaId = params.id;
    const body = await request.json();
    const { concluido, tempoAssistido } = body;

    // Verificar se aula existe
    const aula = await prisma.aula.findUnique({
      where: { id: aulaId },
      include: {
        modulo: {
          include: {
            curso: true
          }
        }
      }
    });

    if (!aula) {
      return NextResponse.json(
        { error: 'Aula não encontrada' },
        { status: 404 }
      );
    }

    // Criar ou atualizar progresso da aula
    const progresso = await prisma.progressoAula.upsert({
      where: {
        usuarioId_aulaId: {
          usuarioId: session.user.id,
          aulaId: aulaId
        }
      },
      update: {
        concluido: concluido ?? true,
        tempoAssistido: tempoAssistido || undefined,
        updatedAt: new Date()
      },
      create: {
        usuarioId: session.user.id,
        aulaId: aulaId,
        concluido: concluido ?? true,
        tempoAssistido: tempoAssistido || undefined
      }
    });

    // Se marcou como concluída, dar pontos
    if (concluido && progresso.concluido) {
      await prisma.pontosUsuario.create({
        data: {
          usuarioId: session.user.id,
          pontos: 10,
          acao: 'aula_concluida',
          descricao: `Aula concluída: ${aula.titulo}`
        }
      });

      // Atualizar total de pontos do usuário
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          pontosTotal: {
            increment: 10
          }
        }
      });
    }

    // Atualizar progresso do curso
    const cursoId = aula.modulo.curso.id;
    
    // Contar total de aulas do curso
    const totalAulas = await prisma.aula.count({
      where: {
        modulo: {
          cursoId: cursoId
        }
      }
    });

    // Contar aulas concluídas pelo usuário
    const aulasConcluidas = await prisma.progressoAula.count({
      where: {
        usuarioId: session.user.id,
        concluido: true,
        aula: {
          modulo: {
            cursoId: cursoId
          }
        }
      }
    });

    const progressoPercentual = totalAulas > 0 
      ? Math.round((aulasConcluidas / totalAulas) * 100)
      : 0;

    // Atualizar inscrição no curso
    const inscricao = await prisma.inscricaoCurso.upsert({
      where: {
        usuarioId_cursoId: {
          usuarioId: session.user.id,
          cursoId: cursoId
        }
      },
      update: {
        progresso: progressoPercentual,
        concluido: progressoPercentual === 100,
        dataConclusao: progressoPercentual === 100 ? new Date() : undefined
      },
      create: {
        usuarioId: session.user.id,
        cursoId: cursoId,
        progresso: progressoPercentual,
        concluido: progressoPercentual === 100,
        dataConclusao: progressoPercentual === 100 ? new Date() : undefined
      }
    });

    return NextResponse.json({
      success: true,
      progresso: {
        aulaId,
        concluido: progresso.concluido,
        cursoProgresso: progressoPercentual,
        cursoConcluido: progressoPercentual === 100,
        totalAulas,
        aulasConcluidas
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar progresso:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar progresso da aula' },
      { status: 500 }
    );
  }
}

// GET - Obter progresso da aula
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Autenticação necessária' },
        { status: 401 }
      );
    }

    const aulaId = params.id;

    const progresso = await prisma.progressoAula.findUnique({
      where: {
        usuarioId_aulaId: {
          usuarioId: session.user.id,
          aulaId: aulaId
        }
      }
    });

    return NextResponse.json({
      concluido: progresso?.concluido ?? false,
      tempoAssistido: progresso?.tempoAssistido ?? 0
    });

  } catch (error) {
    console.error('Erro ao obter progresso da aula:', error);
    return NextResponse.json(
      { error: 'Erro ao obter progresso' },
      { status: 500 }
    );
  }
}
