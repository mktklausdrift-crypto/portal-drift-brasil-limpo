import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Schema de validação
const progressoSchema = z.object({
  aulaId: z.string().min(1, 'ID da aula é obrigatório'),
  cursoId: z.string().min(1, 'ID do curso é obrigatório'),
  moduloId: z.string().min(1, 'ID do módulo é obrigatório'),
  concluida: z.boolean().optional().default(true),
  tempoAssistido: z.number().optional().default(0), // em segundos
});

// POST /api/progresso/aulas - Marcar aula como concluída
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { aulaId, cursoId, moduloId, concluida, tempoAssistido } = progressoSchema.parse(body);

    // Verificar se usuário está inscrito no curso
    const inscricao = await prisma.inscricaoCurso.findUnique({
      where: {
        usuarioId_cursoId: {
          usuarioId: session.user.id,
          cursoId: cursoId
        }
      }
    });

    if (!inscricao) {
      return NextResponse.json(
        { error: 'Usuário não está inscrito neste curso' },
        { status: 403 }
      );
    }

    // Verificar se aula existe
    const aula = await prisma.aula.findFirst({
      where: {
        id: aulaId,
        moduloId: moduloId,
        modulo: {
          cursoId: cursoId
        }
      }
    });

    if (!aula) {
      return NextResponse.json(
        { error: 'Aula não encontrada' },
        { status: 404 }
      );
    }

    // Atualizar ou criar progresso da aula
    const progressoAula = await prisma.progressoAula.upsert({
      where: {
        usuarioId_aulaId: {
          usuarioId: session.user.id,
          aulaId: aulaId
        }
      },
      update: {
        concluido: concluida,
        tempoAssistido: tempoAssistido
      },
      create: {
        usuarioId: session.user.id,
        aulaId: aulaId,
        concluido: concluida,
        tempoAssistido: tempoAssistido
      }
    });

    // Calcular progresso do curso
    const novoProgresso = await calcularProgressoCurso(session.user.id, cursoId);

    // Atualizar progresso na inscrição
    await prisma.inscricaoCurso.update({
      where: {
        usuarioId_cursoId: {
          usuarioId: session.user.id,
          cursoId: cursoId
        }
      },
      data: {
        progresso: novoProgresso,
        // Se progresso chegou a 100%, marcar como concluído
        ...(novoProgresso >= 100 && {
          concluido: true,
          dataConclusao: new Date()
        })
      }
    });

    // Se curso foi concluído, criar notificação
    if (novoProgresso >= 100) {
      const curso = await prisma.curso.findUnique({
        where: { id: cursoId },
        select: { titulo: true }
      });

      if (curso) {
        await prisma.notificacao.create({
          data: {
            usuarioId: session.user.id,
            titulo: '🎉 Curso Concluído!',
            mensagem: `Parabéns! Você concluiu o curso "${curso.titulo}". Seu certificado está disponível.`,
            tipo: 'SUCCESS',
            link: `/certificados/${cursoId}`
          }
        }).catch(() => {
          console.log('Erro ao criar notificação de conclusão');
        });
      }
    }

    return NextResponse.json({
      success: true,
      progresso: {
        aulaId: progressoAula.aulaId,
        concluido: progressoAula.concluido,
        tempoAssistido: progressoAula.tempoAssistido
      },
      progressoCurso: novoProgresso
    });

  } catch (error) {
    console.error('Erro ao atualizar progresso:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// GET /api/progresso/aulas - Buscar progresso das aulas do usuário
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const cursoId = url.searchParams.get('cursoId');

    if (!cursoId) {
      return NextResponse.json(
        { error: 'ID do curso é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar todas as aulas do curso primeiro
    const aulasIds = await prisma.aula.findMany({
      where: {
        modulo: {
          cursoId: cursoId
        }
      },
      select: {
        id: true
      }
    });

    const aulasIdsArray = aulasIds.map(a => a.id);

    const progressos = await prisma.progressoAula.findMany({
      where: {
        usuarioId: session.user.id,
        aulaId: {
          in: aulasIdsArray
        }
      },
      select: {
        aulaId: true,
        concluido: true,
        tempoAssistido: true
      }
    });

    // Converter para objeto para facilitar lookup
    const progressoMap = progressos.reduce((acc, p) => {
      acc[p.aulaId] = {
        concluido: p.concluido,
        tempoAssistido: p.tempoAssistido
      };
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      progressos: progressoMap
    });

  } catch (error) {
    console.error('Erro ao buscar progresso:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função para calcular progresso do curso
async function calcularProgressoCurso(usuarioId: string, cursoId: string): Promise<number> {
  try {
    // Buscar total de aulas do curso
    const totalAulas = await prisma.aula.count({
      where: {
        modulo: {
          cursoId: cursoId
        }
      }
    });

    if (totalAulas === 0) return 0;

    // Buscar aulas concluídas pelo usuário
    const aulasIds = await prisma.aula.findMany({
      where: {
        modulo: {
          cursoId: cursoId
        }
      },
      select: {
        id: true
      }
    });

    const aulasIdsArray = aulasIds.map(a => a.id);

    const aulasConcluidas = await prisma.progressoAula.count({
      where: {
        usuarioId: usuarioId,
        aulaId: {
          in: aulasIdsArray
        },
        concluido: true
      }
    });

    return Math.round((aulasConcluidas / totalAulas) * 100);
  } catch (error) {
    console.error('Erro ao calcular progresso:', error);
    return 0;
  }
}