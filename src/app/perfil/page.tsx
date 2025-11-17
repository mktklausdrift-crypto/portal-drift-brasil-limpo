"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { validarCNPJ } from "@/lib/validacao-cnpj";

export const dynamic = 'force-dynamic';

export default function PerfilPage() {
  const { data: session, status } = useSession();
  const [tipoConta, setTipoConta] = useState<string>(session?.user?.tipoConta || "PESSOA_FISICA");
  const [cnpj, setCnpj] = useState<string>(session?.user?.cnpj || "");
  const [saving, setSaving] = useState(false);
  const precisaCNPJ = tipoConta === 'MECANICO' || tipoConta === 'DISTRIBUIDOR';

  useEffect(() => {
    if (session?.user) {
      setTipoConta(session.user.tipoConta || 'PESSOA_FISICA');
      setCnpj(session.user.cnpj || '');
    }
  }, [session]);

  const formatCNPJ = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0,14);
    const parts = [] as string[];
    if (digits.length > 2) parts.push(digits.slice(0,2));
    if (digits.length > 5) parts.push(digits.slice(2,5));
    if (digits.length > 8) parts.push(digits.slice(5,8));
    if (digits.length > 12) parts.push(digits.slice(8,12));
    const suffix = digits.length > 12 ? digits.slice(12,14) : digits.slice(8);
    if (digits.length <= 8) {
      return digits.length <=2 ? digits : `${digits.slice(0,2)}.${digits.slice(2,5)}${digits.length>5?'.'+digits.slice(5):''}`;
    }
    return `${digits.slice(0,2)}.${digits.slice(2,5)}.${digits.slice(5,8)}/${digits.slice(8,12)}-${digits.slice(12,14)}`;
  };

  const handleSave = async () => {
    if (!session?.user?.id) {
      toast.error('Necessário estar logado.');
      return;
    }
    if (precisaCNPJ) {
      if (!cnpj) {
        toast.error('CNPJ obrigatório.');
        return;
      }
      if (!validarCNPJ(cnpj)) {
        toast.error('CNPJ inválido.');
        return;
      }
    }
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipoConta, cnpj })
      });
      if (!res.ok) throw new Error('Falha ao salvar');
      toast.success('Perfil atualizado.');
    } catch (e:any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-black text-primary mb-8 text-center">Perfil</h1>
      {status === 'loading' && <p className="text-center text-gray-600">Carregando sessão...</p>}
      {status === 'unauthenticated' && <p className="text-center text-gray-600">Faça login para editar seu perfil.</p>}
      {status === 'authenticated' && (
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Conta</label>
            <select
              value={tipoConta}
              onChange={(e) => setTipoConta(e.target.value)}
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
                value={formatCNPJ(cnpj)}
                onChange={(e) => setCnpj(e.target.value)}
                placeholder="00.000.000/0000-00"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary"
              />
              {cnpj && !validarCNPJ(cnpj) && (
                <p className="text-xs text-red-600 mt-1">CNPJ inválido</p>
              )}
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 rounded-md bg-primary text-white font-semibold hover:bg-red-700 disabled:opacity-60"
          >
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      )}
    </div>
  );
}