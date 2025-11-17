"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Product {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  destaque: boolean;
  createdAt: string;
}

export default function ProdutosAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [busca, setBusca] = useState("");
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [justDeleted, setJustDeleted] = useState(false);

  useEffect(() => {
    if (!justDeleted) {
      fetchProducts();
    }
    setJustDeleted(false);
  }, [page, limit]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
  const res = await fetch(`/api/admin/produtos?page=${page}&limit=${limit}${busca ? `&busca=${encodeURIComponent(busca)}` : ""}`, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache'
    }
  });
      const data = await res.json();
      setProducts(data.products || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    // Marca como deletando para desabilitar botão
    setDeletingIds(prev => new Set(prev).add(id));
    setJustDeleted(true); // Previne recarregamento automático

    try {
      const res = await fetch(`/api/admin/produtos/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        // Remove imediatamente da lista (UI otimista)
        console.log(`🗑️ Removendo produto ${id} da lista...`);
        setProducts(prev => {
          const filtered = prev.filter(p => p.id !== id);
          console.log(`✅ Lista atualizada. Produtos restantes: ${filtered.length}`);
          return filtered;
        });
        
        // Timeout para garantir que o estado é atualizado antes do alert
        setTimeout(() => {
          alert("✅ Produto excluído com sucesso!");
        }, 100);
      } else {
        // Exibir mensagem de erro específica da API
        const errorMessage = data.error || "Erro ao excluir produto";
        alert(`❌ ${errorMessage}`);
        console.error("Erro ao excluir:", data);
        setJustDeleted(false); // Permite recarregamento em caso de erro
      }
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      alert("❌ Erro de comunicação com o servidor. Verifique sua conexão.");
      setJustDeleted(false); // Permite recarregamento em caso de erro
    } finally {
      // Remove do conjunto de deletando
      setDeletingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const toggleDestaque = async (product: Product) => {
    try {
      const res = await fetch(`/api/admin/produtos/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...product,
          destaque: !product.destaque,
        }),
      });

      if (res.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error("Erro ao atualizar destaque:", error);
    }
  };


  // Atualiza busca em tempo real
  useEffect(() => {
    setJustDeleted(false); // Permite recarregamento ao buscar
    if (page === 1) {
      fetchProducts();
    } else {
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Carregando produtos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Gerenciar Produtos</h1>
        <div className="flex flex-1 gap-3 items-center justify-end flex-wrap">
          {/* Seletor de itens por página */}
          <div className="flex items-center gap-2">
            <label htmlFor="itemsPerPage" className="text-sm text-gray-600 whitespace-nowrap">
              Itens:
            </label>
            <select
              id="itemsPerPage"
              value={limit}
              onChange={(e) => {
                setLimit(parseInt(e.target.value));
                setPage(1); // Reset para primeira página
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome, código ou categoria..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent w-64"
          />
          <Link
            href="/admin/produtos/novo"
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-semibold whitespace-nowrap"
          >
            + Novo Produto
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-200">
          <p className="text-gray-600 text-lg mb-4">Nenhum produto cadastrado ainda.</p>
          <Link
            href="/admin/produtos/novo"
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-semibold"
          >
            Criar primeiro produto
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nome</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Categoria</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Preço</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Destaque</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{product.nome}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {product.descricao.substring(0, 60)}...
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.categoria}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      R$ {product.preco.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleDestaque(product)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          product.destaque
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {product.destaque ? "⭐ Destaque" : "Normal"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/admin/produtos/${product.id}/editar`}
                        className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm font-medium"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingIds.has(product.id)}
                        className={`px-4 py-2 rounded transition text-sm font-medium ${
                          deletingIds.has(product.id)
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-red-500 text-white hover:bg-red-600"
                        }`}
                      >
                        {deletingIds.has(product.id) ? "Excluindo..." : "Excluir"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 space-y-4">
              {/* Informações de paginação */}
              <div className="text-center text-gray-600">
                Mostrando {Math.min((page - 1) * limit + 1, total)} a {Math.min(page * limit, total)} de {total} produtos
              </div>

              {/* Controles de paginação */}
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {/* Ir para primeira página */}
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
                  title="Primeira página"
                >
                  ««
                </button>

                {/* Página anterior */}
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Anterior
                </button>

                {/* Páginas numeradas - mostrar contexto ao redor da página atual */}
                <div className="flex gap-1">
                  {page > 3 && (
                    <>
                      <button
                        onClick={() => setPage(1)}
                        className="px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition text-sm"
                      >
                        1
                      </button>
                      {page > 4 && <span className="px-2 py-2">...</span>}
                    </>
                  )}

                  {[...Array(5)].map((_, i) => {
                    const pageNum = page - 2 + i;
                    if (pageNum < 1 || pageNum > totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-2 rounded transition text-sm font-medium ${
                          pageNum === page
                            ? "bg-blue-500 text-white"
                            : "bg-white border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {page < totalPages - 2 && (
                    <>
                      {page < totalPages - 3 && <span className="px-2 py-2">...</span>}
                      <button
                        onClick={() => setPage(totalPages)}
                        className="px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition text-sm"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                {/* Próxima página */}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Próxima
                </button>

                {/* Ir para última página */}
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className="px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
                  title="Última página"
                >
                  »»
                </button>
              </div>

              {/* Campo para ir direto para uma página */}
              <div className="flex items-center justify-center gap-2">
                <label htmlFor="gotoPage" className="text-sm text-gray-600">
                  Ir para página:
                </label>
                <input
                  id="gotoPage"
                  type="number"
                  min="1"
                  max={totalPages}
                  placeholder={page.toString()}
                  className="w-20 px-3 py-1 border border-gray-300 rounded text-center"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const value = parseInt((e.target as HTMLInputElement).value);
                      if (value >= 1 && value <= totalPages) {
                        setPage(value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
                <span className="text-sm text-gray-500">de {totalPages}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
