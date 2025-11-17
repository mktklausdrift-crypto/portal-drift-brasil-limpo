export const dynamic = 'force-static';
import Link from 'next/link';

export default function MeusCursosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Meus Cursos</h1>
          <p className="text-gray-600 mt-2">
            Acompanhe seu progresso e continue seus estudos
          </p>
        </div>

        {/* Mensagem para login */}
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Área Restrita
          </h3>
          <p className="text-gray-500 mb-6">
            Para acessar seus cursos, você precisa estar logado no sistema.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-hover transition-colors"
            >
              Fazer Login
            </Link>
            <Link
              href="/cursos"
              className="inline-flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Ver Cursos Disponíveis
            </Link>
          </div>
        </div>

        {/* Preview de cursos (estático) */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Cursos Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center text-6xl">
                📚
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Diagnóstico Automotivo
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Aprenda técnicas avançadas de diagnóstico de sistemas automotivos modernos.
                </p>
                <Link
                  href="/cursos"
                  className="w-full bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-center transition-colors block"
                >
                  Saiba Mais
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center text-6xl">
                🔧
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Manutenção de Suspensão
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Técnicas completas para manutenção e reparo de sistemas de suspensão.
                </p>
                <Link
                  href="/cursos"
                  className="w-full bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-center transition-colors block"
                >
                  Saiba Mais
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-purple-100 to-violet-200 flex items-center justify-center text-6xl">
                ⚡
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Sistemas Elétricos
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Diagnóstico e reparo de sistemas elétricos e eletrônicos automotivos.
                </p>
                <Link
                  href="/cursos"
                  className="w-full bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-center transition-colors block"
                >
                  Saiba Mais
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
