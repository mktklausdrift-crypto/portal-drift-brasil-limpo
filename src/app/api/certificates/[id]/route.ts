import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import QRCode from "qrcode"
import { renderToBuffer } from "@react-pdf/renderer"
import { CertificadoPDF } from "@/components/certificates/CertificadoPDF"

/**
 * GET /api/certificates/[id]
 * Gera e retorna o certificado em PDF
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    const { id: cursoId } = await params

    // Verifica se o usuário concluiu o curso
    const inscricao = await prisma.inscricaoCurso.findUnique({
      where: {
        usuarioId_cursoId: {
          usuarioId: session.user.id,
          cursoId
        }
      },
      include: {
        curso: true,
        usuario: true
      }
    })

    if (!inscricao) {
      return NextResponse.json(
        { error: "Inscrição não encontrada" },
        { status: 404 }
      )
    }

    if (!inscricao.concluido) {
      return NextResponse.json(
        { error: "Curso não concluído. Complete todas as aulas para gerar o certificado." },
        { status: 400 }
      )
    }

    // Busca ou cria certificado
    let certificado = await prisma.certificado.findUnique({
      where: {
        usuarioId_cursoId: {
          usuarioId: session.user.id,
          cursoId
        }
      }
    })

    if (!certificado) {
      // Cria novo certificado
      const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`

      certificado = await prisma.certificado.create({
        data: {
          usuarioId: session.user.id,
          cursoId,
          codigoVerificacao: certificateId,
          dataEmissao: new Date()
        }
      })
    }

    // Gera QR Code com URL de verificação
    const verificationUrl = `${process.env.NEXTAUTH_URL}/certificados/verificar/${certificado.codigoVerificacao}`
    const qrCodeDataURL = await QRCode.toDataURL(verificationUrl, {
      width: 200,
      margin: 1
    })

    // Formata data
    const dataEmissao = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).format(new Date(certificado.dataEmissao))

    // Gera PDF
    const pdfBuffer = await renderToBuffer(
      CertificadoPDF({
        studentName: inscricao.usuario.name || "Aluno",
        courseName: inscricao.curso.titulo,
        courseWorkload: inscricao.curso.cargaHoraria,
        completionDate: dataEmissao,
        certificateId: certificado.codigoVerificacao,
        qrCodeDataURL
      })
    )

    // Retorna PDF
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificado-${inscricao.curso.titulo.replace(/\s/g, "-")}.pdf"`
      }
    })
  } catch (error) {
    console.error("Erro ao gerar certificado:", error)
    return NextResponse.json(
      { error: "Erro ao gerar certificado" },
      { status: 500 }
    )
  }
}
