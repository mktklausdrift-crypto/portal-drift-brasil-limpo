import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-middleware"
import prisma from "@/lib/prisma"

/**
 * GET /api/admin/modelos
 * Lista todos os modelos de veículos com paginação
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const search = searchParams.get("search") || ""
    const montadoraId = searchParams.get("montadoraId") || ""
    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { nome: { contains: search, mode: "insensitive" as const } },
        { tipo: { contains: search, mode: "insensitive" as const } },
      ]
    }

    if (montadoraId) {
      where.montadoraId = montadoraId
    }

    const [modelos, total] = await Promise.all([
      prisma.modeloVeiculo.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ montadora: { nome: "asc" } }, { nome: "asc" }],
        include: {
          montadora: {
            select: {
              id: true,
              nome: true,
              imagemUrl: true,
            },
          },
          _count: {
            select: { aplicacoes: true },
          },
        },
      }),
      prisma.modeloVeiculo.count({ where }),
    ])

    return NextResponse.json({
      modelos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao buscar modelos:", error)
    return NextResponse.json(
      { error: "Erro ao buscar modelos" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/modelos
 * Cria um novo modelo de veículo
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const body = await request.json()
    const { nome, montadoraId, tipo, ativo } = body

    if (!nome || !montadoraId) {
      return NextResponse.json(
        { error: "Nome e montadora são obrigatórios" },
        { status: 400 }
      )
    }

    // Verificar se a montadora existe
    const montadora = await prisma.montadora.findUnique({
      where: { id: montadoraId },
    })

    if (!montadora) {
      return NextResponse.json(
        { error: "Montadora não encontrada" },
        { status: 404 }
      )
    }

    // Gerar slug a partir do nome
    const slug = nome
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const modelo = await prisma.modeloVeiculo.create({
      data: {
        nome,
        slug,
        montadoraId,
        tipo,
        ativo: ativo !== undefined ? ativo : true,
      },
      include: {
        montadora: {
          select: {
            id: true,
            nome: true,
            imagemUrl: true,
          },
        },
      },
    })

    return NextResponse.json(modelo, { status: 201 })
  } catch (error: any) {
    console.error("Erro ao criar modelo:", error)

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Já existe um modelo com este nome para esta montadora" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Erro ao criar modelo" },
      { status: 500 }
    )
  }
}
