import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { Role, TipoConta } from "@prisma/client"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email e senha são obrigatórios")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            hashedPassword: true,
            role: true,
            tipoConta: true,
            cnpj: true,
          }
        })

        if (!user || !user.hashedPassword) {
          throw new Error("Email ou senha inválidos")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        )

        if (!isPasswordValid) {
          throw new Error("Email ou senha inválidos")
        }

        const userReturn: {
          id: string
          email: string
          name: string | null
          image: string | null
          role: Role
          tipoConta: TipoConta | null
          cnpj: string | null
        } = {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          tipoConta: user.tipoConta ?? null,
          cnpj: user.cnpj ?? null,
        }
        
        console.log("==================== AUTHORIZE RETORNANDO ====================");
        console.log("User object completo:", JSON.stringify(userReturn, null, 2));
        console.log("============================================================");
        
    return userReturn
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error"
  },
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    async jwt({ token, user, trigger }) {
      console.log("==================== JWT CALLBACK INICIADO ====================");
      console.log("JWT CALLBACK - trigger:", trigger);
      console.log("JWT CALLBACK - token antes:", JSON.stringify(token, null, 2));
      console.log("JWT CALLBACK - user recebido:", user ? JSON.stringify(user, null, 2) : "null");
      
      if (user) {
        console.log("JWT CALLBACK - Usuario presente, configurando token...");
        token.id = (user as any).id as string
        token.role = ((user as any).role as Role) || "STUDENT"
        token.tipoConta = (user as any).tipoConta as TipoConta | undefined
        token.cnpj = ((user as any).cnpj as string | null | undefined) ?? null
        console.log("JWT CALLBACK - token.id atribuido:", token.id);
        console.log("JWT CALLBACK - token.role atribuido:", token.role);
      }
      
      // Se o token não tem role, busca do banco de dados
      if (token.sub) {
        console.log("JWT CALLBACK - Token sem role, buscando no banco...");
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true, tipoConta: true, cnpj: true }
        })
        console.log("JWT CALLBACK - Usuario do banco:", dbUser);
        if (dbUser) {
          token.role = (dbUser.role as Role) || "STUDENT"
          token.tipoConta = dbUser.tipoConta ?? undefined
          token.cnpj = dbUser.cnpj ?? null
        }
        console.log("JWT CALLBACK - Role atribuido do banco:", token.role);
      }
      
      console.log("JWT CALLBACK - token FINAL:", JSON.stringify(token, null, 2));
      console.log("==================== JWT CALLBACK FINALIZADO ====================");
      return token
    },
    async session({ session, token }) {
      console.log("SESSION CALLBACK - token:", JSON.stringify(token, null, 2));
      console.log("SESSION CALLBACK - session antes:", JSON.stringify(session, null, 2));
      
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = (token.role as Role) || "STUDENT"
        session.user.tipoConta = token.tipoConta as TipoConta | undefined
        session.user.cnpj = (token.cnpj as string | null | undefined) ?? null
        console.log("SESSION CALLBACK - role atribuido na sessão:", session.user.role);
      }
      
      console.log("SESSION CALLBACK - session final:", JSON.stringify(session, null, 2));
      return session
    },
    async redirect({ url, baseUrl }) {
      // Se a URL já é absoluta e do mesmo domínio, use-a
      if (url.startsWith(baseUrl)) return url
      // Se começa com "/", é um caminho relativo válido
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Caso contrário, volte para a base
      return baseUrl
    }
  },
  events: {
    async signIn({ user }) {
      console.log(`✅ Login bem-sucedido: ${user.email}`)
    },
    async signOut({ token }) {
      console.log(`👋 Logout: ${token.email}`)
    },
  }
}
