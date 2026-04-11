/**
 * Monta URL pública para arquivo em `public/` (igual `/${product.mainImage}`).
 * No banco: nome do arquivo (`logo.png`, `favicon.ico`) ou caminho legado (`/uploads/site/...`).
 */
export function publicAssetUrl(stored: string | null | undefined): string {
  if (stored == null || stored === "") return "";
  const s = String(stored).trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("/")) return s;
  return `/${s}`;
}

/**
 * Valores antigos no banco (`/uploads/site/...`) não devem passar pelo otimizador
 * `/_next/image`: se o arquivo não existir, o Sharp falha e retorna 500.
 */
export function isLegacyPublicUploadsPath(
  stored: string | null | undefined,
): boolean {
  const s = stored?.trim() ?? "";
  return s.startsWith("/uploads/") || s.startsWith("uploads/");
}

/**
 * Ícone/logo da loja: evita falhas do otimizador (ICO, alguns PNG/WebP) e caminhos legados.
 * Nomes atuais: `favicon.*`, `logo.*`; legado: `storeIcon-*`, `storeLogo-*`, `/uploads/site/...`.
 */
export function preferUnoptimizedSiteAsset(
  stored: string | null | undefined,
): boolean {
  if (stored == null || stored === "") return false;
  if (isLegacyPublicUploadsPath(stored)) return true;
  const base = String(stored).trim().split("/").pop() ?? "";
  if (/^favicon\./i.test(base) || /^logo\./i.test(base)) return true;
  if (/^storeIcon-/i.test(base) || /^storeLogo-/i.test(base)) return true;
  if (/\.ico$/i.test(base)) return true;
  return false;
}
