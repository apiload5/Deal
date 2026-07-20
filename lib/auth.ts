import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import { compare } from "bcryptjs"

const prisma = new PrismaClient()

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        const user = await prisma.user.findUnique({ where: { email: credentials?.email as string } })
        if (!user || !user.password) return null
        const isValid = await compare(credentials!.password as string, user.password)
        if (!isValid) return null
        return { id: user.id, email: user.email, name: user.name || undefined, role: user.role || 'user' }
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) { if (user) { token.id = user.id; token.role = user.role } return token },
    session({ session, token }) { if (session.user) { session.user.id = token.id as string; session.user.role = token.role as string } return session }
  }
})
