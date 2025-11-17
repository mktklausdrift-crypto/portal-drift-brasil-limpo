"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

type Role = "ADMIN" | "INSTRUCTOR" | "STUDENT"

interface RequireRoleProps {
  children: React.ReactNode
  roles: Role[]
  fallback?: React.ReactNode
}

export default function RequireRole({ 
  children, 
  roles,
  fallback 
}: RequireRoleProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div 
          className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"
          role="status"
          aria-label="Carregando..."
        ></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (!roles.includes(session.user.role)) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">Acesso Negado</h1>
          <p className="text-gray-600 mb-6">
            Você não tem permissão para acessar esta página.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Voltar para Home
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
