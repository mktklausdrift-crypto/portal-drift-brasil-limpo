"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { validarCNPJ } from "@/lib/validacao-cnpj";
import RequireRole from "@/components/auth/RequireRole";

export default function NovoUsuarioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
    tipoConta: "PESSOA_FISICA",
    cnpj: "",
  });

  const precisaCNPJ = formData.tipoConta === 'MECANICO' || formData.tipoConta === 'DISTRIBUIDOR';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      if (precisaCNPJ) {
        if (!formData.cnpj) {
          toast.error("CNPJ obrigatório para o tipo selecionado");
          setLoading(false);
          return;
        }
        if (!validarCNPJ(formData.cnpj)) {
          toast.error("CNPJ inválido");
          setLoading(false);
          return;
        }
      }
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success('Usuário criado com sucesso!');
        router.push('/admin/users');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Erro ao criar usuário');
      }
    } catch (err) {
      toast.error('Erro inesperado ao criar usuário');
    } finally {
      setLoading(false);
    }
  }

  return (
    <RequireRole roles={['ADMIN']}>
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">Novo Usuário</h1>
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
          <div>
            <label htmlFor="name" className="block font-semibold mb-1">Nome</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="Nome do usuário"
            />
          </div>
          <div>
            <label htmlFor="email" className="block font-semibold mb-1">Email *</label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="email@exemplo.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block font-semibold mb-1">Senha *</label>
            <input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="role" className="block font-semibold mb-1">Papel</label>
              <select
                id="role"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="STUDENT">Estudante</option>
                <option value="INSTRUCTOR">Instrutor</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
            <div>
              <label htmlFor="tipoConta" className="block font-semibold mb-1">Tipo de Conta</label>
              <select
                id="tipoConta"
                value={formData.tipoConta}
                onChange={e => setFormData({ ...formData, tipoConta: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="PESSOA_FISICA">Pessoa Física</option>
                <option value="MECANICO">Mecânico (CNPJ)</option>
                <option value="DISTRIBUIDOR">Distribuidor (CNPJ)</option>
              </select>
            </div>
          </div>
          {precisaCNPJ && (
            <div>
              <label htmlFor="cnpj" className="block font-semibold mb-1">CNPJ *</label>
              <input
                id="cnpj"
                type="text"
                value={formData.cnpj}
                onChange={e => setFormData({ ...formData, cnpj: e.target.value })}
                placeholder="00.000.000/0000-00"
                className="w-full border rounded px-3 py-2"
              />
              {formData.cnpj && !validarCNPJ(formData.cnpj) && (
                <p className="text-xs text-red-600 mt-1">CNPJ inválido</p>
              )}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-primary text-white rounded font-semibold hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Criando...' : 'Criar Usuário'}
          </button>
        </form>
      </div>
    </RequireRole>
  );
}