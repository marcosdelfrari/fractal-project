import { NextRequest } from "next/server";
import { proxyExpressRequest } from "@/lib/expressUpstream";

export const dynamic = "force-dynamic";

/**
 * BFF: repassa `/api/*` ao Express com Cookie/Authorization (mesmo padrão de `/api/orders`).
 * Rotas mais específicas (`/api/auth`, `/api/orders`, `/api/settings`, `/api/cep`, …) têm prioridade.
 * Substitui o fluxo antigo `lib/api` → `/backend-api` + rewrite externo, que em produção pode não repassar sessão.
 */
function expressApiPath(pathSegments: string[] | undefined): string {
  if (!pathSegments?.length) return "/api";
  return `/api/${pathSegments.map((s) => encodeURIComponent(s)).join("/")}`;
}

async function handle(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await context.params;
  return proxyExpressRequest(req, expressApiPath(path));
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const HEAD = handle;
export const OPTIONS = handle;
