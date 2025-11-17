// BACKUP da homepage original - pode ser restaurado depois
import prisma from "@/lib/prisma";
import Link from "next/link";
import type { Post, Produto, Curso, User, Category, PostsOnCategories } from "@prisma/client";

type PostWithRelations = Post & {
  author: Pick<User, 'name'>;
  categories: (PostsOnCategories & { category: Category })[];
};

export default async function HomePage() {
  // Buscar conteúdo em destaque com tratamento de erro
  let noticiasDestaque: PostWithRelations[] = [];
  let produtosDestaque: Produto[] = [];
  let cursosDestaque: Curso[] = [];

  try {
    [noticiasDestaque, produtosDestaque, cursosDestaque] = await Promise.all([
      prisma.post.findMany({
        where: { published: true },
        include: {
          author: { select: { name: true } },
          categories: { include: { category: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      }).catch(() => []),
      prisma.produto.findMany({
        where: { destaque: true },
        orderBy: { createdAt: "desc" },
        take: 4,
      }).catch(() => []),
      prisma.curso.findMany({
        where: { inscricoesAbertas: true },
        orderBy: { createdAt: "desc" },
        take: 3,
      }).catch(() => []),
    ]);
  } catch (error) {
    console.error("Erro ao carregar dados da homepage:", error);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-black text-primary">
              Portal Drift Brasil
            </Link>
            <nav className="flex gap-6">
              <Link href="/noticias" className="text-gray-700 hover:text-primary font-medium transition">
                Notícias
              </Link>
              <Link href="/produtos" className="text-gray-700 hover:text-primary font-medium transition">
                Produtos
              </Link>
              <Link href="/cursos" className="text-gray-700 hover:text-primary font-medium transition">
                Cursos
              </Link>
              <Link href="/forum" className="text-gray-700 hover:text-primary font-medium transition">
                Fórum
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-6xl font-black mb-6 leading-tight">
              Portal Drift Brasil
            </h1>
            <p className="text-2xl text-white/90 mb-8">
              Notícias, cursos, produtos e comunidade sobre drift e automobilismo
            </p>
            <div className="flex gap-4">
              <Link
                href="/noticias"
                className="px-8 py-4 bg-white text-primary rounded-lg hover:bg-gray-100 transition font-bold text-lg"
              >
                Ver Notícias
              </Link>
              <Link
                href="/cursos"
                className="px-8 py-4 bg-primary/20 backdrop-blur-sm text-white border-2 border-white rounded-lg hover:bg-primary/30 transition font-bold text-lg"
              >
                Nossos Cursos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Rest of the content... */}
    </div>
  );
}
