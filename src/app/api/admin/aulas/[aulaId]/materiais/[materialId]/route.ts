import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireInstructorOrAdmin } from '@/lib/auth-middleware'

// DELETE /api/admin/aulas/[aulaId]/materiais/[materialId]
// Remove associação e metadados do material da aula. (Arquivo físico permanece para reciclagem futura; implementar limpeza em job.)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ aulaId: string, materialId: string }> }
) {
  try {
    const session = await requireInstructorOrAdmin()
    if (session instanceof NextResponse) return session

    const { aulaId, materialId } = await params

    const material = await prisma.aulaMaterial.findFirst({
      where: { id: materialId, aulaId }
    })

    if (!material) {
      return NextResponse.json({ error: 'Material não encontrado para esta aula' }, { status: 404 })
    }

    await prisma.aulaMaterial.delete({ where: { id: material.id } })

    return NextResponse.json({ success: true, removedId: material.id })
  } catch (error: any) {
    console.error('Erro ao remover material da aula:', error)
    return NextResponse.json({ error: 'Erro ao remover material' }, { status: 500 })
  }
}
