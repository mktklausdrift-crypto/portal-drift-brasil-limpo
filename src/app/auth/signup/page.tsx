"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { validarCNPJ } from "@/lib/validacao-cnpj";

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    tipoConta: "PESSOA_FISICA",
    cnpj: "",
  });

  const precisaCNPJ = form.tipoConta === 'MECANICO' || form.tipoConta === 'DISTRIBUIDOR';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      if (precisaCNPJ) {
        if (!form.cnpj) {
          toast.error("CNPJ é obrigatório para o tipo selecionado");
          setLoading(false);
          return;
        }
        if (!validarCNPJ(form.cnpj)) {
          toast.error("CNPJ inválido");
          setLoading(false);
          return;
        }
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Erro ao criar conta');
        setLoading(false);
        return;
      }

      toast.success('Conta criada! Entrando...');
      await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false
      });
      router.push('/meus-cursos');
    } catch (err) {
      toast.error('Erro inesperado');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Criar Conta</h1>
        <p className="text-gray-600 mb-6">Use a mesma conta para cursos e fórum.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary"
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary"
              placeholder="voce@exemplo.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Conta</label>
            <select
              value={form.tipoConta}
              onChange={(e) => setForm({ ...form, tipoConta: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary"
            >
              <option value="PESSOA_FISICA">Pessoa Física</option>
              <option value="MECANICO">Mecânico (CNPJ)</option>
              <option value="DISTRIBUIDOR">Distribuidor (CNPJ)</option>
            </select>
          </div>
          {precisaCNPJ && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
              <input
                type="text"
                value={form.cnpj}
                onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
                placeholder="00.000.000/0000-00"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary"
              />
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 rounded-md bg-primary text-white font-semibold hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? 'Criando...' : 'Criar Conta'}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600 mt-4">
          Já tem conta?{' '}
          <Link href="/auth/signin" className="text-primary font-semibold hover:underline">Fazer login</Link>
        </div>
      </div>
    </div>
  );
}
