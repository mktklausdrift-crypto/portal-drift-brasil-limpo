import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Buscar post por ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Notícia não encontrada" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Erro ao buscar notícia:", error);
    return NextResponse.json({ error: "Erro ao buscar notícia" }, { status: 500 });
  }
}

// PUT - Atualizar post
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
  const { title, content, published, categoryIds, image } = body;

    // Remover categorias antigas
    await prisma.postsOnCategories.deleteMany({
      where: { postId: id },
    });

    // Atualizar post e adicionar novas categorias
    const post = await prisma.post.update({
      where: { id },
      data: {
        title,
        content,
        published,
        image: image || null,
        categories: {
          create: (categoryIds || []).map((categoryId: string) => ({
            category: {
              connect: { id: categoryId },
            },
          })),
        },
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Erro ao atualizar notícia:", error);
    return NextResponse.json({ error: "Erro ao atualizar notícia" }, { status: 500 });
  }
}

// DELETE - Excluir post
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.postsOnCategories.deleteMany({
      where: { postId: id },
    });

    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Notícia excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir notícia:", error);
    return NextResponse.json({ error: "Erro ao excluir notícia" }, { status: 500 });
  }
}
