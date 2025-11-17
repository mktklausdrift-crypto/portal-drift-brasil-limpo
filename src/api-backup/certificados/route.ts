import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Listar todos os certificados do usuário logado
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Autenticação necessária' },
        { status: 401 }
      );
    }

    const certificados = await prisma.certificado.findMany({
      where: { usuarioId: session.user.id },
      include: {
        curso: {
          select: {
            id: true,
            titulo: true,
            cargaHoraria: true,
            descricao: true,
            imagem: true
          }
        }
      },
      orderBy: { dataEmissao: 'desc' }
    });

    return NextResponse.json(certificados);

  } catch (error) {
    console.error('Erro ao listar certificados:', error);
    return NextResponse.json(
      { error: 'Erro ao listar certificados' },
      { status: 500 }
    );
  }
}
