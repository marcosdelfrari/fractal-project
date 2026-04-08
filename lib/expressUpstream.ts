import { NextRequest, NextResponse } from "next/server";

export function getExpressOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"
  ).replace(/\/$/, "");
}

/**
 * Encaminha o request ao Express (`NEXT_PUBLIC_API_BASE_URL`), preservando método, query e body.
 * Use `search` para substituir a query da requisição (ex.: forçar `?include=products`).
 */
export async function proxyExpressRequest(
  req: NextRequest,
  expressApiPath: string,
  options?: { search?: string },
): Promise<NextResponse> {
  const search =
    options?.search !== undefined ? options.search : req.nextUrl.search;
  const url = `${getExpressOrigin()}${expressApiPath}${search}`;
  const headers: Record<string, string> = {};
  const contentType = req.headers.get("content-type");
  if (contentType) {
    headers["content-type"] = contentType;
  }
  const cookie = req.headers.get("cookie");
  if (cookie) {
    headers.cookie = cookie;
  }
  const authorization = req.headers.get("authorization");
  if (authorization) {
    headers.authorization = authorization;
  }
  const idempotencyKey = req.headers.get("idempotency-key");
  if (idempotencyKey) {
    headers["idempotency-key"] = idempotencyKey;
  }
  const ifNoneMatch = req.headers.get("if-none-match");
  if (ifNoneMatch) {
    headers["if-none-match"] = ifNoneMatch;
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
  for (const name of ["cache-control", "etag", "last-modified"]) {
    const v = upstream.headers.get(name);
    if (v) outHeaders.set(name, v);
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: outHeaders,
  });
}
