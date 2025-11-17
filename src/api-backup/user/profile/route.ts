import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { validarCNPJ } from "@/lib/validacao-cnpj"

const schema = z.object({
  tipoConta: z.enum(["PESSOA_FISICA", "MECANICO", "DISTRIBUIDOR"]),
  cnpj: z.string().optional()
})

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Payload inválido" }, { status: 400 })

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", detalhes: parsed.error.issues }, { status: 400 })
  }

  const { tipoConta, cnpj } = parsed.data
  const precisaCNPJ = tipoConta === 'MECANICO' || tipoConta === 'DISTRIBUIDOR'
  if (precisaCNPJ) {
    if (!cnpj || !validarCNPJ(cnpj)) {
      return NextResponse.json({ error: "CNPJ obrigatório e inválido" }, { status: 400 })
    }
  }

  try {
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        tipoConta,
        cnpj: precisaCNPJ ? cnpj : null
      },
      select: { id: true, email: true, tipoConta: true, cnpj: true }
    })
    return NextResponse.json(user)
  } catch (e) {
    console.error('Erro ao atualizar perfil:', e)
    return NextResponse.json({ error: "Erro ao atualizar perfil" }, { status: 500 })
  }
}
