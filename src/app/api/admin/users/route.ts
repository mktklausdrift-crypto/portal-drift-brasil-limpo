import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-middleware"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { validarCNPJ } from "@/lib/validacao-cnpj"
import { TipoConta, Role } from "@prisma/client"

// Validação de criação de usuário (POST)
const createUserSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").optional(),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
  role: z.enum(["ADMIN", "INSTRUCTOR", "STUDENT"]).optional(),
  tipoConta: z.enum(["PESSOA_FISICA", "MECANICO", "DISTRIBUIDOR"]).optional(),
  cnpj: z.string().optional()
})

/**
 * GET /api/admin/users
 * Lista todos os usuários com filtros
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
    const role = searchParams.get("role") || ""
    const tipoContaParam = searchParams.get("tipoConta") || ""
    const skip = (page - 1) * limit

    const where: {
      OR?: { name?: { contains: string; mode: "insensitive" }; email?: { contains: string; mode: "insensitive" } }[]
      role?: Role
      tipoConta?: TipoConta
    } & Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
      ]
    }

    if (role && role !== "ALL") {
      where.role = role as Role
    }
    if (tipoContaParam && tipoContaParam !== "ALL") {
      const allowed: readonly TipoConta[] = [TipoConta.PESSOA_FISICA, TipoConta.MECANICO, TipoConta.DISTRIBUIDOR]
      if (allowed.includes(tipoContaParam as TipoConta)) {
        where.tipoConta = tipoContaParam as TipoConta
      }
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              inscricoesCurso: true,
              tentativasQuiz: true,
            },
          },
          pontosUsuario: {
            select: {
              pontos: true,
            },
            take: 1,
            orderBy: { createdAt: "desc" },
          },
        },
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    return NextResponse.json(
      { error: "Erro ao buscar usuários" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/users
 * Cria um novo usuário
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const json = await request.json()
    let parsed
    try {
      parsed = createUserSchema.parse(json)
    } catch (e: any) {
      if (e.errors) {
        return NextResponse.json(
          { error: "Dados inválidos", detalhes: e.errors },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: "Payload inválido" },
        { status: 400 }
      )
    }

    const { name, email, password, role, tipoConta, cnpj } = parsed

    // Regra: se tipoConta for MECANICO ou DISTRIBUIDOR, CNPJ é obrigatório e válido
    const precisaCNPJ = tipoConta === 'MECANICO' || tipoConta === 'DISTRIBUIDOR'
    if (precisaCNPJ) {
      if (!cnpj || !validarCNPJ(cnpj)) {
        return NextResponse.json(
          { error: "CNPJ obrigatório e inválido para o tipo de conta selecionado." },
          { status: 400 }
        )
      }
    }

    // Verificar duplicação
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { error: "Usuário já existe com este email" },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        role: (role as Role | undefined) ?? Role.STUDENT,
        tipoConta: (tipoConta as TipoConta | undefined) ?? TipoConta.PESSOA_FISICA,
        cnpj: precisaCNPJ ? cnpj : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        tipoConta: true,
        cnpj: true,
        createdAt: true,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error: any) {
    console.error("Erro ao criar usuário:", error)
    return NextResponse.json(
      { error: "Erro ao criar usuário" },
      { status: 500 }
    )
  }
}