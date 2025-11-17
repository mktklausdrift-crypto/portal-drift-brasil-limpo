import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const data = await req.json();
  try {
    const noticia = await prisma.post.create({
      data: {
        title: data.title,
        content: data.content,
        published: data.published,
        image: data.image || null,
        authorId: session.user.id
      }
    });
    return NextResponse.json(noticia);
  } catch (e) {
    return NextResponse.json({ error: "Erro ao criar notícia" }, { status: 500 });
  }
}
