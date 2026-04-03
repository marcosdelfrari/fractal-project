import { NextRequest, NextResponse } from "next/server";
import { proxyExpressRequest } from "@/lib/expressUpstream";

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

async function handle(
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

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  return handle(req, context);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  return handle(req, context);
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  return handle(req, context);
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  return handle(req, context);
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  return handle(req, context);
}
