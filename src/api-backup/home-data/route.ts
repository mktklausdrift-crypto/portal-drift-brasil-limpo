import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Buscar dados em paralelo para melhor performance
    const [noticias, produtos, cursos, totalUsers, totalProdutos, totalNoticias, totalCursos] = await Promise.all([
      // Notícias publicadas
      prisma.post.findMany({
        where: { published: true },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          id: true,
          title: true,
          content: true,
          image: true,
          createdAt: true,
        }
      }),
      
      // Produtos em destaque
      prisma.produto.findMany({
        where: { destaque: true },
        orderBy: { nome: 'asc' },
        take: 4,
        select: {
          id: true,
          codigo: true,
          nome: true,
          preco: true,
          imagem: true,
          destaque: true,
        }
      }),
      
      // Cursos com inscrições abertas
      prisma.curso.findMany({
        where: { inscricoesAbertas: true },
        orderBy: { titulo: 'asc' },
        take: 3,
        select: {
          id: true,
          titulo: true,
          modalidade: true,
          cargaHoraria: true,
          imagem: true,
          destaque: true,
        }
      }),
      
      // Estatísticas
      prisma.user.count(),
      prisma.produto.count(),
      prisma.post.count({ where: { published: true } }),
      prisma.curso.count(),
    ]);

    return NextResponse.json({
      noticias,
      produtos,
      cursos,
      stats: {
        totalUsuarios: totalUsers,
        totalProdutos,
        totalNoticias,
        totalCursos,
      }
    });
  } catch (error) {
    console.error('Erro ao buscar dados da homepage:', error);
    
    // Retornar dados vazios em caso de erro
    return NextResponse.json({
      noticias: [],
      produtos: [],
      cursos: [],
      stats: {
        totalUsuarios: 0,
        totalProdutos: 0,
        totalNoticias: 0,
        totalCursos: 0,
      }
    });
  }
}
