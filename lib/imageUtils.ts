/**
 * Monta URL pública para arquivo em `public/` (igual `/${product.mainImage}`).
 * No banco pode vir só o nome (`storeLogo-abc.png`) ou caminho legado (`/uploads/site/...`).
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
 * Logo/ícone novos em `public/*.png` (igual produto) não usam isso.
 */
export function isLegacyPublicUploadsPath(
  stored: string | null | undefined,
): boolean {
  const s = stored?.trim() ?? "";
  return s.startsWith("/uploads/") || s.startsWith("uploads/");
}
