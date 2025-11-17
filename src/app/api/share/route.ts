import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.redirect(new URL('/login?callbackUrl=/share-handler', request.url))
    }

    const formData = await request.formData()
    const title = formData.get('title') as string
    const text = formData.get('text') as string
    const url = formData.get('url') as string
    const files = formData.getAll('media') as File[]

    // Armazenar conteúdo compartilhado em sessão ou banco de dados
    // Por enquanto, redirecionamos para uma página handler

    const params = new URLSearchParams()
    if (title) params.set('title', title)
    if (text) params.set('text', text)
    if (url) params.set('url', url)
    if (files.length > 0) params.set('files', files.length.toString())

    return NextResponse.redirect(
      new URL(`/share-handler?${params.toString()}`, request.url)
    )
  } catch (error) {
    console.error('Share target error:', error)
    return NextResponse.redirect(new URL('/error', request.url))
  }
}
