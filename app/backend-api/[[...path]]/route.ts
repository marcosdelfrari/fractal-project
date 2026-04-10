import { NextRequest } from "next/server";
import { proxyExpressRequest } from "@/lib/expressUpstream";

export const dynamic = "force-dynamic";

/**
 * Proxy explícito para o Express (mesma origem no browser).
 * O rewrite em `next.config.mjs` para URL externa pode não repassar `Cookie` no Vercel;
 * aqui repassamos sessão NextAuth como em `/api/orders` e `/api/settings`.
 */
function expressApiPath(segments: string[]): string {
  if (!segments.length) return "/api";
  return `/api/${segments.map((s) => encodeURIComponent(s)).join("/")}`;
}

async function handle(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await context.params;
  const segments = path ?? [];
  return proxyExpressRequest(req, expressApiPath(segments));
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const HEAD = handle;
export const OPTIONS = handle;
