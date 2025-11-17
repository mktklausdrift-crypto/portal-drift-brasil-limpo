
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const modalidade = searchParams.get("modalidade");
    const busca = searchParams.get("busca");
    const cursos = await prisma.curso.findMany({
      where: {
        ...(modalidade && modalidade !== "Todos" ? { modalidade } : {}),
        ...(busca
          ? {
              OR: [
                { titulo: { contains: busca, mode: "insensitive" } },
                { descricao: { contains: busca, mode: "insensitive" } }
              ]
            }
          : {})
      },
      orderBy: { createdAt: "desc" },
      take: 500,
      select: {
        id: true,
        titulo: true,
        descricao: true,
        modalidade: true,
        cargaHoraria: true,
        imagem: true,
        destaque: true,
        inscricoesAbertas: true
      }
    });
    return NextResponse.json(cursos);
  } catch (error) {
    console.error("Erro ao buscar cursos:", error);
    return NextResponse.json({ error: "Erro ao buscar cursos" }, { status: 500 });
  }
}
