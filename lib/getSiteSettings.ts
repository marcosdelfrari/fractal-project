import { cache } from "react";
import type { PickupAddressItem } from "@/lib/pickupAddresses";
import { parsePickupAddresses } from "@/lib/pickupAddresses";

export type SiteSettingsDTO = {
  id?: string;
  storeName: string;
  storeIcon?: string | null;
  storeLogo?: string | null;
  navBrandDesktopMode?: "name" | "logo";
  navBrandMobileMode?: "name" | "logo";
  hideStoreNameUntilLoaded?: boolean;
  navLinks?: Array<{
    id: string;
    name: string;
    href: string;
    hasMegaMenu: boolean;
  }>;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  x?: string | null;
  pinterest?: string | null;
  youtube?: string | null;
  linkedin?: string | null;
  tiktok?: string | null;
  address?: string | null;
  /** delivery_and_pickup | delivery_only | pickup_only */
  checkoutMode?: "delivery_and_pickup" | "delivery_only" | "pickup_only" | null;
  /** Compat legado: Ausente ou true = entrega disponível; false = só retirada */
  deliveryEnabled?: boolean;
  pickupAddresses: PickupAddressItem[];
  /** Próximos eventos (home): { enabled, line1, line2, arrowHref, events } */
  upcomingEvents?: unknown;
};

const FALLBACK_NAME = "Loja";

async function fetchSiteSettings(): Promise<SiteSettingsDTO> {
  const base = (
    process.env.NEXTAUTH_URL || "http://localhost:3000"
  ).replace(/\/$/, "");
  try {
    const res = await fetch(`${base}/api/settings/site`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = (await res.json()) as SiteSettingsDTO;
      const normalizedMode =
        data.checkoutMode === "delivery_only" || data.checkoutMode === "pickup_only"
          ? data.checkoutMode
          : "delivery_and_pickup";
      return {
        ...data,
        storeName: data.storeName?.trim() || FALLBACK_NAME,
        facebook: data.facebook?.trim() || null,
        instagram: data.instagram?.trim() || null,
        x: data.x?.trim() || null,
        pinterest: data.pinterest?.trim() || null,
        youtube: data.youtube?.trim() || null,
        linkedin: data.linkedin?.trim() || null,
        tiktok: data.tiktok?.trim() || null,
        checkoutMode: normalizedMode,
        deliveryEnabled: data.deliveryEnabled !== false,
        navBrandDesktopMode: data.navBrandDesktopMode === "logo" ? "logo" : "name",
        navBrandMobileMode: data.navBrandMobileMode === "logo" ? "logo" : "name",
        hideStoreNameUntilLoaded: data.hideStoreNameUntilLoaded !== false,
        navLinks: Array.isArray(data.navLinks) ? data.navLinks : [],
        pickupAddresses: parsePickupAddresses(data.pickupAddresses),
        upcomingEvents: data.upcomingEvents,
      };
    }
  } catch {
    /* rede / API fora */
  }
  return {
    storeName: FALLBACK_NAME,
    navBrandDesktopMode: "name",
    navBrandMobileMode: "name",
    hideStoreNameUntilLoaded: true,
    navLinks: [],
    checkoutMode: "delivery_and_pickup",
    deliveryEnabled: true,
    pickupAddresses: [],
  };
}

/** Configurações do site para Server Components / metadata (cache por request). */
export const getSiteSettings = cache(fetchSiteSettings);
