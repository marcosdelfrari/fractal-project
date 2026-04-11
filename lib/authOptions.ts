import { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { Account, User as AuthUser } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import prisma from "@/utils/db";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import { getSessionTokenCookieName } from "./sessionCookieName";

/**
 * Encode custom JWS simples (sem encriptação) para compatibilidade com Express backend.
 * Usa jsonwebtoken library que gera tokens padrão JWT legíveis e verificáveis.
 */
async function customEncode({ token, secret, maxAge }: any) {
  const nowSec = Math.floor(Date.now() / 1000);
  const ttl = maxAge || 15 * 60;
  // Sempre gravar iat no JWS. Se iat sumir no decode, o callback jwt usava (iat || 0) e derrubava a sessão na hora.
  const tokenWithExp = {
    ...token,
    iat: typeof token.iat === "number" ? token.iat : nowSec,
    exp: nowSec + ttl,
  };
  const signed = jwt.sign(tokenWithExp, secret, {
    algorithm: "HS256",
    noTimestamp: true,
  });
  return signed;
}

/**
 * Decode custom para tokens JWS com jsonwebtoken.
 * Também tenta decodificar tokens JWE antigos usando a lib padrão do NextAuth.
 */
async function customDecode({ token, secret }: any): Promise<JWT | null> {
  if (!token) return null;

  const parts = token.split(".");

  if (parts.length === 3) {
    try {
      const decoded = jwt.verify(token, secret, {
        algorithms: ["HS256"],
      });
      if (typeof decoded === "string") return null;
      return decoded as JWT;
    } catch {
      return null;
    }
  }

  if (parts.length === 5) {
    return null;
  }

  return null;
}

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        try {
          const user = await prisma.user.findFirst({
            where: {
              email: credentials.email,
            },
          });
          if (user) {
            const isPasswordCorrect = await bcrypt.compare(
              credentials.password,
              user.password!
            );
            if (isPasswordCorrect) {
              return {
                id: user.id,
                email: user.email,
                role: user.role || "user",
              };
            }
          }
        } catch (err: any) {
          throw new Error(err);
        }
        return null;
      },
    }),
    CredentialsProvider({
      id: "pin",
      name: "PIN",
      credentials: {
        email: { label: "Email", type: "text" },
        pin: { label: "PIN", type: "text" },
      },
      async authorize(credentials: any) {
        try {
          const pinVerification = await prisma.pinVerification.findFirst({
            where: {
              email: credentials.email,
              pin: credentials.pin,
              expiresAt: {
                gt: new Date(),
              },
            },
          });

          if (pinVerification) {
            // Verificar se não excedeu o limite de tentativas
            if (pinVerification.attempts >= 3) {
              return null;
            }

            // Buscar o usuário ou criar se não existir
            let user = await prisma.user.findFirst({
              where: {
                email: credentials.email,
              },
            });

            // Se o usuário não existir, criar automaticamente
            if (!user) {
              user = await prisma.user.create({
                data: {
                  id: nanoid(),
                  email: credentials.email,
                  role: "user",
                  password: null, // Usuários criados via PIN não têm senha
                  updatedAt: new Date(),
                },
              });
            }

            // Limpar o PIN após uso bem-sucedido
            await prisma.pinVerification.delete({
              where: {
                id: pinVerification.id,
              },
            });

            return {
              id: user.id,
              email: user.email,
              role: user.role || "user",
            };
          } else {
            // Incrementar tentativas se PIN incorreto
            const existingPin = await prisma.pinVerification.findFirst({
              where: {
                email: credentials.email,
              },
            });

            if (existingPin) {
              await prisma.pinVerification.update({
                where: {
                  id: existingPin.id,
                },
                data: {
                  attempts: existingPin.attempts + 1,
                },
              });
            }
          }
        } catch (err: any) {
          console.error("Erro na autenticação por PIN:", err);
          throw new Error(err);
        }
        return null;
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID?.trim() &&
    process.env.GOOGLE_CLIENT_SECRET?.trim()
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({
      user,
      account,
    }: {
      user: AuthUser;
      account: Account | null;
    }) {
      if (account?.provider === "credentials" || account?.provider === "pin") {
        return true;
      }

      // Handle OAuth providers
      if (account?.provider === "github" || account?.provider === "google") {
        try {
          // Check if user exists in database
          const existingUser = await prisma.user.findFirst({
            where: {
              email: user.email!,
            },
          });

          if (!existingUser) {
            // Create new user for OAuth providers
            const newUser = await prisma.user.create({
              data: {
                id: nanoid(),
                email: user.email!,
                name: user.name || user.email!.split("@")[0],
                role: "user",
                // OAuth users don't have passwords
                password: null,
                updatedAt: new Date(),
              },
            });

            // Update user object with database data
            user.id = newUser.id;
            user.role = newUser.role || "user";
          } else {
            // Update user object with existing database data
            user.id = existingUser.id;
            user.role = existingUser.role || "user";
          }
          return true;
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.iat = Math.floor(Date.now() / 1000);
        if (user.email) {
          token.email = user.email;
        }
      }

      const now = Math.floor(Date.now() / 1000);
      const maxAge = 15 * 60;
      const exp =
        typeof token.exp === "number" ? token.exp : undefined;
      const iat =
        typeof token.iat === "number" ? token.iat : undefined;

      // Nunca usar (iat || 0): sem iat no payload, a "idade" virava ~epoch e a sessão caía no mesmo request (loop login ↔ /usuario).
      const expiredByExp = exp !== undefined && now >= exp;
      const expiredByIat =
        iat !== undefined && now - iat > maxAge;

      if (expiredByExp || expiredByIat) {
        return {
          ...token,
          id: "",
          role: "",
          expired: true,
        };
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login", // Redirect to login page on auth errors
  },
  session: {
    strategy: "jwt",
    maxAge: 15 * 60, // 15 minutes in seconds
    updateAge: 5 * 60, // Update session every 5 minutes
  },
  jwt: {
    maxAge: 15 * 60, // 15 minutes in seconds
    encode: customEncode,
    decode: customDecode,
  },
  cookies: {
    sessionToken: {
      name: getSessionTokenCookieName(),
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure:
          process.env.NEXTAUTH_URL?.startsWith("https://") === true ||
          !!process.env.VERCEL,
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

