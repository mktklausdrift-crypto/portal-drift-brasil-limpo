import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-middleware'
import { cleanupUploads } from '@/lib/cleanupUploads'

// POST /api/admin/uploads/cleanup  -> executa limpeza de arquivos órfãos
export async function POST(_req: NextRequest) {
  const session = await requireAdmin()
  if (session instanceof NextResponse) return session

  try {
    const report = await cleanupUploads()
    return NextResponse.json({ success: true, report })
  } catch (e: any) {
    console.error('Erro na limpeza de uploads:', e)
    return NextResponse.json({ error: 'Falha ao executar cleanup' }, { status: 500 })
  }
}
