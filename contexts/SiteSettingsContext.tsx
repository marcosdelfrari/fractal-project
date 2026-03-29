"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getExpressApiBase } from "@/lib/expressApi";
import type { SiteSettingsDTO } from "@/lib/getSiteSettings";
import { parsePickupAddresses } from "@/lib/pickupAddresses";

const FALLBACK: SiteSettingsDTO = {
  storeName: "Loja",
  storeIcon: null,
  storeLogo: null,
  email: null,
  phone: null,
  whatsapp: null,
  address: null,
  deliveryEnabled: true,
  pickupAddresses: [],
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
        const res = await fetch(`${getExpressApiBase()}/settings/site`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as Record<string, unknown>;
        if (cancelled) return;
        setSettings({
          storeName: String(data.storeName || FALLBACK.storeName).trim(),
          storeIcon: (data.storeIcon as string | null) ?? null,
          storeLogo: (data.storeLogo as string | null) ?? null,
          email: (data.email as string | null) ?? null,
          phone: (data.phone as string | null) ?? null,
          whatsapp: (data.whatsapp as string | null) ?? null,
          address: (data.address as string | null) ?? null,
          deliveryEnabled: data.deliveryEnabled !== false,
          pickupAddresses: parsePickupAddresses(data.pickupAddresses),
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
