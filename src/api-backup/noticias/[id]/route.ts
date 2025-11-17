import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const noticia = await prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        image: true,
        categories: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        author: {
          select: {
            name: true,
          },
        },
        createdAt: true,
      },
    });

    if (!noticia) {
      return NextResponse.json(
        { error: "Notícia não encontrada" },
        { status: 404 }
      );
    }

    // Adaptar campos para o frontend
    const response = {
      id: noticia.id,
      titulo: noticia.title,
      conteudo: noticia.content,
      imagem: noticia.image,
      categoria: noticia.categories[0]?.category || null,
      autor: noticia.author,
      createdAt: noticia.createdAt,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erro ao buscar notícia:", error);
    return NextResponse.json(
      { error: "Erro ao buscar notícia" },
      { status: 500 }
    );
  }
}
