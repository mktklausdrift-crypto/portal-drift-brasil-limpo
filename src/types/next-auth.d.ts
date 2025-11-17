import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"
import { Role, TipoConta } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role
      tipoConta?: TipoConta
      cnpj?: string | null
    } & DefaultSession["user"]
    accessToken?: string
  }

  interface User extends DefaultUser {
    id: string
    role: Role
    tipoConta?: TipoConta
    cnpj?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string
    role: Role
    tipoConta?: TipoConta
    cnpj?: string | null
    accessToken?: string
  }
}