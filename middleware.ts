import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { JWT } from "next-auth/jwt";
import jwt from "jsonwebtoken";

/** Decode customizado idêntico ao de authOptions para o middleware conseguir ler o token JWS */
async function customDecode({ token, secret }: any): Promise<JWT | null> {
  if (!token) return null;
  try {
    const secretStr = typeof secret === "string" ? secret : secret.toString();
    const decoded = jwt.verify(token, secretStr, {
      algorithms: ["HS256"],
    });
    if (typeof decoded === "string") return null;
    return decoded as JWT;
  } catch {
    return null;
  }
}

/** Apenas roteamento/UX de páginas (/admin, /usuario). Segurança de API fica no Express + JWT repassado pelo BFF. */

export default withAuth(
  function middleware(req) {
    // Check for admin routes
    if (req.nextUrl.pathname.startsWith("/admin")) {
      if (req.nextauth.token?.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // Check for user routes
    if (req.nextUrl.pathname.startsWith("/usuario")) {
      const userRole = req.nextauth.token?.role;
      if (!userRole || (userRole !== "user" && userRole !== "admin")) {
        return NextResponse.redirect(
          new URL(
            "/api/auth/signin?callbackUrl=" +
              encodeURIComponent(req.nextUrl.pathname),
            req.url
          )
        );
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Admin routes require admin token
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return !!token && token.role === "admin";
        }

        // User routes require user or admin token
        if (req.nextUrl.pathname.startsWith("/usuario")) {
          return !!token && (token.role === "user" || token.role === "admin");
        }

        return true;
      },
    },
    jwt: {
      decode: customDecode,
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/usuario/:path*"],
};
