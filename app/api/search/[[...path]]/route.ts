import { NextRequest, NextResponse } from "next/server";
import { proxyExpressRequest } from "@/lib/expressUpstream";

function expressSearchPath(pathSegments: string[] | undefined): string {
  const suffix = pathSegments?.length ? pathSegments.join("/") : "";
  return suffix ? `/api/search/${suffix}` : "/api/search";
}

export async function GET(
  req: NextRequest,
  { params }: { params: { path?: string[] } },
) {
  const expressPath = expressSearchPath(params.path);
  return proxyExpressRequest(req, expressPath);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { path?: string[] } },
) {
  const expressPath = expressSearchPath(params.path);
  return proxyExpressRequest(req, expressPath);
}
