import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-middleware"
import prisma from "@/lib/prisma"

/**
 * GET /api/admin/montadoras
 * Lista todas as montadoras com paginação
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const skip = (page - 1) * limit

    const where = search
      ? {
          OR: [
            { nome: { contains: search, mode: "insensitive" as const } },
            { pais: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}

    const [montadoras, total] = await Promise.all([
      prisma.montadora.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nome: "asc" },
        include: {
          _count: {
            select: { modelos: true },
          },
        },
      }),
      prisma.montadora.count({ where }),
    ])

    return NextResponse.json({
      montadoras,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao buscar montadoras:", error)
    return NextResponse.json(
      { error: "Erro ao buscar montadoras" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/montadoras
 * Cria uma nova montadora
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const body = await request.json()
    const { nome, imagemUrl, pais, ativo } = body

    if (!nome) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      )
    }

    // Gerar slug a partir do nome
    const slug = nome
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const montadora = await prisma.montadora.create({
      data: {
        nome,
        slug,
        imagemUrl,
        pais,
        ativo: ativo !== undefined ? ativo : true,
      },
    })

    return NextResponse.json(montadora, { status: 201 })
  } catch (error: any) {
    console.error("Erro ao criar montadora:", error)
    
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Já existe uma montadora com este nome" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Erro ao criar montadora" },
      { status: 500 }
    )
  }
}
