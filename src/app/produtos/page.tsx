export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Image from "next/image";
import prisma from "@/lib/prisma";

export default async function ProdutosPage() {
  // Buscar produtos do banco de dados
  const produtos = await prisma.produto.findMany({
    orderBy: [
      { destaque: 'desc' },
      { createdAt: 'desc' }
    ],
    take: 100 // Limitar a 100 produtos para performance
  });

  // Extrair categorias únicas dos produtos
  const categoriasSet = new Set<string>();
  categoriasSet.add("Todos");
  produtos.forEach(p => {
    if (p.categoria) categoriasSet.add(p.categoria);
  });
  const categoriasUnicas = Array.from(categoriasSet);

  return (
    <div className="max-w-7xl mx-auto py-16 px-4">
      <h1 className="text-4xl md:text-5xl font-black text-primary mb-10 text-center">Produtos</h1>
      <div className="flex flex-wrap gap-4 justify-center mb-10">
        <div className="text-sm text-gray-500 mb-4">
          Filtros de busca temporariamente indisponíveis no modo estático
        </div>
        {categoriasUnicas.map((cat) => (
          <a
            key={cat}
            href={`/produtos`}
            className={`px-5 py-2 rounded-full font-semibold transition bg-gray-100 text-gray-700 hover:bg-brand-yellow hover:text-black`}
          >
            {cat}
          </a>
        ))}
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {produtos.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 py-16">Nenhum produto encontrado.</div>
        ) : (
          produtos.map((produto) => (
            <div key={produto.id} className={`bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col overflow-hidden hover:shadow-2xl transition-all ${produto.destaque ? "ring-2 ring-brand-yellow" : ""}`}>
              <div className="h-56 w-full bg-gray-200 flex items-center justify-center overflow-hidden relative group">
                {/* Imagem principal */}
                {produto.imagem ? (
                  <Image src={produto.imagem} alt={produto.nome} width={400} height={224} className="object-cover w-full h-full transition-opacity duration-300 group-hover:opacity-60" />
                ) : Array.isArray(produto.imagens) && produto.imagens.length > 0 ? (
                  <Image src={produto.imagens[0]} alt={produto.nome} width={400} height={224} className="object-cover w-full h-full transition-opacity duration-300 group-hover:opacity-60" />
                ) : (
                  <span className="text-6xl">🔧</span>
                )}
                {/* Miniaturas da galeria (hover) */}
                {Array.isArray(produto.imagens) && produto.imagens.length > 0 && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {produto.imagens.slice(0, 4).map((img, idx) => (
                      <Image
                        key={idx}
                        src={img}
                        alt={produto.nome + ' miniatura ' + (idx+1)}
                        width={48}
                        height={48}
                        className="object-cover rounded border border-white shadow w-12 h-12 bg-white"
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col flex-1">
                <span className="text-xs font-bold uppercase text-primary mb-2">{produto.categoria}</span>
                <h2 className="text-xl font-bold mb-2 text-black line-clamp-2">{produto.nome}</h2>
                <p className="text-gray-600 mb-2 line-clamp-3">{produto.descricao}</p>
                <div className="text-xs text-gray-700 mb-1"><b>Código:</b> {produto.codigo || '-'}</div>
                <div className="text-xs text-gray-700 mb-1"><b>Aplicação:</b> {produto.aplicacao || '-'}</div>
                <div className="text-xs text-gray-700 mb-4"><b>Montadora/Modelo:</b> {produto.montadora || '-'}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
