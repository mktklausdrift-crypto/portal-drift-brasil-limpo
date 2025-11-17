"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { validarCNPJ } from "@/lib/validacao-cnpj";

export default function EditarUsuarioPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "STUDENT",
    tipoConta: "PESSOA_FISICA",
    cnpj: "",
  });
  const precisaCNPJ = formData.tipoConta === "MECANICO" || formData.tipoConta === "DISTRIBUIDOR";

  useEffect(() => {
    fetchUsuario();
  }, []);

  async function fetchUsuario() {
    try {
      const res = await fetch(`/api/admin/users/${id}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          name: data.name || "",
          email: data.email || "",
          role: data.role || "STUDENT",
          tipoConta: data.tipoConta || "PESSOA_FISICA",
          cnpj: data.cnpj || "",
        });
      }
    } catch (err) {}
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Usuário atualizado com sucesso!");
        router.push("/admin/users");
      } else {
        const error = await res.json();
        toast.error(error.error || "Erro ao atualizar usuário");
      }
    } catch (err) {
      toast.error("Erro ao atualizar usuário");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Editar Usuário</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block font-semibold mb-1">Nome *</label>
          <input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="w-full border rounded px-3 py-2"
            placeholder="Digite o nome do usuário"
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
            placeholder="Digite o email do usuário"
          />
        </div>
        <div>
          <label htmlFor="role" className="block font-semibold mb-1">Papel</label>
          <select
            id="role"
            value={formData.role}
            onChange={e => setFormData({ ...formData, role: e.target.value })}
            className="w-full border rounded px-3 py-2"
          >
            <option value="ADMIN">Administrador</option>
            <option value="INSTRUCTOR">Instrutor</option>
            <option value="STUDENT">Estudante</option>
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
        {precisaCNPJ && (
          <div>
            <label htmlFor="cnpj" className="block font-semibold mb-1">CNPJ</label>
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
          className="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </div>
  );
}
