import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoriaId = searchParams.get("categoria")?.trim();
    const busca = searchParams.get("busca")?.trim();

    const where: Prisma.PostWhereInput = {
      published: true,
    };

    if (categoriaId) {
      where.categories = {
        some: {
          categoryId: categoriaId,
        },
      };
    }

    if (busca) {
      where.OR = [
        { title: { contains: busca, mode: "insensitive" } },
        { content: { contains: busca, mode: "insensitive" } },
      ];
    }

    const [noticias, categorias] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
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
        },
      }),
      prisma.category.findMany({
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
        },
      }),
    ]);

    return NextResponse.json({ noticias, categorias });
  } catch (error) {
    console.error("Erro ao listar noticias:", error);
    return NextResponse.json(
      { error: "Erro ao carregar noticias" },
      { status: 500 },
    );
  }
}
