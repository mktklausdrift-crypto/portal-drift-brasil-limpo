import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// POST - Gerar certificado (quando curso estiver 100% concluído)
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

    const cursoId = params.id;

    // Verificar se curso existe
    const curso = await prisma.curso.findUnique({
      where: { id: cursoId },
      select: { id: true, titulo: true }
    });

    if (!curso) {
      return NextResponse.json(
        { error: 'Curso não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se usuário concluiu o curso
    const inscricao = await prisma.inscricaoCurso.findUnique({
      where: {
        usuarioId_cursoId: {
          usuarioId: session.user.id,
          cursoId: cursoId
        }
      }
    });

    if (!inscricao || !inscricao.concluido) {
      return NextResponse.json(
        { error: 'Você precisa concluir o curso para gerar o certificado' },
        { status: 400 }
      );
    }

    // Verificar se já existe certificado
    let certificado = await prisma.certificado.findUnique({
      where: {
        usuarioId_cursoId: {
          usuarioId: session.user.id,
          cursoId: cursoId
        }
      }
    });

    // Se não existe, criar novo
    if (!certificado) {
      const codigoVerificacao = randomBytes(16).toString('hex').toUpperCase();

      certificado = await prisma.certificado.create({
        data: {
          usuarioId: session.user.id,
          cursoId: cursoId,
          codigoVerificacao: codigoVerificacao,
          dataEmissao: new Date()
        },
        include: {
          usuario: {
            select: { id: true, name: true, email: true }
          },
          curso: {
            select: { id: true, titulo: true, cargaHoraria: true }
          }
        }
      });

      // Dar pontos pela conclusão do curso
      await prisma.pontosUsuario.create({
        data: {
          usuarioId: session.user.id,
          pontos: 100,
          acao: 'curso_concluido',
          descricao: `Curso concluído: ${curso.titulo}`
        }
      });

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          pontosTotal: {
            increment: 100
          }
        }
      });

      // Criar notificação
      await prisma.notificacao.create({
        data: {
          usuarioId: session.user.id,
          titulo: '🎉 Certificado Gerado!',
          mensagem: `Parabéns! Você concluiu o curso "${curso.titulo}" e ganhou 100 pontos!`,
          tipo: 'SUCCESS',
          link: `/certificados/${cursoId}`
        }
      });
    }

    return NextResponse.json({
      success: true,
      certificado: {
        id: certificado.id,
        codigoVerificacao: certificado.codigoVerificacao,
        dataEmissao: certificado.dataEmissao
      }
    });

  } catch (error) {
    console.error('Erro ao gerar certificado:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar certificado' },
      { status: 500 }
    );
  }
}

// GET - Obter certificado do usuário para este curso
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

    const certificado = await prisma.certificado.findUnique({
      where: {
        usuarioId_cursoId: {
          usuarioId: session.user.id,
          cursoId: cursoId
        }
      },
      include: {
        usuario: {
          select: { id: true, name: true, email: true }
        },
        curso: {
          select: { 
            id: true, 
            titulo: true, 
            cargaHoraria: true,
            descricao: true
          }
        }
      }
    });

    if (!certificado) {
      return NextResponse.json(
        { error: 'Certificado não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(certificado);

  } catch (error) {
    console.error('Erro ao buscar certificado:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar certificado' },
      { status: 500 }
    );
  }
}
