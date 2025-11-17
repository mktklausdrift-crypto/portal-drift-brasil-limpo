export type ForumPost = {
  id: number;
  categoria: string;
  titulo: string;
  autor: string;
  replies: number;
  createdAt: string;
};

export type ForumTopic = {
  id: number;
  categoria: string;
  titulo: string;
  autor: string;
  replies: number;
  createdAt: string;
  posts: ForumPost[];
};
