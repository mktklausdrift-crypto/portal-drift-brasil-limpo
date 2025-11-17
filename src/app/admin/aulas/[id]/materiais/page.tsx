import React, { use } from 'react'
import MaterialsManager from './MaterialsManager'
import Link from 'next/link'

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Materiais da Aula</h1>
        <p className="text-sm text-gray-600">Associe arquivos a esta aula e gerencie a lista de materiais.</p>
      </div>

      <div className="mb-6">
        <Link href={`/admin`} className="text-sm text-blue-600 hover:underline">← Voltar ao Admin</Link>
      </div>

      <MaterialsManager aulaId={id} />
    </div>
  )
}
