import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Buscar todas as categorias únicas
    const produtos = await prisma.produto.findMany({
      select: {
        categoria: true
      },
      distinct: ['categoria'],
      orderBy: {
        categoria: 'asc'
      }
    })

    // Extrair apenas os nomes das categorias e filtrar vazios
    const categorias = produtos
      .map((p: { categoria: string }) => p.categoria)
      .filter((c: string) => c && c.trim() !== '')
      .sort()

    return NextResponse.json(categorias)
  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar categorias' },
      { status: 500 }
    )
  }
}
