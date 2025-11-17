import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Verificar certificado por código
export async function GET(
  request: NextRequest,
  { params }: { params: { codigo: string } }
) {
  try {
    const codigo = params.codigo.toUpperCase();

    const certificado = await prisma.certificado.findUnique({
      where: { codigoVerificacao: codigo },
      include: {
        usuario: {
          select: { name: true }
        },
        curso: {
          select: { 
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

    return NextResponse.json({
      valido: true,
      aluno: certificado.usuario.name,
      curso: certificado.curso.titulo,
      cargaHoraria: certificado.curso.cargaHoraria,
      dataEmissao: certificado.dataEmissao,
      codigoVerificacao: certificado.codigoVerificacao
    });

  } catch (error) {
    console.error('Erro ao verificar certificado:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar certificado' },
      { status: 500 }
    );
  }
}
