import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { JWT } from "next-auth/jwt";
import { jwtVerify } from "jose";
import { getSessionTokenCookieName } from "@/lib/sessionCookieName";

/**
 * Decode JWS igual ao de authOptions, mas com `jose` (Web Crypto) — compatível com Edge Runtime.
 * `jsonwebtoken` no middleware pode falhar no Edge e zerar o token → loop login ↔ /usuario.
 */
async function customDecode({ token, secret }: any): Promise<JWT | null> {
  if (!token) return null;

  const parts = token.split(".");

  if (parts.length === 5) {
    return null;
  }

  if (parts.length !== 3) {
    return null;
  }

  try {
    const secretKey = new TextEncoder().encode(
      typeof secret === "string" ? secret : String(secret)
    );
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
      clockTolerance: 15,
    });
    return payload as JWT;
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
        const login = new URL("/login", req.url);
        login.searchParams.set("callbackUrl", req.nextUrl.pathname);
        return NextResponse.redirect(login);
      }
    }
  },
  {
    pages: {
      signIn: "/login",
    },
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
    cookies: {
      sessionToken: {
        name: getSessionTokenCookieName(),
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/usuario/:path*"],
};
