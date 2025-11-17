// Caminho: src/components/features/post-card-compact.tsx

interface PostCardCompactProps {
  title: string;
  imageUrl?: string;
  publishedAt?: string;
}

const PostCardCompact = ({ title, imageUrl, publishedAt }: PostCardCompactProps) => {
  return (
    <div className="flex items-center gap-4 p-2 hover:bg-gray-100 rounded transition">
      {imageUrl && (
        <img
          src={imageUrl}
          alt={title}
          className="w-14 h-14 object-cover rounded-md border"
        />
      )}
      <div>
        <h4 className="font-semibold text-gray-800 text-base line-clamp-2">{title}</h4>
        {publishedAt && (
          <span className="text-xs text-gray-500">{publishedAt}</span>
        )}
      </div>
    </div>
  );
};

export default PostCardCompact;
