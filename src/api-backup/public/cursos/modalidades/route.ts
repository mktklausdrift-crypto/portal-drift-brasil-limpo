import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const cursos = await prisma.curso.findMany({
      select: { modalidade: true },
      distinct: ['modalidade']
    })

    const modalidades = cursos.map(c => c.modalidade)

    return NextResponse.json(modalidades)
  } catch (error) {
    console.error("Erro ao buscar modalidades:", error)
    return NextResponse.json({ error: "Erro ao buscar modalidades" }, { status: 500 })
  }
}
