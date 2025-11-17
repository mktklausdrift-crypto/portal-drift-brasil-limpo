export const dynamic = 'force-dynamic';
import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function CatalogoOverviewPage() {
  // Buscar estatísticas do catálogo
  const [
    totalProdutos,
    totalMontadoras,
    totalModelos,
    totalAplicacoes,
    produtosRecentes,
    produtosSemAplicacao
  ] = await Promise.all([
    prisma.produto.count(),
    prisma.montadora.count(),
    prisma.modeloVeiculo.count(),
    prisma.aplicacao.count(),
    prisma.produto.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        codigo: true,
        nome: true,
        categoria: true,
        preco: true,
        estoque: true,
        createdAt: true
      }
    }),
    prisma.produto.count({
      where: {
        aplicacoes: {
          none: {}
        }
      }
    })
  ]);

  const estatisticas = [
    {
      titulo: "Total de Produtos",
      valor: totalProdutos,
      icone: "📦",
      cor: "bg-blue-500",
      link: "/admin/produtos"
    },
    {
      titulo: "Montadoras",
      valor: totalMontadoras,
      icone: "🏭",
      cor: "bg-green-500",
      link: "/admin/montadoras"
    },
    {
      titulo: "Modelos de Veículos",
      valor: totalModelos,
      icone: "🚗",
      cor: "bg-purple-500",
      link: "/admin/modelos"
    },
    {
      titulo: "Aplicações Cadastradas",
      valor: totalAplicacoes,
      icone: "🔗",
      cor: "bg-orange-500",
      link: "#aplicacoes"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Catálogo de Peças</h1>
          <p className="text-gray-600 mt-2">
            Gerencie produtos, montadoras, modelos e aplicações em veículos
          </p>
        </div>
        <Link
          href="/admin/produtos/novo"
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-bold shadow-lg"
        >
          + Novo Produto
        </Link>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {estatisticas.map((stat) => (
          <Link
            key={stat.titulo}
            href={stat.link}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.titulo}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.valor}</p>
              </div>
              <div className={`${stat.cor} w-16 h-16 rounded-full flex items-center justify-center text-3xl group-hover:scale-110 transition`}>
                {stat.icone}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Alertas */}
      {produtosSemAplicacao > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Atenção: Produtos sem aplicação
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                Existem <strong>{produtosSemAplicacao} produtos</strong> sem nenhuma aplicação em veículos cadastrada.
                <Link href="/admin/produtos" className="ml-2 underline font-medium">
                  Ver produtos →
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Ações Rápidas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">⚡ Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/produtos/novo"
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition group"
          >
            <span className="text-2xl group-hover:scale-110 transition">➕</span>
            <div>
              <p className="font-medium text-gray-900">Adicionar Produto</p>
              <p className="text-xs text-gray-500">Cadastrar nova peça</p>
            </div>
          </Link>

          <Link
            href="/admin/montadoras"
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition group"
          >
            <span className="text-2xl group-hover:scale-110 transition">🏭</span>
            <div>
              <p className="font-medium text-gray-900">Gerenciar Montadoras</p>
              <p className="text-xs text-gray-500">Fabricantes de veículos</p>
            </div>
          </Link>

          <Link
            href="/admin/modelos"
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition group"
          >
            <span className="text-2xl group-hover:scale-110 transition">🚗</span>
            <div>
              <p className="font-medium text-gray-900">Gerenciar Modelos</p>
              <p className="text-xs text-gray-500">Modelos de veículos</p>
            </div>
          </Link>

          <Link
            href="/pecas"
            target="_blank"
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition group"
          >
            <span className="text-2xl group-hover:scale-110 transition">👁️</span>
            <div>
              <p className="font-medium text-gray-900">Ver Catálogo Público</p>
              <p className="text-xs text-gray-500">Como o cliente vê</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Produtos Recentes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">📦 Produtos Adicionados Recentemente</h2>
          <Link href="/admin/produtos" className="text-primary hover:underline text-sm font-medium">
            Ver todos →
          </Link>
        </div>
        
        {produtosRecentes.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhum produto cadastrado ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Adicionado em
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {produtosRecentes.map((produto) => (
                  <tr key={produto.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {produto.codigo}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {produto.nome}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {produto.categoria || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {new Date(produto.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/produtos/${produto.id}/editar`}
                        className="text-primary hover:text-primary-dark"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Guia Rápido */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 border border-blue-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📚 Guia Rápido</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">1️⃣ Cadastre Montadoras</h3>
            <p className="text-sm text-gray-600">
              Primeiro, adicione as montadoras (fabricantes de veículos) como Toyota, Honda, Volkswagen, etc.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">2️⃣ Adicione Modelos</h3>
            <p className="text-sm text-gray-600">
              Depois, cadastre os modelos de veículos vinculados a cada montadora (Corolla, Civic, Gol, etc).
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">3️⃣ Cadastre Produtos</h3>
            <p className="text-sm text-gray-600">
              Adicione os produtos (peças) com código, nome, descrição, preço, imagens e especificações.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">4️⃣ Vincule Aplicações</h3>
            <p className="text-sm text-gray-600">
              Na aba "Aplicações em Veículos" de cada produto, vincule em quais modelos a peça se aplica.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
