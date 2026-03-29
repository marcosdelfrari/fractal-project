import type { PickupAddressItem } from "@/lib/pickupAddresses";

export interface SiteSettings {
  id: string;
  storeName: string;
  storeIcon: string | null;
  storeLogo: string | null;
  whatsapp: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  /** false = checkout só com retirada; true = entrega e retirada */
  deliveryEnabled: boolean;
  pickupAddresses: PickupAddressItem[];
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
  categoryMenu: "Menu de categorias",
  productsSection: "Seção de produtos",
  featuredProducts: "Produtos em destaque",
};
