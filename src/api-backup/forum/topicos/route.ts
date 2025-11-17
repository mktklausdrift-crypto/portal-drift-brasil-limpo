import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { mockTopics } from "@/app/forum/mockTopics";

const criarTopicoSchema = z.object({
  titulo: z.string().min(5, "Título deve ter pelo menos 5 caracteres").max(200, "Título deve ter no máximo 200 caracteres"),
  conteudo: z.string().min(10, "Conteúdo deve ter pelo menos 10 caracteres").max(5000, "Conteúdo deve ter no máximo 5000 caracteres"),
  categoria: z.string().min(1, "Categoria é obrigatória"),
});

export async function GET() {
  try {
    const topicos = await prisma.topicoForum.findMany({
      select: {
        id: true,
        titulo: true,
        conteudo: true,
        categoria: true,
        createdAt: true,
        autor: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (topicos.length > 0) {
      const categorias = new Set<string>(["Todos"]);
      topicos.forEach((topico) => {
        if (topico.categoria) {
          categorias.add(topico.categoria);
        }
      });

      return NextResponse.json({
        topicos: topicos.map((topico) => ({
          ...topico,
          createdAt: topico.createdAt.toISOString(),
        })),
        categorias: Array.from(categorias),
      });
    }

    const fallbackTopicos = mockTopics.map((topic) => ({
      id: String(topic.id),
      titulo: topic.titulo,
      conteudo:
        topic.posts?.[0]?.titulo ??
        "Discussão da comunidade em breve. Compartilhe sua dúvida ou projeto!",
      categoria: topic.categoria,
      createdAt: new Date(topic.createdAt).toISOString(),
      autor: {
        id: "",
        name: topic.autor,
        image: null,
      },
    }));

    const fallbackCategorias = Array.from(
      new Set(["Todos", ...fallbackTopicos.map((topic) => topic.categoria)])
    );

    return NextResponse.json({
      topicos: fallbackTopicos,
      categorias: fallbackCategorias,
      isMock: true,
    });
  } catch (error) {
    console.error("Erro ao listar tópicos do fórum:", error);
    return NextResponse.json(
      { error: "Erro interno ao carregar tópicos do fórum" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Não autenticado. Faça login para criar tópicos." },
        { status: 401 }
      );
    }

    // Validar dados
    const body = await request.json();
    const validationResult = criarTopicoSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { titulo, conteudo, categoria } = validationResult.data;

    // Criar tópico
    const topico = await prisma.topicoForum.create({
      data: {
        titulo,
        conteudo,
        categoria,
        autorId: session.user.id,
      },
      include: {
        autor: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(topico, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar tópico:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}