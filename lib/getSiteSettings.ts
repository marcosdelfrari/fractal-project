import { cache } from "react";
import type { PickupAddressItem } from "@/lib/pickupAddresses";
import { parsePickupAddresses } from "@/lib/pickupAddresses";

export type SiteSettingsDTO = {
  id?: string;
  storeName: string;
  storeIcon?: string | null;
  storeLogo?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  /** Ausente ou true = entrega disponível; false = só retirada */
  deliveryEnabled?: boolean;
  pickupAddresses: PickupAddressItem[];
};

const FALLBACK_NAME = "Loja";

async function fetchSiteSettings(): Promise<SiteSettingsDTO> {
  const base = (
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"
  ).replace(/\/$/, "");
  try {
    const res = await fetch(`${base}/api/settings/site`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = (await res.json()) as SiteSettingsDTO;
      return {
        ...data,
        storeName: data.storeName?.trim() || FALLBACK_NAME,
        deliveryEnabled: data.deliveryEnabled !== false,
        pickupAddresses: parsePickupAddresses(data.pickupAddresses),
      };
    }
  } catch {
    /* rede / API fora */
  }
  return {
    storeName: FALLBACK_NAME,
    deliveryEnabled: true,
    pickupAddresses: [],
  };
}

/** Configurações do site para Server Components / metadata (cache por request). */
export const getSiteSettings = cache(fetchSiteSettings);
