// Mantido como endpoint oficial em português para produtos
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const data = await req.json();
  try {
    const produto = await prisma.produto.update({
      where: { id },
      data: {
        nome: data.nome,
        descricao: data.descricao,
        preco: data.preco,
        categoria: data.categoria,
        destaque: data.destaque ?? false,
        imagem: data.imagem || "",
      }
    });
    return NextResponse.json(produto);
  } catch (e) {
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    // Verificar se o produto existe
    const produto = await prisma.produto.findUnique({
      where: { id },
      include: {
        aplicacoes: true,
        visualizacoesProduto: true
      }
    });

    if (!produto) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    // Log para debug
    console.log(`Excluindo produto ${id} (${produto.nome})`);
    console.log(`- Aplicações: ${produto.aplicacoes.length}`);
    console.log(`- Visualizações: ${produto.visualizacoesProduto.length}`);

    // Excluir o produto (cascade vai excluir aplicações e visualizações automaticamente)
    await prisma.produto.delete({ where: { id } });

    console.log(`✅ Produto ${id} excluído com sucesso`);

    return NextResponse.json({ 
      success: true,
      message: "Produto excluído com sucesso"
    });
  } catch (error: any) {
    console.error("❌ Erro ao excluir produto:", error);
    
    // Erro de constraint de foreign key
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: "Não é possível excluir este produto pois existem registros vinculados a ele" },
        { status: 400 }
      );
    }

    // Erro de registro não encontrado
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    // Outros erros
    return NextResponse.json(
      { error: error.message || "Erro ao excluir produto" },
      { status: 500 }
    );
  }
}
