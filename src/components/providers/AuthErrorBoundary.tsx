"use client"

import { Component, ReactNode } from "react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Ignorar erros do NextAuth durante desenvolvimento
    if (
      error.message?.includes("CLIENT_FETCH_ERROR") ||
      error.message?.includes("fetch failed")
    ) {
      return { hasError: false }
    }
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log apenas erros relevantes
    if (
      !error.message?.includes("CLIENT_FETCH_ERROR") &&
      !error.message?.includes("fetch failed")
    ) {
      console.error("Erro de autenticação:", error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Erro de Autenticação
            </h2>
            <p className="text-gray-700 mb-4">
              Ocorreu um erro ao carregar a autenticação. Tente recarregar a página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
