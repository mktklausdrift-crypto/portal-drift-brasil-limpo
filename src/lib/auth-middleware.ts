import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export type Role = "ADMIN" | "INSTRUCTOR" | "STUDENT"

/**
 * Verifica se o usuário tem a role necessária
 * Retorna a sessão se autorizado, ou NextResponse de erro
 */
export async function requireRole(allowedRoles: Role[]) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json(
      { error: "Não autenticado. Faça login para continuar." },
      { status: 401 }
    )
  }

  const userRole = session.user.role

  if (!allowedRoles.includes(userRole)) {
    return NextResponse.json(
      { error: "Acesso negado. Você não tem permissão para esta ação." },
      { status: 403 }
    )
  }

  return session
}

/**
 * Verifica se o usuário é admin
 */
export async function requireAdmin() {
  return requireRole(["ADMIN"])
}

/**
 * Verifica se o usuário é admin ou instrutor
 */
export async function requireInstructorOrAdmin() {
  return requireRole(["ADMIN", "INSTRUCTOR"])
}

/**
 * Pega a sessão do usuário autenticado
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user || null
}

/**
 * Verifica se o usuário está inscrito em um curso específico
 */
export async function requireEnrollment(cursoId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Não autenticado. Faça login para continuar." },
      { status: 401 }
    )
  }

  const inscricao = await prisma.inscricaoCurso.findUnique({
    where: {
      usuarioId_cursoId: {
        usuarioId: session.user.id,
        cursoId: cursoId
      }
    }
  })

  if (!inscricao) {
    return NextResponse.json(
      { error: "Você não está inscrito neste curso." },
      { status: 403 }
    )
  }

  return session
}
