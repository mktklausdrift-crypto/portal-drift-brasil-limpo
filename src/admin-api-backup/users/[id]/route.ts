import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-middleware"
import prisma from "@/lib/prisma"
import { validarCNPJ } from "@/lib/validacao-cnpj"
import { TipoConta, Role } from "@prisma/client"

/**
 * GET /api/admin/users/[id]
 * Busca um usuário específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const authResult = await requireAdmin()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            inscricoesCurso: true,
            tentativasQuiz: true,
            posts: true,
            certificados: true,
          },
        },
        pontosUsuario: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        conquistas: {
          include: {
            tipoConquista: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Erro ao buscar usuário:", error)
    return NextResponse.json(
      { error: "Erro ao buscar usuário" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/users/[id]
 * Atualiza um usuário
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const authResult = await requireAdmin()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const body = await request.json()
    const { name, email, role, pontosTotal, tipoConta, cnpj } = body

    // Validação de tipoConta + CNPJ se enviado
    const dataUpdate: {
      name?: string
      email?: string
      role?: Role
      pontosTotal?: number
      tipoConta?: TipoConta
      cnpj?: string | null
    } = {}
    if (name !== undefined) dataUpdate.name = name
    if (email !== undefined) dataUpdate.email = email
    if (role !== undefined) dataUpdate.role = role as Role
    if (pontosTotal !== undefined) dataUpdate.pontosTotal = pontosTotal as number
    if (tipoConta !== undefined) dataUpdate.tipoConta = tipoConta as TipoConta

    const precisaCNPJ = tipoConta === 'MECANICO' || tipoConta === 'DISTRIBUIDOR'
    if (precisaCNPJ) {
      if (!cnpj || !validarCNPJ(cnpj)) {
        return NextResponse.json(
          { error: "CNPJ obrigatório e inválido para o tipo de conta." },
          { status: 400 }
        )
      }
      dataUpdate.cnpj = cnpj
    } else if (tipoConta !== undefined) {
      // Se mudou para PESSOA_FISICA, limpar CNPJ
      dataUpdate.cnpj = null
    } else if (cnpj !== undefined) {
      // Caso envie cnpj sem tipoConta, validar situação atual do usuário
    const atual = await prisma.user.findUnique({ where: { id }, select: { tipoConta: true } })
      const precisaCNPJAtual = atual?.tipoConta === 'MECANICO' || atual?.tipoConta === 'DISTRIBUIDOR'
      if (precisaCNPJAtual) {
        if (!validarCNPJ(cnpj)) {
          return NextResponse.json(
            { error: "CNPJ inválido." },
            { status: 400 }
          )
        }
        dataUpdate.cnpj = cnpj
      } else {
        dataUpdate.cnpj = null
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: dataUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        tipoConta: true,
        cnpj: true,
        pontosTotal: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(user)
  } catch (error: any) {
    console.error("Erro ao atualizar usuário:", error)
    
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Já existe um usuário com este email" },
        { status: 409 }
      )
    }

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: "Erro ao atualizar usuário" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Exclui um usuário
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const authResult = await requireAdmin()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    // Não permitir excluir admin se for o último
    if (user.role === "ADMIN") {
      const adminCount = await prisma.user.count({
        where: { role: "ADMIN" },
      })

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Não é possível excluir o último administrador" },
          { status: 400 }
        )
      }
    }

    // Excluir usuário (cascade irá remover relacionamentos)
    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: "Usuário excluído com sucesso" },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Erro ao excluir usuário:", error)

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: "Erro ao excluir usuário" },
      { status: 500 }
    )
  }
}