import { PostWithRelations, CategoryBasic } from "@/types/database"

// Dados mock para desenvolvimento e testes
export const mockCategories: CategoryBasic[] = [
  {
    id: "1",
    name: "Eventos"
  },
  {
    id: "2", 
    name: "Técnicas"
  },
  {
    id: "3",
    name: "Carros"
  },
  {
    id: "4",
    name: "Pilotos"
  }
]

export const mockPosts: PostWithRelations[] = [
  {
    id: "1",
    title: "Campeonato Brasileiro de Drift 2025 - Resultados da Primeira Etapa",
    content: "A primeira etapa do Campeonato Brasileiro de Drift 2025 foi realizada no último fim de semana no Autódromo de Interlagos, em São Paulo. O evento contou com a participação de mais de 50 pilotos de todo o país, em uma competição acirrada que prometeu grandes emoções desde o treino livre até a final. O destaque da competição ficou por conta do piloto João Silva, que conquistou sua primeira vitória na categoria profissional...",
    published: true,
    createdAt: new Date("2025-10-10T10:00:00Z"),
    updatedAt: new Date("2025-10-10T10:00:00Z"),
    author: {
      id: "author1",
      name: "Carlos Mendes",
      image: null
    },
    categories: [
      {
        category: {
          id: "1",
          name: "Eventos"
        }
      }
    ]
  },
  {
    id: "2",
    title: "Técnicas Avançadas de Drift: Como Melhorar Seu Controle de Carro",
    content: "O drift é uma modalidade que exige não apenas coragem, mas também técnica apurada e muito treino. Para aqueles que já dominam o básico e querem levar suas habilidades para o próximo nível, preparamos um guia com técnicas avançadas que podem fazer a diferença na pista. A primeira dica é sobre o timing perfeito para iniciar a derrapagem...",
    published: true,
    createdAt: new Date("2025-10-08T14:30:00Z"),
    updatedAt: new Date("2025-10-08T14:30:00Z"),
    author: {
      id: "author2",
      name: "Ana Paula Rodrigues",
      image: null
    },
    categories: [
      {
        category: {
          id: "2",
          name: "Técnicas"
        }
      }
    ]
  },
  {
    id: "3",
    title: "Novidades do Ford Mustang GT 2025 para Drift",
    content: "A Ford acaba de anunciar as especificações do novo Mustang GT 2025, e as novidades prometem agradar muito os entusiastas do drift. Com um motor V8 5.0 mais potente e um sistema de suspensão completamente renovado, o novo Mustang chega ao mercado brasileiro com várias melhorias específicas para a modalidade...",
    published: true,
    createdAt: new Date("2025-10-06T09:15:00Z"),
    updatedAt: new Date("2025-10-06T09:15:00Z"),
    author: {
      id: "author3",
      name: "Ricardo Santos",
      image: null
    },
    categories: [
      {
        category: {
          id: "3",
          name: "Carros"
        }
      },
      {
        category: {
          id: "2",
          name: "Técnicas"
        }
      }
    ]
  }
]