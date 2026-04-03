import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

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
  }
);

export const config = {
  matcher: ["/admin/:path*", "/usuario/:path*"],
};
