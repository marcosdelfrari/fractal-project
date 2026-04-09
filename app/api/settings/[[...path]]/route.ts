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

function fallbackPublicSettingsResponse() {
  return NextResponse.json(
    {
      storeName: "Loja",
      navBrandDesktopMode: "name",
      navBrandMobileMode: "name",
      hideStoreNameUntilLoaded: true,
      navLinks: [],
      checkoutMode: "delivery_and_pickup",
      deliveryEnabled: true,
      pickupAddresses: [],
    },
    {
      status: 200,
      headers: { "cache-control": "no-store" },
    },
  );
}

function fallbackHomeSectionsResponse() {
  return NextResponse.json(
    [
      { id: "fallback-hero", name: "hero", enabled: true, order: 0, content: null },
      { id: "fallback-promoSlider", name: "promoSlider", enabled: true, order: 1, content: null },
      { id: "fallback-categoryMenu", name: "categoryMenu", enabled: true, order: 2, content: null },
      { id: "fallback-productsSection", name: "productsSection", enabled: true, order: 3, content: null },
      { id: "fallback-featuredProducts", name: "featuredProducts", enabled: true, order: 4, content: null },
    ],
    {
      status: 200,
      headers: { "cache-control": "no-store" },
    },
  );
}

/**
 * GET/HEAD: leitura pública da vitrine em `/api/settings/public` (DTO + cache no Express).
 * `GET/HEAD /api/settings/site` redireciona para `/api/settings/public` (legado).
 * PUT/POST/…: admin no Next e no Express (`requireAdmin`).
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await context.params;
  if (path?.length === 1 && path[0] === "site") {
    const url = req.nextUrl.clone();
    url.pathname = "/api/settings/public";
    return NextResponse.redirect(url, 308);
  }
  const response = await proxyExpressRequest(req, expressSettingsPath(path));
  if (
    path?.length === 1 &&
    path[0] === "public" &&
    (response.status === 502 || response.status === 504)
  ) {
    return fallbackPublicSettingsResponse();
  }
  if (
    path?.length === 1 &&
    path[0] === "home-sections" &&
    (response.status === 502 || response.status === 504)
  ) {
    return fallbackHomeSectionsResponse();
  }
  return response;
}

export async function HEAD(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await context.params;
  if (path?.length === 1 && path[0] === "site") {
    const url = req.nextUrl.clone();
    url.pathname = "/api/settings/public";
    return NextResponse.redirect(url, 308);
  }
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
