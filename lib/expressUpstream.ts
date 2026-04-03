import { NextRequest, NextResponse } from "next/server";

export function getExpressOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"
  ).replace(/\/$/, "");
}

/**
 * Encaminha o request ao Express (`NEXT_PUBLIC_API_BASE_URL`), preservando método, query e body.
 */
export async function proxyExpressRequest(
  req: NextRequest,
  expressApiPath: string,
): Promise<NextResponse> {
  const url = `${getExpressOrigin()}${expressApiPath}${req.nextUrl.search}`;
  const headers: Record<string, string> = {};
  const contentType = req.headers.get("content-type");
  if (contentType) {
    headers["content-type"] = contentType;
  }

  const method = req.method;
  let body: ArrayBuffer | undefined;
  if (method !== "GET" && method !== "HEAD") {
    body = await req.arrayBuffer();
  }

  const upstream = await fetch(url, {
    method,
    headers,
    body: body && body.byteLength > 0 ? body : undefined,
  });

  const outHeaders = new Headers();
  const ct = upstream.headers.get("content-type");
  if (ct) {
    outHeaders.set("content-type", ct);
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: outHeaders,
  });
}
