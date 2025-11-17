import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

/**
 * GET /api/public/pecas
 * Busca peças/produtos com filtros (sem autenticação)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const montadoraId = searchParams.get("montadoraId")
    const modeloId = searchParams.get("modeloId")
    const ano = searchParams.get("ano")
    const categoria = searchParams.get("categoria")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "24")
    const skip = (page - 1) * limit

    let where: any = {}

    // Busca por texto (código ou nome)
    if (search) {
      where.OR = [
        { nome: { contains: search, mode: "insensitive" as const } },
        { codigo: { contains: search, mode: "insensitive" as const } },
        { descricao: { contains: search, mode: "insensitive" as const } },
        { fabricante: { contains: search, mode: "insensitive" as const } },
      ]
    }

    // Filtro por categoria
    if (categoria) {
      // Suporta múltiplas categorias separadas por vírgula
      const categorias = categoria.split(',').map(c => c.trim()).filter(Boolean)
      if (categorias.length === 1) {
        where.categoria = categorias[0]
      } else if (categorias.length > 1) {
        where.categoria = { in: categorias }
      }
    }

    // Filtro por aplicações de veículo
    if (montadoraId || modeloId || ano) {
      where.aplicacoes = { some: {} }

      if (modeloId) {
        where.aplicacoes.some.modeloId = modeloId
      } else if (montadoraId) {
        where.aplicacoes.some.modelo = {
          montadoraId: montadoraId,
        }
      }

      if (ano) {
        const anoNum = parseInt(ano)
        where.aplicacoes.some.anoInicio = { lte: anoNum }
        where.aplicacoes.some.anoFim = { gte: anoNum }
      }
    }

    const [produtos, total] = await Promise.all([
      prisma.produto.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ destaque: "desc" }, { nome: "asc" }],
        select: {
          id: true,
          codigo: true,
          nome: true,
          descricao: true,
          preco: true,
          imagem: true,
          categoria: true,
          fabricante: true,
          destaque: true,
          estoque: true,
          _count: {
            select: { aplicacoes: true },
          },
          aplicacoes: {
            take: 5,
            select: {
              modelo: {
                select: {
                  nome: true,
                  montadora: {
                    select: {
                      nome: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.produto.count({ where }),
    ])

    return NextResponse.json({
      produtos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao buscar peças:", error)
    return NextResponse.json(
      { error: "Erro ao buscar peças" },
      { status: 500 }
    )
  }
}
