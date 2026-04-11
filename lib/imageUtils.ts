/**
 * Caminhos antigos apontavam para `public/uploads/sections/*`, pasta ignorada no Git
 * (não existe na Vercel). Mesma origem que `insertDemoData`: cópias de `product*.webp` na raiz.
 */
const LEGACY_UPLOADS_SECTION_REMAP: Record<string, string> = {
  "/uploads/sections/promo-slide-1.webp": "/product2.webp",
  "/uploads/sections/promo-slide-2.webp": "/product3.webp",
  "/uploads/sections/promo-slide-3.webp": "/product4.webp",
  "/uploads/sections/promo-slide-4.webp": "/product5.webp",
  "/uploads/sections/hero.webp": "/product1.webp",
  "/uploads/sections/categ.webp": "/product1.webp",
  "/uploads/sections/bertp.webp": "/product2.webp",
  "/uploads/sections/bag.webp": "/product3.webp",
  "/uploads/sections/racket.webp": "/product4.webp",
  "/uploads/sections/shoes.webp": "/product5.webp",
};

/**
 * Monta `src` para imagem: `data:image/...;base64,...` (logo/ícone no DB), `https://...`,
 * ou caminho em `public/` (produtos, legado).
 */
export function publicAssetUrl(stored: string | null | undefined): string {
  if (stored == null || stored === "") return "";
  const s = String(stored).trim();
  if (!s) return "";
  if (/^data:/i.test(s)) return s;
  if (/^https?:\/\//i.test(s)) return s;
  const normalized = s.startsWith("/") ? s : `/${s}`;
  const remapped = LEGACY_UPLOADS_SECTION_REMAP[normalized];
  return remapped ?? normalized;
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
  const raw = String(stored).trim();
  if (raw.startsWith("data:")) return true;
  if (isLegacyPublicUploadsPath(stored)) return true;
  const base = String(stored).trim().split("/").pop() ?? "";
  if (/^favicon\./i.test(base) || /^logo\./i.test(base)) return true;
  if (/^storeIcon-/i.test(base) || /^storeLogo-/i.test(base)) return true;
  if (/\.ico$/i.test(base)) return true;
  return false;
}
