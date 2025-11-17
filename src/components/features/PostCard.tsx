import Link from "next/link"
import Image from "next/image"
import { PostWithRelations } from "@/types/database"
import { getTextPreview } from "@/lib/utils"

interface PostCardProps {
  post: PostWithRelations
}

export function PostCard({ post }: PostCardProps) {
  const createdAt = typeof post.createdAt === 'string' ? new Date(post.createdAt) : post.createdAt;
  const isValidDate = !!createdAt && !Number.isNaN(createdAt.getTime());

  // Verifica se a notícia é nova (publicada nos últimos 7 dias)
  const isNew = isValidDate
    ? (Date.now() - createdAt.getTime()) < 7 * 24 * 60 * 60 * 1000
    : false;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  return (
    <article className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden animate-fadein group relative">
      {/* Imagem de capa */}
      {post.image && (
        <div className="w-full h-40 md:h-48 overflow-hidden relative">
          <img src={post.image} alt={post.title} className="object-cover w-full h-full" />
          {/* Selo de notícia nova */}
          {isNew && (
            <span className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10 animate-bounce">Novo</span>
          )}
        </div>
      )}
      <div className="p-6">
        {/* Categoria */}
        {post.categories.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {post.categories.map((postCategory) => (
              <span 
                key={postCategory.category.id}
                className="inline-block bg-brand-yellow text-black text-xs font-bold px-2.5 py-0.5 rounded-full border border-primary"
              >
                {postCategory.category.name}
              </span>
            ))}
          </div>
        )}

        {/* Título */}
        <h2 className="text-xl font-bold text-primary mb-3 line-clamp-2">
          <Link 
            href={`/noticias/${post.id}`}
            className="hover:underline hover:text-primary transition-colors duration-200"
          >
            {post.title}
          </Link>
        </h2>

        {/* Prévia do conteúdo */}
        <p className="text-gray-600 mb-4 line-clamp-3">
          {getTextPreview(post.content, 150)}
        </p>

        {/* Informações do autor e data */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            {/* Avatar do autor */}
            {post.author.image ? (
              <Image
                src={post.author.image}
                alt={post.author.name || "Usuário"}
                width={24}
                height={24}
                loading="lazy"
                className="rounded-full"
              />
            ) : (
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">
                  {(post.author.name || "U").charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="font-medium text-gray-700">
              {post.author.name || "Usuário"}
            </span>
          </div>

          {/* Data de publicação */}
          <time dateTime={isValidDate ? createdAt.toISOString() : ''}>
            {isValidDate ? formatDate(createdAt) : 'Data indisponivel'}
          </time>
        </div>

        {/* Footer com link para ler mais */}
        <div className="mt-4 pt-4 border-t border-primary flex items-center justify-end">
          <Link 
            href={`/noticias/${post.id}`}
            className="text-primary hover:underline font-bold transition-colors duration-200"
          >
            Ler mais →
          </Link>
        </div>
      </div>
  </article>
// Animação fade-in
// Adicione ao seu CSS global ou tailwind.config.js:
// .animate-fadein { animation: fadein 0.8s ease; }
// @keyframes fadein { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
  )
}