import { NextResponse } from "next/server";
import { requireInstructorOrAdmin } from "@/lib/auth-middleware";
import prisma from "@/lib/prisma";

// GET - Buscar curso por ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionOrError = await requireInstructorOrAdmin();
    if (sessionOrError instanceof NextResponse) return sessionOrError;

    const { id } = await params;
    const course = await prisma.curso.findUnique({
      where: { id },
    });

    if (!course) {
      return NextResponse.json({ error: "Curso não encontrado" }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("Erro ao buscar curso:", error);
    return NextResponse.json({ error: "Erro ao buscar curso" }, { status: 500 });
  }
}

// PUT - Atualizar curso
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionOrError = await requireInstructorOrAdmin();
    if (sessionOrError instanceof NextResponse) return sessionOrError;

    const { id } = await params;
    const body = await request.json();
    const { titulo, descricao, modalidade, cargaHoraria, destaque, inscricoesAbertas } = body;

    const course = await prisma.curso.update({
      where: { id },
      data: {
        titulo,
        descricao,
        modalidade,
        cargaHoraria,
        destaque,
        inscricoesAbertas,
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("Erro ao atualizar curso:", error);
    return NextResponse.json({ error: "Erro ao atualizar curso" }, { status: 500 });
  }
}

// DELETE - Excluir curso
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionOrError = await requireInstructorOrAdmin();
    if (sessionOrError instanceof NextResponse) return sessionOrError;

    const { id } = await params;
    await prisma.curso.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Curso excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir curso:", error);
    return NextResponse.json({ error: "Erro ao excluir curso" }, { status: 500 });
  }
}
