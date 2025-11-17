import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const data = await req.json();
  try {
    const topico = await prisma.topicoForum.create({
      data: {
        titulo: data.titulo,
        conteudo: data.conteudo,
        categoria: data.categoria,
        autorId: session.user.id
      }
    });
    return NextResponse.json(topico);
  } catch (e) {
    return NextResponse.json({ error: "Erro ao criar tópico" }, { status: 500 });
  }
}
