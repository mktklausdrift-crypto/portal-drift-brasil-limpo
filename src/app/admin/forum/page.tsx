import prisma from "@/lib/prisma";
import Link from "next/link";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminForumPage() {
  const topicos = await prisma.topicoForum.findMany({
    select: {
      id: true,
      titulo: true,
      categoria: true,
      conteudo: true,
      createdAt: true,
      updatedAt: true,
      autor: {
        select: {
          name: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">Gerenciar Tópicos do Fórum</h2>
        <Link href="/admin/forum/novo" className="px-4 py-2 rounded bg-primary text-white font-bold hover:bg-primary-hover transition">Novo Tópico</Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Título</th>
              <th className="px-4 py-2 text-left">Categoria</th>
              <th className="px-4 py-2 text-left">Autor</th>
              <th className="px-4 py-2 text-left">Criado em</th>
              <th className="px-4 py-2 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {topicos.map((topico) => (
              <tr key={topico.id} className="border-b">
                <td className="px-4 py-2 font-semibold">{topico.titulo}</td>
                <td className="px-4 py-2">{topico.categoria}</td>
                <td className="px-4 py-2">{topico.autor?.name || "-"}</td>
                <td className="px-4 py-2">{new Date(topico.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2 flex gap-2">
                  <Link href={`/admin/forum/${topico.id}/editar`} className="text-primary font-bold hover:underline">Editar</Link>
                  <Link href={`/admin/forum/${topico.id}/excluir`} className="text-red-600 font-bold hover:underline">Excluir</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
