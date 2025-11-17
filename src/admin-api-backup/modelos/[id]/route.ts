import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-middleware"
import prisma from "@/lib/prisma"

/**
 * GET /api/admin/modelos/[id]
 * Busca um modelo por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { id } = await params

    const modelo = await prisma.modeloVeiculo.findUnique({
      where: { id },
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
    })

    if (!modelo) {
      return NextResponse.json(
        { error: "Modelo não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(modelo)
  } catch (error) {
    console.error("Erro ao buscar modelo:", error)
    return NextResponse.json(
      { error: "Erro ao buscar modelo" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/modelos/[id]
 * Atualiza um modelo
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { id } = await params
    const body = await request.json()
    const { nome, montadoraId, tipo, ativo } = body

    if (!nome || !montadoraId) {
      return NextResponse.json(
        { error: "Nome e montadora são obrigatórios" },
        { status: 400 }
      )
    }

    // Gerar novo slug
    const slug = nome
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const modelo = await prisma.modeloVeiculo.update({
      where: { id },
      data: {
        nome,
        slug,
        montadoraId,
        tipo,
        ativo,
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

    return NextResponse.json(modelo)
  } catch (error: any) {
    console.error("Erro ao atualizar modelo:", error)

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Modelo não encontrado" },
        { status: 404 }
      )
    }

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Já existe um modelo com este nome para esta montadora" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Erro ao atualizar modelo" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/modelos/[id]
 * Exclui um modelo
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { id } = await params

    // Verificar se há aplicações associadas
    const aplicacoesCount = await prisma.aplicacao.count({
      where: { modeloId: id },
    })

    if (aplicacoesCount > 0) {
      return NextResponse.json(
        {
          error: `Não é possível excluir este modelo pois ele possui ${aplicacoesCount} aplicação(ões) associada(s)`,
        },
        { status: 400 }
      )
    }

    await prisma.modeloVeiculo.delete({
      where: { id },
    })

    return NextResponse.json({
      message: "Modelo excluído com sucesso",
    })
  } catch (error: any) {
    console.error("Erro ao excluir modelo:", error)

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Modelo não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: "Erro ao excluir modelo" },
      { status: 500 }
    )
  }
}
