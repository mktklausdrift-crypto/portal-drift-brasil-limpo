"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import RequireRole from "@/components/auth/RequireRole"

interface User {
  id: string
  name: string | null
  email: string
  role: string
  image: string | null
  createdAt: string
  pontosTotal: number
  tipoConta?: string
  cnpj?: string | null
  _count: {
    inscricoesCurso: number
    tentativasQuiz: number
  }
  pontosUsuario: {
    pontos: number
  }[]
}

export default function UsersAdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("ALL")
  const [tipoContaFilter, setTipoContaFilter] = useState("ALL")
  const router = useRouter()

  useEffect(() => {
    fetchUsers()
  }, [search, roleFilter, tipoContaFilter])

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
  if (roleFilter !== "ALL") params.append("role", roleFilter)
  if (tipoContaFilter !== "ALL") params.append("tipoConta", tipoContaFilter)

      const res = await fetch(`/api/admin/users?${params}`)
      if (!res.ok) throw new Error("Erro ao carregar")
      const data = await res.json()
      setUsers(data.users)
    } catch (error) {
      toast.error("Erro ao carregar usuários")
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })

      if (!res.ok) throw new Error("Erro ao alterar role")

      toast.success("Role alterada com sucesso!")
      fetchUsers()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleDelete = async (userId: string, userEmail: string) => {
    if (!confirm(`Deseja realmente excluir o usuário "${userEmail}"?`)) return

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Erro ao excluir")

      toast.success("Usuário excluído com sucesso!")
      fetchUsers()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800"
      case "INSTRUCTOR":
        return "bg-blue-100 text-blue-800"
      case "STUDENT":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Administrador"
      case "INSTRUCTOR":
        return "Instrutor"
      case "STUDENT":
        return "Aluno"
      default:
        return role
    }
  }

  return (
    <RequireRole roles={["ADMIN"]}>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gerenciar Usuários
              </h1>
              <p className="text-gray-600 mt-1">
                Gerencie usuários, permissões e gamificação
              </p>
            </div>
            <Link
              href="/admin/users/novo"
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-red-700 font-semibold"
            >
              + Novo Usuário
            </Link>
          </div>

          {/* Filtros */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            >
              <option value="ALL">Todas as permissões</option>
              <option value="ADMIN">Administradores</option>
              <option value="INSTRUCTOR">Instrutores</option>
              <option value="STUDENT">Alunos</option>
            </select>
            <select
              value={tipoContaFilter}
              onChange={(e) => setTipoContaFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            >
              <option value="ALL">Todos tipos conta</option>
              <option value="PESSOA_FISICA">Pessoa Física</option>
              <option value="MECANICO">Mecânico</option>
              <option value="DISTRIBUIDOR">Distribuidor</option>
            </select>
          </div>

          {/* Lista */}
          {loading ? (
            <div className="text-center py-12">Carregando...</div>
          ) : users.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500 text-lg">Nenhum usuário encontrado</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuário
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissão</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo Conta</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gamificação
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Atividade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {user.image ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={user.image}
                                alt={user.name || ""}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-gray-600 font-medium">
                                  {(user.name || user.email).charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.name || "Sem nome"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)} border-0 cursor-pointer`}
                          >
                            <option value="STUDENT">Aluno</option>
                            <option value="INSTRUCTOR">Instrutor</option>
                            <option value="ADMIN">Administrador</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {user.tipoConta === 'MECANICO' ? 'Mecânico' : user.tipoConta === 'DISTRIBUIDOR' ? 'Distribuidor' : 'Pessoa Física'}
                          </span>
                          {user.cnpj && (
                            <div className="text-[10px] text-gray-500 mt-1">{user.cnpj}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div className="font-medium">
                              🏆 {Math.floor(user.pontosTotal / 100) + 1}º nível
                            </div>
                            <div className="text-gray-500">
                              {user.pontosTotal} pontos totais
                            </div>
                            {user.pontosUsuario.length > 0 && (
                              <div className="text-xs text-blue-600">
                                +{user.pontosUsuario[0].pontos} recentes
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div>📚 {user._count.inscricoesCurso} cursos</div>
                            <div>🧠 {user._count.tentativasQuiz} quizzes</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <Link
                              href={`/admin/users/${user.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Ver
                            </Link>
                            <Link
                              href={`/admin/users/${user.id}/editar`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Editar
                            </Link>
                            <button
                              onClick={() => handleDelete(user.id, user.email)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </RequireRole>
  )
}