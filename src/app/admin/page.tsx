export const dynamic = 'force-dynamic';
import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function AdminHome() {
  // Buscar estatísticas do banco
  const [totalPosts, totalUsers, totalCursos, totalCategorias, totalProdutos] = await Promise.all([
    prisma.post.count(),
    prisma.user.count(),
    prisma.curso.count().catch(() => 0),
    prisma.category.count(),
    prisma.produto.count().catch(() => 0),
  ]);

  const stats = [
    { title: "Usuários Ativos", value: totalUsers, icon: "👥", color: "bg-blue-500", href: "/admin/users" },
    { title: "Produtos Cadastrados", value: totalProdutos, icon: "🔧", color: "bg-green-500", href: "/admin/catalogo" },
    { title: "Cursos Disponíveis", value: totalCursos, icon: "🎓", color: "bg-purple-500", href: "/admin/cursos" },
    { title: "Categorias", value: totalCategorias, icon: "📁", color: "bg-orange-500", href: "/admin/noticias" },
  ];

  return (
    <div className="space-y-8">
      {/* Header com informações importantes */}
      <div className="bg-gradient-to-r from-primary to-red-600 text-white rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-2">Klaus Drift Brasil - Admin</h1>
        <p className="text-lg opacity-90">Sistema Industrial de Autopeças Originais - Painel Administrativo Completo</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">✅ Gamificação Ativa</span>
          <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">🧠 Quizzes Funcionando</span>
          <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">🔔 Notificações Online</span>
          <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">📹 Upload Inteligente</span>
        </div>
      </div>

      {/* Estatísticas Principais */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">📊 Estatísticas do Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Link key={index} href={stat.href} className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-all duration-200 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-800 group-hover:text-primary transition-colors">{stat.value}</p>
                </div>
                <div className={`${stat.color} w-14 h-14 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Gestão Principal */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">🚀 Gestão Principal</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin/catalogo" className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-primary group">
            <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">🔧</span>
            <span className="font-bold text-xl text-gray-800 mb-2">Catálogo de Peças Originais</span>
            <span className="text-sm text-gray-500 text-center">Gerenciar peças de reposição OEM, importação e aplicações veiculares</span>
            <div className="mt-3 flex gap-2">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Peças OEM</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Especificação Original</span>
            </div>
          </Link>

          <Link href="/admin/cursos" className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-primary group">
            <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">🎓</span>
            <span className="font-bold text-xl text-gray-800 mb-2">Sistema de Cursos</span>
            <span className="text-sm text-gray-500 text-center">Cursos, módulos, aulas e sistema de progresso</span>
            <div className="mt-3 flex gap-2">
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">Tracking Progresso</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Certificados</span>
            </div>
          </Link>

          <Link href="/admin/quizzes" className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-primary group">
            <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">🧠</span>
            <span className="font-bold text-xl text-gray-800 mb-2">Sistema de Quizzes</span>
            <span className="text-sm text-gray-500 text-center">Criar quizzes, questões e acompanhar tentativas</span>
            <div className="mt-3 flex gap-2">
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Múltipla Escolha</span>
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Histórico</span>
            </div>
          </Link>

          <Link href="/admin/users" className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-primary group">
            <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">👥</span>
            <span className="font-bold text-xl text-gray-800 mb-2">Gestão de Usuários</span>
            <span className="text-sm text-gray-500 text-center">Usuários, permissões e gamificação</span>
            <div className="mt-3 flex gap-2">
              <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs">Roles</span>
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">Pontos</span>
            </div>
          </Link>

          <Link href="/admin/analytics" className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-primary group">
            <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">📊</span>
            <span className="font-bold text-xl text-gray-800 mb-2">Analytics Avançado</span>
            <span className="text-sm text-gray-500 text-center">Métricas, tracking e relatórios detalhados</span>
            <div className="mt-3 flex gap-2">
              <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded text-xs">Tracking</span>
              <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded text-xs">Relatórios</span>
            </div>
          </Link>

          <Link href="/admin/noticias" className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-primary group">
            <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">📰</span>
            <span className="font-bold text-xl text-gray-800 mb-2">Gestão de Notícias</span>
            <span className="text-sm text-gray-500 text-center">Criar, editar e publicar notícias</span>
            <div className="mt-3 flex gap-2">
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">Editor Rich</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">SEO</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Funcionalidades Inovadoras */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">🎯 Funcionalidades Inovadoras</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-xl shadow-md p-6 flex flex-col items-center">
            <span className="text-5xl mb-3">🎮</span>
            <span className="font-bold text-lg">Gamificação Ativa</span>
            <span className="text-sm opacity-90 mt-1 text-center">Pontos, conquistas e badges automáticos</span>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl shadow-md p-6 flex flex-col items-center">
            <span className="text-5xl mb-3">🔔</span>
            <span className="font-bold text-lg">Notificações Smart</span>
            <span className="text-sm opacity-90 mt-1 text-center">Sistema inteligente de notificações</span>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-teal-600 text-white rounded-xl shadow-md p-6 flex flex-col items-center">
            <span className="text-5xl mb-3">📹</span>
            <span className="font-bold text-lg">Upload Inteligente</span>
            <span className="text-sm opacity-90 mt-1 text-center">Compressão automática de vídeos</span>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-red-600 text-white rounded-xl shadow-md p-6 flex flex-col items-center">
            <span className="text-5xl mb-3">🤖</span>
            <span className="font-bold text-lg">IA Integrada</span>
            <span className="text-sm opacity-90 mt-1 text-center">Análise inteligente de conteúdo</span>
          </div>
        </div>
      </div>

      {/* Ferramentas de Desenvolvimento */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">🔧 Ferramentas de Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a href="http://localhost:5555" target="_blank" className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center hover:shadow-lg transition border border-gray-200 hover:border-primary group">
            <span className="text-4xl mb-3 group-hover:scale-110 transition">🛠️</span>
            <span className="font-bold text-lg text-gray-800">Prisma Studio</span>
            <span className="text-sm text-gray-500 mt-1 text-center">Gerenciar banco de dados</span>
            <span className="text-xs text-green-600 mt-2">localhost:5555</span>
          </a>

          <Link href="/admin/analytics/tracking" className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center hover:shadow-lg transition border border-gray-200 hover:border-primary group">
            <span className="text-4xl mb-3 group-hover:scale-110 transition">📍</span>
            <span className="font-bold text-lg text-gray-800">Tracking Center</span>
            <span className="text-sm text-gray-500 mt-1 text-center">Central de rastreamento</span>
          </Link>

          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center border border-gray-200">
            <span className="text-4xl mb-3">⚡</span>
            <span className="font-bold text-lg text-gray-800">Sistema Online</span>
            <span className="text-sm text-gray-500 mt-1 text-center">Todas as funcionalidades ativas</span>
            <span className="text-xs text-green-600 mt-2">✅ Operacional</span>
          </div>
        </div>
      </div>

      {/* Informações Técnicas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>ℹ️</span>
            Informações do Sistema
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• <strong>Versão:</strong> Klaus Drift Brasil v2.0.0</li>
            <li>• <strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')}</li>
            <li>• <strong>Framework:</strong> Next.js 15.5.5</li>
            <li>• <strong>Banco:</strong> PostgreSQL + Prisma ORM</li>
            <li>• <strong>Auth:</strong> NextAuth.js v4</li>
            <li>• <strong>Especialização:</strong> Peças Originais OEM</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>🚀</span>
            Funcionalidades Ativas
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• <span className="text-green-600">✅</span> Sistema de Gamificação</li>
            <li>• <span className="text-green-600">✅</span> Quizzes Interativos</li>
            <li>• <span className="text-green-600">✅</span> Notificações em Tempo Real</li>
            <li>• <span className="text-green-600">✅</span> Upload Inteligente de Vídeos</li>
            <li>• <span className="text-green-600">✅</span> Catálogo Klaus Drift Integrado</li>
            <li>• <span className="text-green-600">✅</span> Sistema de Aplicações Veiculares</li>
            <li>• <span className="text-green-600">✅</span> Analytics Avançado</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
