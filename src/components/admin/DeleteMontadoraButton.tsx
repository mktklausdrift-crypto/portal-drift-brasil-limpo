'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

interface DeleteMontadoraButtonProps {
  montadoraId: string
  montadoraNome: string
  temModelos: boolean
  onDelete?: () => void
}

export default function DeleteMontadoraButton({
  montadoraId,
  montadoraNome,
  temModelos,
  onDelete
}: DeleteMontadoraButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (temModelos) {
      toast.error('Não é possível excluir montadora que possui modelos cadastrados')
      return
    }

    const confirmed = confirm(
      `Tem certeza que deseja excluir a montadora "${montadoraNome}"? Esta ação não pode ser desfeita.`
    )

    if (!confirmed) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/montadoras/${montadoraId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Montadora excluída com sucesso')
        if (onDelete) {
          onDelete()
        } else {
          // Reload da página se não tiver callback
          window.location.reload()
        }
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erro ao excluir montadora')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro interno. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading || temModelos}
      className={`text-sm ${
        temModelos 
          ? 'text-gray-400 cursor-not-allowed' 
          : 'text-red-600 hover:text-red-800'
      }`}
      title={temModelos ? 'Não é possível excluir montadora com modelos' : 'Excluir montadora'}
    >
      {loading ? 'Excluindo...' : 'Excluir'}
    </button>
  )
}