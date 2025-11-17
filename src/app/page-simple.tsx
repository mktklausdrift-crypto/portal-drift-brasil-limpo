import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-6xl font-black text-primary mb-8 text-center">
          🏁 Portal Drift Brasil
        </h1>
        
        <p className="text-2xl text-gray-700 text-center mb-12">
          Bem-vindo ao maior portal de drift do Brasil!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link 
            href="/noticias"
            className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition text-center"
          >
            <div className="text-5xl mb-4">📰</div>
            <h3 className="text-xl font-bold text-gray-900">Notícias</h3>
          </Link>

          <Link 
            href="/produtos"
            className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition text-center"
          >
            <div className="text-5xl mb-4">🛠️</div>
            <h3 className="text-xl font-bold text-gray-900">Produtos</h3>
          </Link>

          <Link 
            href="/cursos"
            className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition text-center"
          >
            <div className="text-5xl mb-4">🎓</div>
            <h3 className="text-xl font-bold text-gray-900">Cursos</h3>
          </Link>

          <Link 
            href="/forum"
            className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition text-center"
          >
            <div className="text-5xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-gray-900">Fórum</h3>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/admin"
            className="text-gray-500 hover:text-primary text-sm"
          >
            Acesso Admin →
          </Link>
        </div>
      </div>
    </div>
  );
}
