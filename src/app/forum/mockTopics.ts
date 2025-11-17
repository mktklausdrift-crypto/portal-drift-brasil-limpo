import { ForumTopic } from "../../types/forum";

export const mockTopics: ForumTopic[] = [
  {
    id: 1,
    categoria: "duvidas-tecnicas",
    titulo: "Como instalar a barra estabilizadora?",
    autor: "JoãoDrift",
    replies: 5,
    createdAt: "2025-10-10T14:00:00Z",
    posts: [
      { id: 1, categoria: "duvidas-tecnicas", titulo: "Como instalar a barra estabilizadora?", autor: "JoãoDrift", replies: 5, createdAt: "2025-10-10T14:00:00Z" },
      { id: 2, categoria: "duvidas-tecnicas", titulo: "Re: Como instalar a barra estabilizadora?", autor: "MariaTurbo", replies: 0, createdAt: "2025-10-10T15:00:00Z" },
    ],
  },
  {
    id: 2,
    categoria: "duvidas-tecnicas",
    titulo: "Qual óleo usar no diferencial?",
    autor: "CarlosRWD",
    replies: 2,
    createdAt: "2025-10-12T09:00:00Z",
    posts: [
      { id: 3, categoria: "duvidas-tecnicas", titulo: "Qual óleo usar no diferencial?", autor: "CarlosRWD", replies: 2, createdAt: "2025-10-12T09:00:00Z" },
    ],
  },
  {
    id: 3,
    categoria: "projetos",
    titulo: "Meu swap SR20DET",
    autor: "LucasSwap",
    replies: 8,
    createdAt: "2025-10-13T18:00:00Z",
    posts: [
      { id: 4, categoria: "projetos", titulo: "Meu swap SR20DET", autor: "LucasSwap", replies: 8, createdAt: "2025-10-13T18:00:00Z" },
    ],
  },
];
