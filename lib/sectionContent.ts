import homeDefaults from "@/data/home-section-defaults.json";

export interface HeroSectionContent {
  backgroundImage: string;
  titlePrefix: string;
  titleSuffix: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface FeaturedProductSlide {
  id: number;
  lifestyleImage: string;
  productImage: string;
  title: string;
  category: string;
}

/**
 * Card independente no carrossel “menu de categorias” da home (não usa cadastro de categorias do produto).
 */
export type CategoryMenuItem = {
  id: string;
  label: string;
  /** Caminho (`/loja`, `/shop/foo`) ou slug (`foo` → `/shop/foo`). */
  href: string;
  enabled: boolean;
  image: string;
};

/** @deprecated Use `CategoryMenuItem`. */
export type CategoryMenuEntry = CategoryMenuItem;

export function normalizeCategoryMenuHref(href: string): string {
  const h = href.trim();
  if (!h) return "/";
  if (/^https?:\/\//i.test(h)) return h;
  if (h.startsWith("/")) return h;
  return `/shop/${h}`;
}

export function normalizeSectionContent(
  raw: unknown,
): Record<string, unknown> | null {
  if (raw == null || raw === "") return null;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  if (typeof raw === "object") return raw as Record<string, unknown>;
  return null;
}

const defaultCategoryMenu = homeDefaults.categoryMenu as {
  title: string;
  cardImage?: string;
  items?: unknown;
};

function parseCategoryMenuItems(raw: unknown): CategoryMenuItem[] {
  if (!Array.isArray(raw)) return [];
  const out: CategoryMenuItem[] = [];
  let i = 0;
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const id =
      typeof o.id === "string" && o.id.trim()
        ? o.id.trim()
        : `menu-item-${i++}`;
    const label =
      typeof o.label === "string"
        ? o.label.trim()
        : typeof o.title === "string"
          ? o.title.trim()
          : "";
    const href =
      typeof o.href === "string"
        ? o.href.trim()
        : typeof o.link === "string"
          ? o.link.trim()
          : "";
    if (!label || !href) continue;
    out.push({
      id,
      label,
      href,
      enabled: o.enabled !== false,
      image: typeof o.image === "string" ? o.image : "",
    });
  }
  return out;
}

export function getCategoryMenuFullConfig(sectionContent: unknown): {
  title: string;
  /** Ordem = ordem no carrossel. */
  items: CategoryMenuItem[];
  legacyCardImage: string;
} {
  const c = normalizeSectionContent(sectionContent);
  const title =
    typeof c?.title === "string" ? c.title : defaultCategoryMenu.title;
  const legacyCardImage =
    typeof c?.cardImage === "string"
      ? c.cardImage
      : defaultCategoryMenu.cardImage || "/uploads/sections/categ.webp";

  if (c != null && "items" in c && Array.isArray(c.items)) {
    return {
      title,
      items: parseCategoryMenuItems(c.items),
      legacyCardImage,
    };
  }

  const defaults = parseCategoryMenuItems(defaultCategoryMenu.items);
  if (defaults.length > 0) {
    return { title, items: defaults, legacyCardImage };
  }

  return { title, items: [], legacyCardImage };
}

/** @deprecated Preferir getCategoryMenuFullConfig; mantido para compat. */
export function getCategoryMenuConfig(sectionContent: unknown): {
  title: string;
  cardImage: string;
} {
  const { title, legacyCardImage } =
    getCategoryMenuFullConfig(sectionContent);
  return { title, cardImage: legacyCardImage };
}

export function getFeaturedProductsFromContent(
  sectionContent: unknown,
): FeaturedProductSlide[] {
  const c = normalizeSectionContent(sectionContent);
  const items = c?.items;
  if (Array.isArray(items) && items.length > 0) {
    return items as FeaturedProductSlide[];
  }
  return homeDefaults.featuredProducts.items as FeaturedProductSlide[];
}

const defaultHero = homeDefaults.hero as HeroSectionContent;

export function getHeroConfig(sectionContent: unknown): HeroSectionContent {
  const c = normalizeSectionContent(sectionContent);
  return {
    backgroundImage:
      typeof c?.backgroundImage === "string"
        ? c.backgroundImage
        : defaultHero.backgroundImage,
    titlePrefix:
      typeof c?.titlePrefix === "string"
        ? c.titlePrefix
        : defaultHero.titlePrefix,
    titleSuffix:
      typeof c?.titleSuffix === "string"
        ? c.titleSuffix
        : defaultHero.titleSuffix,
    ctaLabel:
      typeof c?.ctaLabel === "string" ? c.ctaLabel : defaultHero.ctaLabel,
    ctaHref: typeof c?.ctaHref === "string" ? c.ctaHref : defaultHero.ctaHref,
  };
}
