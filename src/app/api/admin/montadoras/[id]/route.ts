import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-middleware"
import prisma from "@/lib/prisma"

/**
 * GET /api/admin/montadoras/[id]
 * Busca uma montadora por ID
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

    const montadora = await prisma.montadora.findUnique({
      where: { id },
      include: {
        _count: {
          select: { modelos: true },
        },
      },
    })

    if (!montadora) {
      return NextResponse.json(
        { error: "Montadora não encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(montadora)
  } catch (error) {
    console.error("Erro ao buscar montadora:", error)
    return NextResponse.json(
      { error: "Erro ao buscar montadora" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/montadoras/[id]
 * Atualiza uma montadora
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
    const { nome, imagemUrl, pais, ativo } = body

    if (!nome) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      )
    }

    // Gerar novo slug se o nome mudou
    const slug = nome
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const montadora = await prisma.montadora.update({
      where: { id },
      data: {
        nome,
        slug,
        imagemUrl,
        pais,
        ativo,
      },
    })

    return NextResponse.json(montadora)
  } catch (error: any) {
    console.error("Erro ao atualizar montadora:", error)

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Montadora não encontrada" },
        { status: 404 }
      )
    }

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Já existe uma montadora com este nome" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Erro ao atualizar montadora" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/montadoras/[id]
 * Exclui uma montadora
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

    // Verificar se há modelos associados
    const modelosCount = await prisma.modeloVeiculo.count({
      where: { montadoraId: id },
    })

    if (modelosCount > 0) {
      return NextResponse.json(
        {
          error: `Não é possível excluir esta montadora pois ela possui ${modelosCount} modelo(s) associado(s)`,
        },
        { status: 400 }
      )
    }

    await prisma.montadora.delete({
      where: { id },
    })

    return NextResponse.json({
      message: "Montadora excluída com sucesso",
    })
  } catch (error: any) {
    console.error("Erro ao excluir montadora:", error)

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Montadora não encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: "Erro ao excluir montadora" },
      { status: 500 }
    )
  }
}
