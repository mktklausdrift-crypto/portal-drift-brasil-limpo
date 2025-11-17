import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

/**
 * GET /api/certificates/verify/[code]
 * Verifica a autenticidade de um certificado
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params

    const certificado = await prisma.certificado.findUnique({
      where: {
        codigoVerificacao: code
      },
      include: {
        usuario: {
          select: {
            name: true,
            email: true
          }
        },
        curso: {
          select: {
            titulo: true,
            cargaHoraria: true
          }
        }
      }
    })

    if (!certificado) {
      return NextResponse.json(
        { error: "Certificado não encontrado", valid: false },
        { status: 404 }
      )
    }

    return NextResponse.json({
      valid: true,
      certificado: {
        codigo: certificado.codigoVerificacao,
        dataEmissao: certificado.dataEmissao,
        aluno: {
          nome: certificado.usuario.name
        },
        curso: {
          titulo: certificado.curso.titulo,
          cargaHoraria: certificado.curso.cargaHoraria
        }
      }
    })
  } catch (error) {
    console.error("Erro ao verificar certificado:", error)
    return NextResponse.json(
      { error: "Erro ao verificar certificado", valid: false },
      { status: 500 }
    )
  }
}
