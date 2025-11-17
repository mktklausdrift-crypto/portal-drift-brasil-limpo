// GET - Buscar notícia por ID
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  try {
    const noticia = await prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        image: true,
        createdAt: true,
      },
    });
    if (!noticia) return NextResponse.json({ error: "Notícia não encontrada" }, { status: 404 });
    // Adaptar para frontend esperar 'titulo', 'conteudo', 'imagem'
    return NextResponse.json({
      id: noticia.id,
      titulo: noticia.title,
      conteudo: noticia.content,
      imagem: noticia.image,
      createdAt: noticia.createdAt,
    });
  } catch (e) {
    return NextResponse.json({ error: "Erro ao buscar notícia" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const data = await req.json();
  try {
    const noticia = await prisma.post.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        published: data.published,
        image: data.image || null
      }
    });
    return NextResponse.json(noticia);
  } catch (e) {
    return NextResponse.json({ error: "Erro ao atualizar notícia" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  try {
    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Erro ao excluir notícia" }, { status: 500 });
  }
}
