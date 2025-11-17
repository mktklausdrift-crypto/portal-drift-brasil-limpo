import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

/**
 * GET /api/public/montadoras
 * Lista montadoras ativas (sem autenticação)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeModelos = searchParams.get("includeModelos") === "true"

    const montadoras = await prisma.montadora.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
      select: {
        id: true,
        nome: true,
        imagemUrl: true,
        slug: true,
        modelos: includeModelos
          ? {
              where: { ativo: true },
              select: {
                id: true,
                nome: true,
                slug: true,
                tipo: true,
              },
              orderBy: { nome: "asc" },
            }
          : false,
      },
    })

    return NextResponse.json(montadoras)
  } catch (error) {
    console.error("Erro ao buscar montadoras:", error)
    return NextResponse.json(
      { error: "Erro ao buscar montadoras" },
      { status: 500 }
    )
  }
}
