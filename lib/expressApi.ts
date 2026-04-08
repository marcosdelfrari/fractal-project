/**
 * Base para chamar o Express direto (ex.: produtos, usuários) via rewrite `/backend-api`.
 * Configurações e pedidos sensíveis devem preferir rotas Next: `/api/settings/...`, `/api/orders/...`.
 */
export function getExpressApiBase(): string {
  if (typeof window !== "undefined") {
    return "/backend-api";
  }
  const base = (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.API_BASE_URL ||
    "http://localhost:3001"
  ).replace(/\/$/, "");
  return `${base}/api`;
}
