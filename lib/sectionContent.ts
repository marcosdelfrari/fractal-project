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
  /** Caminho (`/loja`, `/loja/foo`) ou slug (`foo` → `/loja/foo`). */
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
  if (h.startsWith("/")) {
    if (h === "/shop" || h.startsWith("/shop/")) {
      return h.replace(/^\/shop(\/?)/, "/loja$1");
    }
    return h;
  }
  return `/loja/${h}`;
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
      : defaultCategoryMenu.cardImage || "/product1.webp";

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

export interface PromoSliderSlide {
  id: string;
  line1: string;
  line2: string;
  buttonLabel: string;
  buttonHref: string;
  /** Imagem exibida no quadrado cinza central (URL pública). */
  centerImage: string;
}

export interface PromoSliderSectionContent {
  slides: PromoSliderSlide[];
}

const defaultPromoSlider = homeDefaults.promoSlider as PromoSliderSectionContent;

function parsePromoSlides(raw: unknown): PromoSliderSlide[] {
  if (!Array.isArray(raw)) return [];
  const out: PromoSliderSlide[] = [];
  let i = 0;
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const id =
      typeof o.id === "string" && o.id.trim()
        ? o.id.trim()
        : `promo-slide-${i++}`;
    const line1 = typeof o.line1 === "string" ? o.line1 : "";
    const line2 = typeof o.line2 === "string" ? o.line2 : "";
    const buttonLabel = typeof o.buttonLabel === "string" ? o.buttonLabel : "";
    const buttonHref =
      typeof o.buttonHref === "string" && o.buttonHref.trim()
        ? o.buttonHref.trim()
        : "/loja";
    const centerImage =
      typeof o.centerImage === "string" ? o.centerImage.trim() : "";
    if (!line1 && !line2) continue;
    out.push({ id, line1, line2, buttonLabel, buttonHref, centerImage });
  }
  return out;
}

/** Config do banner promocional (faixa vinho/amarelo) a partir do JSON da seção `promoSlider`. */
export function getPromoSliderConfig(
  sectionContent: unknown,
): PromoSliderSectionContent {
  const c = normalizeSectionContent(sectionContent);
  const slidesRaw = c?.slides;
  const parsed = parsePromoSlides(slidesRaw);
  if (parsed.length > 0) {
    return { slides: parsed };
  }
  const fallback = parsePromoSlides(defaultPromoSlider.slides);
  return { slides: fallback.length > 0 ? fallback : [] };
}

const defaultHero = homeDefaults.hero as HeroSectionContent;

export interface UpcomingEventRow {
  id: string;
  title: string;
  date: string;
  location: string;
}

export interface UpcomingEventsSectionContent {
  /** Se false, a faixa não aparece na home (dados continuam salvos). */
  enabled: boolean;
  line1: string;
  line2: string;
  /** Link do botão circular (seta) no canto superior esquerdo. */
  arrowHref: string;
  events: UpcomingEventRow[];
}

const defaultUpcoming = (homeDefaults as Record<string, unknown>)
  .upcomingEvents as UpcomingEventsSectionContent | undefined;

function parseUpcomingEvents(raw: unknown): UpcomingEventRow[] {
  if (!Array.isArray(raw)) return [];
  const out: UpcomingEventRow[] = [];
  let i = 0;
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const id =
      typeof o.id === "string" && o.id.trim()
        ? o.id.trim()
        : `ue-${i++}`;
    const title = typeof o.title === "string" ? o.title.trim() : "";
    const date = typeof o.date === "string" ? o.date.trim() : "";
    const location = typeof o.location === "string" ? o.location.trim() : "";
    if (!title && !date && !location) continue;
    out.push({ id, title, date, location });
  }
  return out;
}

export function getUpcomingEventsConfig(
  sectionContent: unknown,
): UpcomingEventsSectionContent {
  const baseFallback: Omit<UpcomingEventsSectionContent, "enabled"> =
    defaultUpcoming ?? {
      line1: "Próximos",
      line2: "Eventos",
      arrowHref: "/loja",
      events: [],
    };

  const c = normalizeSectionContent(sectionContent);
  const eventsRaw = c?.events;
  const parsed = parseUpcomingEvents(eventsRaw);
  const fromDefault = parseUpcomingEvents(baseFallback.events);
  const events = parsed.length > 0 ? parsed : fromDefault;

  let enabled = true;
  if (
    c != null &&
    typeof (c as Record<string, unknown>).enabled === "boolean"
  ) {
    enabled = (c as Record<string, unknown>).enabled as boolean;
  }

  return {
    enabled,
    line1:
      typeof c?.line1 === "string" && c.line1.trim()
        ? c.line1.trim()
        : baseFallback.line1,
    line2:
      typeof c?.line2 === "string" && c.line2.trim()
        ? c.line2.trim()
        : baseFallback.line2,
    arrowHref:
      typeof c?.arrowHref === "string" && c.arrowHref.trim()
        ? c.arrowHref.trim()
        : baseFallback.arrowHref || "/loja",
    events: events.length > 0 ? events : fromDefault,
  };
}

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
