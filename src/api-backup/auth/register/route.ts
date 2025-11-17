import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { validarCNPJ } from "@/lib/validacao-cnpj";
import { TipoConta } from "@prisma/client";

// Schema unificado com tipo de conta e CNPJ opcional
const registerSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").optional(),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
  tipoConta: z.enum(["PESSOA_FISICA", "MECANICO", "DISTRIBUIDOR"]).optional(),
  cnpj: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = registerSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", detalhes: parsed.error.issues },
        { status: 400 }
      );
    }

    const { name, email, password, tipoConta, cnpj } = parsed.data;

    // Verificar duplicidade
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Já existe uma conta com este email" },
        { status: 409 }
      );
    }

    // Regras CNPJ
  const precisaCNPJ = tipoConta === 'MECANICO' || tipoConta === 'DISTRIBUIDOR';
    let cnpjToSave: string | null = null;
    if (precisaCNPJ) {
      if (!cnpj || !validarCNPJ(cnpj)) {
        return NextResponse.json(
          { error: "CNPJ obrigatório e inválido para o tipo selecionado." },
          { status: 400 }
        );
      }
      cnpjToSave = cnpj;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        role: "STUDENT",
        tipoConta: (tipoConta as TipoConta | undefined) ?? TipoConta.PESSOA_FISICA,
        cnpj: cnpjToSave,
      },
      select: { id: true, name: true, email: true }
    });

    // Notificação de boas-vindas
    await prisma.notificacao.create({
      data: {
        usuarioId: user.id,
        titulo: "🎉 Conta criada!",
        mensagem: `Bem-vindo, ${user.name || 'Usuário'}! Explore cursos e participe do fórum com sua conta única.`,
        tipo: 'SUCCESS'
      }
    }).catch(() => console.log('Falha ao criar notificação de boas-vindas'));

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("Erro no registro:", error);
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Valor único duplicado.' }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}