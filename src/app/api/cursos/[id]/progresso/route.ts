import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Obter progresso do usuário no curso
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

    const cursoId = params.id;

    // Buscar todas as aulas do curso
    const curso = await prisma.curso.findUnique({
      where: { id: cursoId },
      include: {
        modulos: {
          orderBy: { ordem: 'asc' },
          include: {
            aulas: {
              orderBy: { ordem: 'asc' },
              select: { id: true }
            }
          }
        }
      }
    });

    if (!curso) {
      return NextResponse.json(
        { error: 'Curso não encontrado' },
        { status: 404 }
      );
    }

    // Contar total de aulas
    const totalAulas = curso.modulos.reduce(
      (acc, modulo) => acc + modulo.aulas.length,
      0
    );

    // Buscar aulas concluídas
    const aulasIds = curso.modulos.flatMap(m => m.aulas.map(a => a.id));
    
    const progressoAulas = await prisma.progressoAula.findMany({
      where: {
        usuarioId: session.user.id,
        aulaId: { in: aulasIds },
        concluido: true
      },
      select: {
        aulaId: true
      }
    });

    const aulasConcluidas = progressoAulas.length;
    const aulasConcluidasIds = progressoAulas.map(p => p.aulaId);

    // Calcular progresso
    const progresso = totalAulas > 0 
      ? Math.round((aulasConcluidas / totalAulas) * 100)
      : 0;

    // Buscar ou criar inscrição
    let inscricao = await prisma.inscricaoCurso.findUnique({
      where: {
        usuarioId_cursoId: {
          usuarioId: session.user.id,
          cursoId: cursoId
        }
      }
    });

    if (!inscricao) {
      inscricao = await prisma.inscricaoCurso.create({
        data: {
          usuarioId: session.user.id,
          cursoId: cursoId,
          progresso: progresso,
          concluido: progresso === 100
        }
      });
    } else if (inscricao.progresso !== progresso) {
      // Atualizar progresso
      inscricao = await prisma.inscricaoCurso.update({
        where: { id: inscricao.id },
        data: {
          progresso: progresso,
          concluido: progresso === 100,
          dataConclusao: progresso === 100 && !inscricao.dataConclusao 
            ? new Date() 
            : inscricao.dataConclusao
        }
      });
    }

    return NextResponse.json({
      totalAulas,
      aulasConcluidas,
      aulasConcluidasIds,
      progresso,
      concluido: progresso === 100,
      dataConclusao: inscricao.dataConclusao
    });

  } catch (error) {
    console.error('Erro ao obter progresso:', error);
    return NextResponse.json(
      { error: 'Erro ao obter progresso do curso' },
      { status: 500 }
    );
  }
}
