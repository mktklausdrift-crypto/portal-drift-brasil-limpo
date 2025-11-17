// Caminho: src/components/features/post-card-featured.tsx

interface PostCardFeaturedProps {
  title: string;
  excerpt: string;
  imageUrl?: string;
  authorName?: string;
  publishedAt?: string;
  category?: string;
}

const PostCardFeatured = ({
  title,
  excerpt,
  imageUrl,
  authorName,
  publishedAt,
  category,
}: PostCardFeaturedProps) => {
  return (
    <article className="relative rounded-xl overflow-hidden shadow-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white p-6 flex flex-col justify-end min-h-[320px]">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-700 to-blue-700 opacity-80" />
      )}
      <div className="relative z-10">
        <span className="inline-block bg-white/20 rounded px-3 py-1 text-xs font-semibold mb-2">
          {category}
        </span>
        <h2 className="text-2xl font-bold mb-2 drop-shadow-lg">{title}</h2>
        <p className="mb-4 drop-shadow-md">{excerpt}</p>
        <div className="flex items-center gap-2 text-sm opacity-90">
          {authorName && <span>Por {authorName}</span>}
          {publishedAt && <span>• {publishedAt}</span>}
        </div>
      </div>
    </article>
  );
};

export default PostCardFeatured;
