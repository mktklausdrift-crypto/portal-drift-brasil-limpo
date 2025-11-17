// Caminho: src/components/features/post-card.tsx

// Define as propriedades que o nosso componente vai receber
interface PostCardProps {
  title: string;
  content: string | null; // O conteúdo pode ser nulo
  authorName?: string | null; // O nome do autor é opcional
}

// O componente em si, estilizado com Tailwind CSS
const PostCard = ({ title, content, authorName }: PostCardProps) => {
  // Gera um trecho do conteúdo para exibir como prévia
  const excerpt = content ? content.substring(0, 100) + '...' : '';

  return (
  <article className="border border-gray-200 rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow duration-300 bg-white hover:border-brand-yellow">
      <h2 className="text-2xl font-bold mb-2 text-white">{title}</h2>
      <p className="text-gray-300 mb-4">{excerpt}</p>
      {authorName && (
        <span className="text-sm font-medium text-gray-300">
          Por: {authorName}
        </span>
      )}
    </article>
  );
};

export default PostCard;