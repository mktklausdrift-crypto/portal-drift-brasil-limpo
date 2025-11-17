'use client'

import React, { useEffect, useState, useCallback } from 'react'
import FileUploader, { UploadedFile } from '@/components/upload/FileUploader'
import type { AulaMaterial } from '@/types/aulaMaterial'
import { Trash2, Download } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  aulaId: string
}

export default function MaterialsManager({ aulaId }: Props) {
  const [loading, setLoading] = useState(true)
  const [materiais, setMateriais] = useState<AulaMaterial[]>([])
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set())

  const fetchMateriais = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/aulas/${aulaId}/materiais`, { cache: 'no-store' })
      const data = await res.json()
      setMateriais(data.materiais || [])
    } catch (e) {
      console.error(e)
      toast.error('Falha ao carregar materiais')
    } finally {
      setLoading(false)
    }
  }, [aulaId])

  useEffect(() => {
    fetchMateriais()
  }, [fetchMateriais])

  const onUploadComplete = async (files: UploadedFile[]) => {
    try {
      const payload = {
        files: files.map(f => ({
          originalName: f.originalName,
          fileName: f.fileName,
          url: f.url,
          size: f.size,
          mimeType: f.type
        }))
      }
      const res = await fetch(`/api/admin/aulas/${aulaId}/materiais`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Falha ao associar materiais')
      }
      toast.success('Materiais associados à aula')
      fetchMateriais()
    } catch (e: any) {
      console.error(e)
      toast.error(e.message || 'Erro ao salvar materiais')
    }
  }

  const removeMaterial = async (materialId: string) => {
    try {
      setBusyIds(prev => new Set(prev).add(materialId))
      const res = await fetch(`/api/admin/aulas/${aulaId}/materiais/${materialId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Falha ao remover material')
      }
      toast.success('Material removido')
      setMateriais(prev => prev.filter(m => m.id !== materialId))
    } catch (e: any) {
      console.error(e)
      toast.error(e.message || 'Erro ao remover material')
    } finally {
      setBusyIds(prev => {
        const n = new Set(prev)
        n.delete(materialId)
        return n
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Adicionar materiais à aula</h2>
        <p className="text-sm text-gray-500 mb-3">Envie arquivos e eles serão associados automaticamente a esta aula.</p>
        <FileUploader onUploadComplete={onUploadComplete} />
      </div>

      <div>
        <h3 className="text-md font-semibold text-gray-800">Materiais associados</h3>
        {loading ? (
          <p className="text-sm text-gray-500 mt-2">Carregando...</p>
        ) : materiais.length === 0 ? (
          <p className="text-sm text-gray-500 mt-2">Nenhum material cadastrado.</p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-200 border rounded-lg">
            {materiais.map((m) => (
              <li key={m.id} className="flex items-center justify-between p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{m.originalName}</p>
                  <p className="text-xs text-gray-500">{m.mimeType} • {(m.size/1024).toFixed(1)} KB</p>
                </div>
                <div className="flex items-center gap-2">
                  <a href={m.url} target="_blank" rel="noopener noreferrer" className="px-2 py-1 text-xs rounded bg-blue-50 text-blue-600 hover:bg-blue-100 inline-flex items-center gap-1">
                    <Download className="w-4 h-4" /> Abrir
                  </a>
                  <button onClick={() => removeMaterial(m.id)} disabled={busyIds.has(m.id)} className="px-2 py-1 text-xs rounded bg-red-50 text-red-600 hover:bg-red-100 inline-flex items-center gap-1 disabled:opacity-50">
                    <Trash2 className="w-4 h-4" /> Remover
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
