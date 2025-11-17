import PostCard from "./post-card"
import PostCardCompact from "./post-card-compact"
import PostCardFeatured from "./post-card-featured"

// Dados de exemplo para demonstração
const samplePost = {
  id: "1",
  title: "Campeonato Brasileiro de Drift 2025 - Resultados da Primeira Etapa em Interlagos",
  content: "A primeira etapa do Campeonato Brasileiro de Drift 2025 foi realizada no último fim de semana no Autódromo de Interlagos, em São Paulo. O evento contou com a participação de mais de 50 pilotos de todo o país.",
  excerpt: "A primeira etapa do Campeonato Brasileiro de Drift 2025 foi realizada no último fim de semana no Autódromo de Interlagos, em São Paulo. O evento contou com a participação de mais de 50 pilotos de todo o país.",
  imageUrl: "/images/drift-interlagos.jpg", // Imagem de exemplo
  authorName: "Carlos Mendes",
  authorAvatar: "/images/carlos-avatar.jpg", // Avatar de exemplo
  publishedAt: "14 de outubro, 2025",
  readTime: "8 min",
  category: "Eventos"
}

const samplePostCompact = {
  id: "2",
  title: "Técnicas Avançadas de Drift para Iniciantes",
  imageUrl: "/images/drift-techniques.jpg",
  publishedAt: "12 de outubro, 2025"
}

export default function PostCardExamples() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Componentes de Card para Notícias
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Diferentes variações do componente PostCard para diferentes contextos e layouts
          </p>
        </div>

        {/* Card Padrão */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Card Padrão (PostCard)</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PostCard title={samplePost.title} content={samplePost.content} authorName={samplePost.authorName} />
            <PostCard 
              title="Nova Pista de Drift em São Paulo"
              content="Uma nova pista de drift foi inaugurada na região metropolitana de São Paulo, oferecendo infraestrutura completa para treinos e competições."
              authorName={samplePost.authorName}
            />
            <PostCard 
              title="Entrevista Exclusiva com Piloto Campeão"
              content="Conversamos com o atual campeão brasileiro de drift sobre suas técnicas, preparação e planos para a próxima temporada."
              authorName={samplePost.authorName}
            />
          </div>
        </section>

        {/* Card Featured */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Card em Destaque (PostCardFeatured)</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <PostCardFeatured
              title="Grande Final do Campeonato Nacional de Drift 2025"
              excerpt="A final do campeonato promete ser eletrizante com os melhores pilotos do país disputando o título nacional. Evento acontece no próximo domingo."
              imageUrl="/images/drift-final.jpg"
              authorName="Ana Paula Rodrigues"
              publishedAt="15 de outubro, 2025"
              category="Eventos"
            />
            <PostCardFeatured
              title="Novos Regulamentos para a Temporada 2026"
              excerpt="Federação anuncia mudanças importantes nas regras de segurança e nas especificações técnicas dos veículos para a próxima temporada."
              imageUrl={undefined} // Teste com gradiente
              authorName="Ricardo Santos"
              publishedAt="13 de outubro, 2025"
              category="Regulamentos"
            />
          </div>
        </section>

        {/* Card Compacto */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Cards Compactos (PostCardCompact)</h2>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Últimas Notícias</h3>
            <div className="space-y-1">
              <PostCardCompact title={samplePostCompact.title} imageUrl={samplePostCompact.imageUrl} publishedAt={samplePostCompact.publishedAt} />
              <PostCardCompact 
                title="Preparação de Motores para Drift: Guia Completo"
                imageUrl="/images/engine-prep.jpg"
                publishedAt="11 de outubro, 2025"
              />
              <PostCardCompact 
                title="Calendário 2026 do Campeonato Brasileiro"
                imageUrl={undefined}
                publishedAt="10 de outubro, 2025"
              />
              <PostCardCompact 
                title="Workshop de Drift para Iniciantes em Curitiba"
                imageUrl="/images/workshop.jpg"
                publishedAt="9 de outubro, 2025"
              />
            </div>
          </div>
        </section>

        {/* Layout Misto */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Layout Misto</h2>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Coluna principal */}
            <div className="lg:col-span-2 space-y-6">
              <PostCardFeatured
                title="Especial: A História do Drift no Brasil"
                excerpt="Desde os primeiros eventos até os campeonatos nacionais, conheça a evolução do drift brasileiro e os pilotos que marcaram época."
                imageUrl="/images/drift-history.jpg"
                authorName="História Drift BR"
                publishedAt="16 de outubro, 2025"
                category="Especial"
              />
              
              <div className="grid md:grid-cols-2 gap-6">
                <PostCard 
                  title="Review: Novos Pneus de Drift Toyo R888R"
                  content={samplePost.content}
                  authorName={samplePost.authorName}
                />
                <PostCard 
                  title="Dicas de Setup para Iniciantes"
                  content={samplePost.content}
                  authorName={samplePost.authorName}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Mais Lidas</h3>
                <div className="space-y-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <PostCardCompact 
                      key={i}
                      title={`Notícia Popular ${i}: Título de Exemplo`}
                      imageUrl={i % 2 === 0 ? "/images/sample.jpg" : undefined}
                      publishedAt={`${15 - i} de outubro, 2025`}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Newsletter</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Receba as últimas notícias do mundo do drift diretamente no seu email.
                </p>
                <div className="space-y-3">
                  <input 
                    type="email" 
                    placeholder="Seu email"
                    className="w-full px-3 py-2 rounded-lg text-gray-900 text-sm"
                  />
                  <button className="w-full bg-white text-blue-600 font-medium py-2 rounded-lg text-sm hover:bg-blue-50 transition-colors">
                    Inscrever-se
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}