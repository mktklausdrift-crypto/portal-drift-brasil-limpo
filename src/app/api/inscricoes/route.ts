import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Schema de validação para inscrição
const inscricaoSchema = z.object({
  cursoId: z.string().min(1, 'ID do curso é obrigatório')
});

// POST /api/inscricoes - Inscrever usuário em curso
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
    const { cursoId } = inscricaoSchema.parse(body);

    // Verificar se o curso existe e está disponível
    const curso = await prisma.curso.findUnique({
      where: { id: cursoId },
      select: { 
        id: true, 
        titulo: true, 
        inscricoesAbertas: true 
      }
    });

    if (!curso) {
      return NextResponse.json(
        { error: 'Curso não encontrado' },
        { status: 404 }
      );
    }

    if (!curso.inscricoesAbertas) {
      return NextResponse.json(
        { error: 'Inscrições fechadas para este curso' },
        { status: 400 }
      );
    }

    // Verificar se usuário já está inscrito
    const inscricaoExistente = await prisma.inscricaoCurso.findUnique({
      where: {
        usuarioId_cursoId: {
          usuarioId: session.user.id,
          cursoId: cursoId
        }
      }
    });

    if (inscricaoExistente) {
      return NextResponse.json(
        { error: 'Usuário já está inscrito neste curso' },
        { status: 400 }
      );
    }

    // Criar inscrição
    const inscricao = await prisma.inscricaoCurso.create({
      data: {
        usuarioId: session.user.id,
        cursoId: cursoId
      },
      include: {
        curso: {
          select: {
            titulo: true,
            imagem: true
          }
        }
      }
    });

    // Criar notificação de boas-vindas
    await prisma.notificacao.create({
      data: {
        usuarioId: session.user.id,
        titulo: '🎉 Inscrição realizada com sucesso!',
        mensagem: `Você foi inscrito no curso "${curso.titulo}". Bons estudos!`,
        tipo: 'SUCCESS',
        link: `/cursos/${cursoId}`
      }
    }).catch(() => {
      // Falha na notificação não deve quebrar a inscrição
      console.log('Erro ao criar notificação de inscrição');
    });

    return NextResponse.json({
      success: true,
      message: 'Inscrição realizada com sucesso!',
      inscricao: {
        id: inscricao.id,
        curso: inscricao.curso,
        dataInscricao: inscricao.createdAt
      }
    });

  } catch (error) {
    console.error('Erro ao inscrever usuário:', error);
    
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

// GET /api/inscricoes - Listar inscrições do usuário
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
    const status = url.searchParams.get('status');

    const inscricoes = await prisma.inscricaoCurso.findMany({
      where: {
        usuarioId: session.user.id,
        ...(status && { status: status as any })
      },
      include: {
        curso: {
          select: {
            id: true,
            titulo: true,
            descricao: true,
            imagem: true,
            modalidade: true,
            cargaHoraria: true,
            avaliacaoMedia: true,
            totalAvaliacoes: true,
            _count: {
              select: {
                modulos: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      inscricoes: inscricoes.map(inscricao => ({
        id: inscricao.id,
        progresso: inscricao.progresso,
        dataInscricao: inscricao.createdAt,
        dataConclusao: inscricao.dataConclusao,
        curso: {
          ...inscricao.curso,
          totalModulos: inscricao.curso._count.modulos
        }
      }))
    });

  } catch (error) {
    console.error('Erro ao buscar inscrições:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}