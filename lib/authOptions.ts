import { NextAuthOptions } from "next-auth";
import { Account, User as AuthUser } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import prisma from "@/utils/db";
import { nanoid } from "nanoid";

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

            // Buscar o usuário
            const user = await prisma.user.findFirst({
              where: {
                email: credentials.email,
              },
            });

            if (user) {
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
            }
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
    // Uncomment and configure these providers as needed
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
        },
      },
    }),
  ],
  callbacks: {
    async signIn({
      user,
      account,
    }: {
      user: AuthUser;
      account: Account | null;
    }) {
      if (account?.provider === "credentials") {
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
        token.iat = Math.floor(Date.now() / 1000); // Issued at time
      }

      // Check if token is expired (15 minutes)
      const now = Math.floor(Date.now() / 1000);
      const tokenAge = now - ((token.iat as number) || 0);
      const maxAge = 15 * 60; // 15 minutes

      if (tokenAge > maxAge) {
        // Token expired - clear token data to force re-authentication
        // NextAuth will handle the redirect to login
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
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
