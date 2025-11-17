import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireInstructorOrAdmin } from "@/lib/auth-middleware";

// GET - Listar cursos (utilizado pela UI admin)
export async function GET(request: Request) {
  try {
    // Apenas ADMIN/INSTRUCTOR podem listar cursos na área admin
    const sessionOrError = await requireInstructorOrAdmin();
    if (sessionOrError instanceof NextResponse) return sessionOrError;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      prisma.curso.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          titulo: true,
          descricao: true,
          modalidade: true,
          cargaHoraria: true,
          imagem: true,
          destaque: true,
          inscricoesAbertas: true,
          createdAt: true,
        },
      }),
      prisma.curso.count(),
    ]);

    return NextResponse.json({
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar cursos:", error);
    return NextResponse.json({ error: "Erro ao buscar cursos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Apenas ADMIN/INSTRUCTOR podem criar curso
    const sessionOrError = await requireInstructorOrAdmin();
    if (sessionOrError instanceof NextResponse) return sessionOrError;

    const body = await request.json();
    const { titulo, descricao, modalidade, cargaHoraria, imagem, destaque, inscricoesAbertas } = body;

    // Logs de depuração (apenas em desenvolvimento)
    if (process.env.NODE_ENV !== "production") {
      console.log("[POST /api/admin/cursos] Body recebido:", {
        titulo,
        descricaoLength: typeof descricao === "string" ? descricao.length : undefined,
        modalidade,
        cargaHoraria,
        imagem,
        destaque,
        inscricoesAbertas,
      });
    }

    // Validações básicas
    if (!titulo || !descricao || !modalidade || !cargaHoraria) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando: título, descrição, modalidade e carga horária são obrigatórios" },
        { status: 400 }
      );
    }

    if (typeof titulo !== "string" || titulo.trim().length < 5 || titulo.trim().length > 100) {
      return NextResponse.json(
        { error: "O título deve ter entre 5 e 100 caracteres" },
        { status: 400 }
      );
    }

    if (typeof descricao !== "string" || descricao.trim().length < 20 || descricao.trim().length > 5000) {
      return NextResponse.json(
        { error: "A descrição deve ter entre 20 e 5000 caracteres" },
        { status: 400 }
      );
    }

    const curso = await prisma.curso.create({
      data: {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        modalidade,
        cargaHoraria: String(cargaHoraria).trim(),
        imagem: imagem || null,
        destaque: Boolean(destaque) || false,
        inscricoesAbertas: inscricoesAbertas !== undefined ? Boolean(inscricoesAbertas) : true,
      },
    });

    return NextResponse.json(curso, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar curso:", error);
    const message = error instanceof Error ? error.message : "Erro ao criar curso";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
