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

function expressReviewsPath(pathSegments: string[] | undefined): string {
  const suffix = pathSegments?.length ? pathSegments.join("/") : "";
  return suffix ? `/api/reviews/${suffix}` : "/api/reviews";
}

export async function GET(
  req: NextRequest,
  { params }: { params: { path?: string[] } },
) {
  const expressPath = expressReviewsPath(params.path);
  return proxyExpressRequest(req, expressPath);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { path?: string[] } },
) {
  const session = await requireUserSession();
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized: Authentication required" },
      { status: 401 },
    );
  }

  const expressPath = expressReviewsPath(params.path);
  return proxyExpressRequest(req, expressPath);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { path?: string[] } },
) {
  const session = await requireUserSession();
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized: Authentication required" },
      { status: 401 },
    );
  }

  const expressPath = expressReviewsPath(params.path);
  return proxyExpressRequest(req, expressPath);
}
