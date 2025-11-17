"use client"

import { useState } from "react"
import toast from "react-hot-toast"

interface CertificadoButtonProps {
  inscricaoId: string
  cursoTitulo: string
  disabled?: boolean
}

export default function CertificadoButton({ inscricaoId, cursoTitulo, disabled }: CertificadoButtonProps) {
  const [baixando, setBaixando] = useState(false)

  const baixarCertificado = async () => {
    if (disabled) {
      toast.error("Conclua 100% do curso para baixar o certificado")
      return
    }

    setBaixando(true)
    try {
      const res = await fetch(`/api/certificates/${inscricaoId}`)
      
      if (!res.ok) {
        throw new Error('Erro ao gerar certificado')
      }

      // Download do PDF
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `certificado-${cursoTitulo.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast.success('Certificado baixado com sucesso!')
    } catch {
      toast.error('Erro ao baixar certificado')
    } finally {
      setBaixando(false)
    }
  }

  return (
    <button
      onClick={baixarCertificado}
      disabled={disabled || baixando}
      className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
        disabled
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700 shadow-lg'
      }`}
      title={disabled ? 'Complete o curso para desbloquear' : 'Baixar certificado'}
    >
      <span className="text-xl">🏆</span>
      <span>
        {baixando ? 'Gerando...' : disabled ? 'Certificado Bloqueado' : 'Baixar Certificado'}
      </span>
    </button>
  )
}
