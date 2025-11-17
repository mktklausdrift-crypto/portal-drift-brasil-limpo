// Tipos para os modelos do Prisma
export interface User {
  id: string
  name: string | null
  email: string
  emailVerified: Date | null
  image: string | null
  hashedPassword: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
}

export interface Post {
  id: string
  title: string
  content: string
  published: boolean
  authorId: string
  createdAt: Date
  updatedAt: Date
}

export interface PostsOnCategories {
  postId: string
  categoryId: string
}

export interface Produto {
  id: string
  nome: string
  descricao: string
  preco: number
  imagem: string
  destaque: boolean
  categoria: string
  createdAt: Date
  updatedAt: Date
}

export interface Curso {
  id: string
  titulo: string
  descricao: string
  modalidade: string
  cargaHoraria: string
  destaque: boolean
  inscricoesAbertas: boolean
  createdAt: Date
  updatedAt: Date
}

export interface TopicoForum {
  id: string
  titulo: string
  conteudo: string
  categoria: string
  autorId: string
  createdAt: Date
  updatedAt: Date
  autor: {
    id: string
    name: string | null
    image: string | null
  }
}

// Tipos para as consultas com relacionamentos
export interface PostWithRelations {
  id: string
  title: string
  content: string
  published: boolean
  createdAt: Date
  updatedAt: Date
  image?: string | null
  author: {
    id: string
    name: string | null
    image: string | null
  }
  categories: {
    category: {
      id: string
      name: string
    }
  }[]
}

export interface CategoryBasic {
  id: string
  name: string
}