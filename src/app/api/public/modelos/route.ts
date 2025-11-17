import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

/**
 * GET /api/public/modelos
 * Lista modelos de veículos ativos (sem autenticação)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const montadoraId = searchParams.get("montadoraId")

    const where: any = { ativo: true }

    if (montadoraId) {
      where.montadoraId = montadoraId
    }

    const modelos = await prisma.modeloVeiculo.findMany({
      where,
      orderBy: { nome: "asc" },
      select: {
        id: true,
        nome: true,
        slug: true,
        tipo: true,
        montadora: {
          select: {
            id: true,
            nome: true,
            slug: true,
            imagemUrl: true,
          },
        },
      },
    })

    return NextResponse.json(modelos)
  } catch (error) {
    console.error("Erro ao buscar modelos:", error)
    return NextResponse.json(
      { error: "Erro ao buscar modelos" },
      { status: 500 }
    )
  }
}
