import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const criarRespostaSchema = z.object({
  conteudo: z.string().min(5, "Resposta deve ter pelo menos 5 caracteres").max(2000, "Resposta deve ter no máximo 2000 caracteres"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: topicoId } = await params;

    // Verificar autenticação
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Não autenticado. Faça login para responder." },
        { status: 401 }
      );
    }

    // Verificar se o tópico existe
    const topico = await prisma.topicoForum.findUnique({
      where: { id: topicoId },
    });

    if (!topico) {
      return NextResponse.json(
        { error: "Tópico não encontrado" },
        { status: 404 }
      );
    }

    // Validar dados
    const body = await request.json();
    const validationResult = criarRespostaSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { conteudo } = validationResult.data;

    // Criar resposta
    const resposta = await prisma.respostaForum.create({
      data: {
        conteudo,
        autorId: session.user.id,
        topicoId,
      },
      include: {
        autor: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(resposta, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar resposta:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}