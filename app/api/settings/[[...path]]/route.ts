import { NextRequest, NextResponse } from "next/server";
import { proxyExpressRequest } from "@/lib/expressUpstream";

/** Import dinâmico: GET público de settings não precisa de next-auth/jose (evita chunk quebrado no dev). */
async function requireAdminSession() {
  const [{ getServerSession }, { authOptions }] = await Promise.all([
    import("next-auth/next"),
    import("@/lib/authOptions"),
  ]);
  const session = await getServerSession(authOptions);
  if (
    (session as { user?: { role?: string } } | null)?.user?.role !== "admin"
  ) {
    return null;
  }
  return session;
}

function expressSettingsPath(pathSegments: string[] | undefined): string {
  const suffix = pathSegments?.length ? pathSegments.join("/") : "";
  return suffix ? `/api/settings/${suffix}` : "/api/settings";
}

/** GET/HEAD: leitura pública (loja, home). Demais métodos: apenas admin. */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await context.params;
  return proxyExpressRequest(req, expressSettingsPath(path));
}

export async function HEAD(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await context.params;
  return proxyExpressRequest(req, expressSettingsPath(path));
}

async function handleMutation(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  const sessionOk = await requireAdminSession();
  if (!sessionOk) {
    return new NextResponse(null, { status: 403 });
  }
  const { path } = await context.params;
  return proxyExpressRequest(req, expressSettingsPath(path));
}

export const POST = handleMutation;
export const PUT = handleMutation;
export const PATCH = handleMutation;
export const DELETE = handleMutation;
