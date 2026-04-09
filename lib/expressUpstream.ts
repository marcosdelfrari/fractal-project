import { NextRequest, NextResponse } from "next/server";

export function getExpressOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.API_BASE_URL ||
    "http://localhost:3001"
  ).replace(/\/$/, "");
}

const DEFAULT_UPSTREAM_TIMEOUT_MS = 8000;

function resolveUpstreamTimeoutMs() {
  const raw = process.env.EXPRESS_UPSTREAM_TIMEOUT_MS;
  const parsed = raw ? Number(raw) : NaN;
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  return DEFAULT_UPSTREAM_TIMEOUT_MS;
}

function isFetchTimeoutError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const maybeCause = (error as { cause?: { code?: string } }).cause;
  const code = maybeCause?.code;
  return (
    code === "UND_ERR_HEADERS_TIMEOUT" ||
    code === "UND_ERR_CONNECT_TIMEOUT" ||
    code === "UND_ERR_BODY_TIMEOUT"
  );
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

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method,
      headers,
      body: body && body.byteLength > 0 ? body : undefined,
      signal: AbortSignal.timeout(resolveUpstreamTimeoutMs()),
    });
  } catch (error) {
    const isTimeout = isFetchTimeoutError(error);
    const status = isTimeout ? 504 : 502;
    const reason = isTimeout ? "upstream_timeout" : "upstream_unavailable";
    return NextResponse.json(
      {
        error: "Falha ao conectar com o serviço de API",
        reason,
      },
      { status },
    );
  }

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
