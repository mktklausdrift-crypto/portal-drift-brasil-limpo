import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

/**
 * GET /api/public/pecas/[codigo]
 * Busca uma peça específica por código ou ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ codigo: string }> }
) {
  try {
    const { codigo } = await params

    // Tentar buscar por código primeiro, depois por ID
    const produto = await prisma.produto.findFirst({
      where: {
        OR: [{ codigo: codigo }, { id: codigo }],
      },
      include: {
        aplicacoes: {
          include: {
            modelo: {
              include: {
                montadora: {
                  select: {
                    id: true,
                    nome: true,
                    imagemUrl: true,
                    slug: true,
                  },
                },
              },
            },
          },
          orderBy: [
            { modelo: { montadora: { nome: "asc" } } },
            { modelo: { nome: "asc" } },
            { anoInicio: "desc" },
          ],
        },
      },
    })

    if (!produto) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(produto)
  } catch (error) {
    console.error("Erro ao buscar produto:", error)
    return NextResponse.json(
      { error: "Erro ao buscar produto" },
      { status: 500 }
    )
  }
}
