import { NextRequest, NextResponse } from "next/server";
import { proxyExpressRequest } from "@/lib/expressUpstream";

async function requireUserSession() {
  const [{ getServerSession }, { authOptions }] = await Promise.all([
    import("next-auth/next"),
    import("@/lib/authOptions"),
  ]);
  const session = await getServerSession(authOptions);
  if (!session) {
    return null;
  }
  return session;
}

function expressAddressesPath(pathSegments: string[] | undefined): string {
  const suffix = pathSegments?.length ? pathSegments.join("/") : "";
  return suffix ? `/api/addresses/${suffix}` : "/api/addresses";
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await context.params;
  const session = await requireUserSession();
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized: Authentication required" },
      { status: 401 },
    );
  }

  const expressPath = expressAddressesPath(path);
  return proxyExpressRequest(req, expressPath);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await context.params;
  const session = await requireUserSession();
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized: Authentication required" },
      { status: 401 },
    );
  }

  const expressPath = expressAddressesPath(path);
  return proxyExpressRequest(req, expressPath);
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await context.params;
  const session = await requireUserSession();
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized: Authentication required" },
      { status: 401 },
    );
  }

  const expressPath = expressAddressesPath(path);
  return proxyExpressRequest(req, expressPath);
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await context.params;
  const session = await requireUserSession();
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized: Authentication required" },
      { status: 401 },
    );
  }

  const expressPath = expressAddressesPath(path);
  return proxyExpressRequest(req, expressPath);
}
