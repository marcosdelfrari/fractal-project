/**
 * URL da própria app Next para bater nas Route Handlers (`/api/...`) em vez do Express direto.
 * Cliente: path relativo. Servidor (RSC / route): `NEXTAUTH_URL` ou localhost:3000.
 */
export function nextApiAbsolutePath(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (typeof window !== "undefined") {
    return p;
  }
  const base = (
    process.env.NEXTAUTH_URL || "http://localhost:3000"
  ).replace(/\/$/, "");
  return `${base}${p}`;
}

export function fetchNextApi(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const url = nextApiAbsolutePath(path);
  const isServer = typeof window === "undefined";
  return fetch(url, {
    ...init,
    ...(isServer && init?.cache === undefined
      ? { cache: "no-store" as RequestCache }
      : {}),
  });
}
