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

function expressImagesPath(pathSegments: string[] | undefined): string {
  const suffix = pathSegments?.length ? pathSegments.join("/") : "";
  return suffix ? `/api/images/${suffix}` : "/api/images";
}

export async function GET(
  req: NextRequest,
  { params }: { params: { path?: string[] } },
) {
  const expressPath = expressImagesPath(params.path);
  return proxyExpressRequest(req, expressPath);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { path?: string[] } },
) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized: Admin access required" },
      { status: 401 },
    );
  }

  const expressPath = expressImagesPath(params.path);
  return proxyExpressRequest(req, expressPath);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { path?: string[] } },
) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized: Admin access required" },
      { status: 401 },
    );
  }

  const expressPath = expressImagesPath(params.path);
  return proxyExpressRequest(req, expressPath);
}
