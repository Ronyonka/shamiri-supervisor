import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"
import { compare } from "bcryptjs"
import { getServerSession } from "next-auth"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const supervisor = await prisma.supervisor.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!supervisor) {
          return null
        }

        const isPasswordValid = await compare(
          credentials.password,
          supervisor.passwordHash
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: supervisor.id,
          email: supervisor.email,
          name: supervisor.name,
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.name = token.name
        session.user.email = token.email
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
}

export const getAuthSession = () => getServerSession(authOptions)
