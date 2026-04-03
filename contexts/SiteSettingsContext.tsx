"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { nextApiAbsolutePath } from "@/lib/nextApiOrigin";
import type { SiteSettingsDTO } from "@/lib/getSiteSettings";
import { parsePickupAddresses } from "@/lib/pickupAddresses";

const FALLBACK: SiteSettingsDTO = {
  storeName: "",
  storeIcon: null,
  storeLogo: null,
  navBrandDesktopMode: "name",
  navBrandMobileMode: "name",
  hideStoreNameUntilLoaded: true,
  navLinks: [],
  email: null,
  phone: null,
  whatsapp: null,
  facebook: null,
  instagram: null,
  x: null,
  pinterest: null,
  youtube: null,
  linkedin: null,
  tiktok: null,
  address: null,
  checkoutMode: "delivery_and_pickup",
  deliveryEnabled: true,
  pickupAddresses: [],
  upcomingEvents: undefined,
};

type Ctx = {
  settings: SiteSettingsDTO;
  loading: boolean;
};

const SiteSettingsContext = createContext<Ctx>({
  settings: FALLBACK,
  loading: true,
});

export function SiteSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<SiteSettingsDTO>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(nextApiAbsolutePath("/api/settings/site"), {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as Record<string, unknown>;
        if (cancelled) return;
        setSettings({
          storeName: String(data.storeName || FALLBACK.storeName).trim(),
          storeIcon: (data.storeIcon as string | null) ?? null,
          storeLogo: (data.storeLogo as string | null) ?? null,
          navBrandDesktopMode:
            data.navBrandDesktopMode === "logo" ? "logo" : "name",
          navBrandMobileMode:
            data.navBrandMobileMode === "logo" ? "logo" : "name",
          hideStoreNameUntilLoaded: data.hideStoreNameUntilLoaded !== false,
          navLinks: Array.isArray(data.navLinks)
            ? (data.navLinks as SiteSettingsDTO["navLinks"])
            : [],
          email: (data.email as string | null) ?? null,
          phone: (data.phone as string | null) ?? null,
          whatsapp: (data.whatsapp as string | null) ?? null,
          facebook: (data.facebook as string | null) ?? null,
          instagram: (data.instagram as string | null) ?? null,
          x: (data.x as string | null) ?? null,
          pinterest: (data.pinterest as string | null) ?? null,
          youtube: (data.youtube as string | null) ?? null,
          linkedin: (data.linkedin as string | null) ?? null,
          tiktok: (data.tiktok as string | null) ?? null,
          address: (data.address as string | null) ?? null,
          checkoutMode:
            data.checkoutMode === "delivery_only" ||
            data.checkoutMode === "pickup_only"
              ? (data.checkoutMode as "delivery_only" | "pickup_only")
              : data.deliveryEnabled === false
                ? "pickup_only"
                : "delivery_and_pickup",
          deliveryEnabled: data.deliveryEnabled !== false,
          pickupAddresses: parsePickupAddresses(data.pickupAddresses),
          upcomingEvents: data.upcomingEvents,
        });
      } catch (e) {
        console.error("Site settings:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => ({ settings, loading }), [settings, loading]);

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
