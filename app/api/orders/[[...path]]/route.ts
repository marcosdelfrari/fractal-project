import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { getExpressOrigin, proxyExpressRequest } from "@/lib/expressUpstream";

async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (
    (session as { user?: { role?: string } } | null)?.user?.role !== "admin"
  ) {
    return null;
  }
  return session;
}

function expressOrdersPath(pathSegments: string[] | undefined): string {
  const suffix = pathSegments?.length ? pathSegments.join("/") : "";
  return suffix ? `/api/orders/${suffix}` : "/api/orders";
}

/** Checkout: criar pedido sem autenticação. */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await context.params;
  if (path?.length) {
    return new NextResponse(null, { status: 404 });
  }
  return proxyExpressRequest(req, "/api/orders");
}

/** Lista completa: só admin. Um segmento: admin ou dono do pedido (e-mail = sessão). */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await context.params;
  const segments = path ?? [];

  if (segments.length === 0) {
    const admin = await requireAdminSession();
    if (!admin) {
      return new NextResponse(null, { status: 403 });
    }
    return proxyExpressRequest(req, "/api/orders");
  }

  if (segments.length === 1) {
    const orderId = segments[0];
    const session = await getServerSession(authOptions);
    const role = (session as { user?: { role?: string; email?: string | null } } | null)?.user?.role;

    if (role === "admin") {
      return proxyExpressRequest(req, expressOrdersPath(segments));
    }

    const userEmail = (session as { user?: { email?: string | null } } | null)?.user?.email;
    if (!userEmail) {
      return new NextResponse(null, { status: 401 });
    }

    const upstream = await fetch(
      `${getExpressOrigin()}/api/orders/${encodeURIComponent(orderId)}`,
      { cache: "no-store" },
    );

    if (!upstream.ok) {
      const outHeaders = new Headers();
      const ct = upstream.headers.get("content-type");
      if (ct) outHeaders.set("content-type", ct);
      return new NextResponse(upstream.body, {
        status: upstream.status,
        headers: outHeaders,
      });
    }

    const order = (await upstream.json()) as { email?: string };
    if (
      (order.email || "").toLowerCase() === userEmail.toLowerCase()
    ) {
      return NextResponse.json(order);
    }

    return new NextResponse(null, { status: 403 });
  }

  return new NextResponse(null, { status: 404 });
}

async function handleAdminOnly(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  const admin = await requireAdminSession();
  if (!admin) {
    return new NextResponse(null, { status: 403 });
  }
  const { path } = await context.params;
  if (!path?.length) {
    return new NextResponse(null, { status: 404 });
  }
  return proxyExpressRequest(req, expressOrdersPath(path));
}

export const PUT = handleAdminOnly;
export const DELETE = handleAdminOnly;
