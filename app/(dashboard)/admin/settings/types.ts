import type { PickupAddressItem } from "@/lib/pickupAddresses";

export interface SiteSettings {
  id: string;
  storeName: string;
  storeIcon: string | null;
  storeLogo: string | null;
  navBrandDesktopMode: "name" | "logo";
  navBrandMobileMode: "name" | "logo";
  hideStoreNameUntilLoaded: boolean;
  navLinks: Array<{
    id: string;
    name: string;
    href: string;
    hasMegaMenu: boolean;
  }>;
  whatsapp: string | null;
  facebook: string | null;
  instagram: string | null;
  x: string | null;
  pinterest: string | null;
  youtube: string | null;
  linkedin: string | null;
  tiktok: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  checkoutMode: "delivery_and_pickup" | "delivery_only" | "pickup_only";
  /** false = checkout só com retirada; true = entrega e retirada */
  deliveryEnabled: boolean;
  pickupAddresses: PickupAddressItem[];
  /** Próximos eventos (home); não faz parte das seções ordenadas da home */
  upcomingEvents?: unknown;
}

export interface HomeSection {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
  content?: unknown;
}

export const SECTION_LABELS: Record<string, string> = {
  hero: "Hero (banner principal)",
  promoSlider: "Slide promocional (faixa vinho/amarelo)",
  categoryMenu: "Menu de categorias",
  productsSection: "Seção de produtos",
  featuredProducts: "Produtos em destaque",
};
