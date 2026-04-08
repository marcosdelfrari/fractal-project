import { NextRequest, NextResponse } from "next/server";
import { proxyExpressRequest } from "@/lib/expressUpstream";

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
  const segments = path ?? [];

  if (segments.length === 0) {
    return proxyExpressRequest(req, "/api/orders");
  }

  if (segments.length === 2 && segments[1] === "items") {
    return proxyExpressRequest(
      req,
      `/api/orders/${encodeURIComponent(segments[0])}/items`,
    );
  }

  return new NextResponse(null, { status: 404 });
}

/**
 * Negócio: `server/controllers/customer_orders.js` e itens em `customer_order_product.js`.
 * Proxy repassa query e cookie; autorização no Express.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await context.params;
  const segments = path ?? [];

  if (segments.length === 0) {
    return proxyExpressRequest(req, "/api/orders");
  }

  if (segments.length === 1 && segments[0] === "product-lines") {
    return proxyExpressRequest(req, "/api/orders/product-lines");
  }

  if (segments.length === 1) {
    const orderId = segments[0];
    return proxyExpressRequest(
      req,
      `/api/orders/${encodeURIComponent(orderId)}`,
    );
  }

  if (segments.length === 2 && segments[1] === "items") {
    return proxyExpressRequest(
      req,
      `/api/orders/${encodeURIComponent(segments[0])}/items`,
    );
  }

  return new NextResponse(null, { status: 404 });
}

/** PUT/DELETE: sessão repassada ao Express; autorização centralizada lá (admin ou dono). */
async function handleOrderPathMutate(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await context.params;
  if (!path?.length) {
    return new NextResponse(null, { status: 404 });
  }
  return proxyExpressRequest(req, expressOrdersPath(path));
}

export const PUT = handleOrderPathMutate;
export const DELETE = handleOrderPathMutate;
