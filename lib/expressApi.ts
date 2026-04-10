/**
 * Base para chamar o Express no browser: mesmo origin `/api` (BFF repassa cookie).
 */
export function getExpressApiBase(): string {
  if (typeof window !== "undefined") {
    return "/api";
  }
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001").replace(
    /\/$/,
    "",
  );
  return `${base}/api`;
}
