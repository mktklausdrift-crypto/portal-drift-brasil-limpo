import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Buscar tópico com autor e respostas
    const topico = await prisma.topicoForum.findUnique({
      where: { id },
      select: {
        id: true,
        titulo: true,
        conteudo: true,
        categoria: true,
        visualizacoes: true,
        createdAt: true,
        updatedAt: true,
        autor: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
        respostas: {
          select: {
            id: true,
            conteudo: true,
            createdAt: true,
            autor: {
              select: {
                id: true,
                name: true,
                image: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!topico) {
      return NextResponse.json(
        { error: "Tópico não encontrado" },
        { status: 404 }
      );
    }

    // Incrementar visualizações
    await prisma.topicoForum.update({
      where: { id },
      data: {
        visualizacoes: {
          increment: 1,
        },
      },
    });

    return NextResponse.json(topico);
  } catch (error) {
    console.error("Erro ao buscar tópico:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}