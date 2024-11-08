import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Session } from "next-auth";

export interface session extends Session {
  user: {
    id: string;
    jwtToken: string;
    role: string;
    email: string;
    name: string;
  };
}

declare module 'next-auth' {
  interface User {
    id: number;
  }
}

export const NEXT_AUTH = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials:any) {
        if (!credentials?.email || !credentials?.password) {
            return null;
        }

        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email,
          },
        });
        if (!user) {
          return null;
        }

        const isValid = await validatePassword(
          credentials.password,
          user.password || ""
        );
        if (!isValid) {
          return null;
        }
        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: 'jwt' as const
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: any) {
      // Attach the token info to the session object.
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: "/signin",
  },
};

export const validatePassword = async (
  password: string,
  hashedPassword: string
) => {
  const comparePassword = await bcrypt.compare(password, hashedPassword);
  return comparePassword;
};
