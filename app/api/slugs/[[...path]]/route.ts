import { NextRequest, NextResponse } from "next/server";
import { proxyExpressRequest } from "@/lib/expressUpstream";

function expressSlugsPath(pathSegments: string[] | undefined): string {
  const suffix = pathSegments?.length ? pathSegments.join("/") : "";
  return suffix ? `/api/slugs/${suffix}` : "/api/slugs";
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await context.params;
  const expressPath = expressSlugsPath(path);
  return proxyExpressRequest(req, expressPath);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await context.params;
  const expressPath = expressSlugsPath(path);
  return proxyExpressRequest(req, expressPath);
}
