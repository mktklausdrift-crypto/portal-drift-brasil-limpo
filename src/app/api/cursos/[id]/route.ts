import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const curso = await prisma.curso.findUnique({
      where: { id },
      select: {
        id: true,
        titulo: true,
        descricao: true,
        modalidade: true,
        cargaHoraria: true,
        imagem: true,
        destaque: true,
        inscricoesAbertas: true,
        createdAt: true,
        updatedAt: true,
        modulos: {
          orderBy: { ordem: 'asc' },
          select: {
            id: true,
            titulo: true,
            descricao: true,
            ordem: true,
            quizId: true,
            quiz: {
              select: {
                id: true,
                titulo: true,
                descricao: true,
                tempo: true,
                pontos: true,
                questoes: {
                  orderBy: { ordem: 'asc' },
                  select: {
                    id: true,
                    pergunta: true,
                    tipo: true,
                    ordem: true,
                    opcoes: {
                      orderBy: { ordem: 'asc' },
                      select: {
                        id: true,
                        texto: true,
                        ordem: true,
                        // NÃO retornar 'correta' para não expor a resposta
                      }
                    }
                  }
                }
              }
            },
            aulas: {
              orderBy: { ordem: 'asc' },
              select: {
                id: true,
                titulo: true,
                descricao: true,
                ordem: true,
                duracao: true,
                videoUrl: true,
              }
            }
          }
        }
      },
    });

    if (!curso) {
      return NextResponse.json(
        { error: "Curso não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(curso);
  } catch (error) {
    console.error("Erro ao buscar curso:", error);
    return NextResponse.json(
      { error: "Erro ao buscar curso" },
      { status: 500 }
    );
  }
}
