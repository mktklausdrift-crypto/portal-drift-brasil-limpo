"use client";
import { ReactNode, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [catalogoOpen, setCatalogoOpen] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    
    console.log("🔍 AdminLayout - Status:", status);
    console.log("🔍 AdminLayout - Session:", session);
    console.log("🔍 AdminLayout - User role:", session?.user?.role);
    
    if (!session) {
      console.log("❌ AdminLayout - Sem sessão, redirecionando para login");
      router.push("/auth/signin?callbackUrl=/admin");
      return;
    }

    const role = session.user?.role;
    console.log("🔍 AdminLayout - Role verificado:", role, "Type:", typeof role);
    
    // Se o role está undefined ou null, força novo login para gerar token atualizado
    if (role === undefined || role === null) {
      console.log("⚠️ AdminLayout - Role undefined/null, forçando novo login...");
      router.push("/api/auth/signout?callbackUrl=/auth/signin?callbackUrl=/admin");
      return;
    }
    
    if (role !== "ADMIN" && role !== "INSTRUCTOR") {
      console.log("❌ AdminLayout - Acesso negado, role:", role);
      router.push("/");
    }
  }, [session, status, router]);

  // Abre automaticamente o menu Catálogo se estiver em uma das páginas
  useEffect(() => {
    if (pathname?.includes("/admin/catalogo") || pathname?.includes("/admin/produtos") || 
        pathname?.includes("/admin/montadoras") || pathname?.includes("/admin/modelos")) {
      setCatalogoOpen(true);
    }
  }, [pathname]);

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-10">
        <div className="p-6 border-b border-gray-200 flex flex-col items-center">
          <img src="/logo-drift-brasil.png" alt="Logo Drift Brasil" className="h-12 w-auto mb-2" />
          <p className="text-sm text-gray-600 mt-1 font-bold">Painel Admin</p>
        </div>
        
        <nav className="p-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition text-gray-700 font-medium">
            <span className="text-xl">🏠</span>
            <span>Dashboard</span>
          </Link>
          <Link href="/admin/noticias" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition text-gray-700 font-medium">
            <span className="text-xl">📰</span>
            <span>Notícias</span>
          </Link>
          
          {/* Menu Catálogo expansível */}
          <div>
            <button
              onClick={() => setCatalogoOpen(!catalogoOpen)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition text-gray-700 font-medium"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🛠️</span>
                <span>Catálogo de Peças</span>
              </div>
              <span className={`text-sm transition-transform ${catalogoOpen ? 'rotate-90' : ''}`}>▶</span>
            </button>
            
            {catalogoOpen && (
              <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                <Link href="/admin/catalogo" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-gray-600 text-sm">
                  <span>📋</span>
                  <span>Visão Geral</span>
                </Link>
                <Link href="/admin/catalogo/importar" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-gray-600 text-sm">
                  <span>📤</span>
                  <span>Importar em Massa</span>
                </Link>
                <Link href="/admin/produtos" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-gray-600 text-sm">
                  <span>📦</span>
                  <span>Produtos</span>
                </Link>
                <Link href="/admin/montadoras" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-gray-600 text-sm">
                  <span>🏭</span>
                  <span>Montadoras</span>
                </Link>
                <Link href="/admin/modelos" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-gray-600 text-sm">
                  <span>🚗</span>
                  <span>Modelos</span>
                </Link>
              </div>
            )}
          </div>
          
          <Link href="/admin/quizzes" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition text-gray-700 font-medium">
            <span className="text-xl">🧠</span>
            <span>Quizzes</span>
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition text-gray-700 font-medium">
            <span className="text-xl">👥</span>
            <span>Usuários</span>
          </Link>
          <Link href="/notificacoes" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition text-gray-700 font-medium">
            <span className="text-xl">🔔</span>
            <span>Notificações</span>
          </Link>
          <Link href="/admin/cursos" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition text-gray-700 font-medium">
            <span className="text-xl">🎓</span>
            <span>Cursos</span>
          </Link>
          <Link href="/admin/forum" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition text-gray-700 font-medium">
            <span className="text-xl">💬</span>
            <span>Fórum</span>
          </Link>
          <Link href="/admin/analytics" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition text-gray-700 font-medium">
            <span className="text-xl">📊</span>
            <span>Analytics</span>
          </Link>
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700">{session.user?.name}</p>
            <p className="text-xs text-gray-500">{session.user?.email}</p>
          </div>
          <Link href="/" className="block text-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm font-medium text-gray-700">
            ← Voltar ao site
          </Link>
          <form action="/api/auth/signout" method="post" className="mt-2">
            <button type="submit" className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium">
              Sair
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="px-8 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Painel Administrativo</h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Bem-vindo, {session.user?.name}!</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
