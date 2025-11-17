import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Autenticação necessária" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const aula = await prisma.aula.findUnique({
      where: { id },
      select: {
        id: true,
        titulo: true,
        descricao: true,
        ordem: true,
        duracao: true,
        videoUrl: true,
        conteudo: true,
        modulo: {
          select: {
            id: true,
            titulo: true,
            curso: {
              select: {
                id: true,
                titulo: true,
              }
            }
          }
        }
      },
    });

    if (!aula) {
      return NextResponse.json(
        { error: "Aula não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(aula);
  } catch (error) {
    console.error("Erro ao buscar aula:", error);
    return NextResponse.json(
      { error: "Erro ao buscar aula" },
      { status: 500 }
    );
  }
}
