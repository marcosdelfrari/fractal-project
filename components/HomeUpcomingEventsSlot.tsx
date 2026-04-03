"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import HomeUpcomingEvents from "@/components/HomeUpcomingEvents";
import { getUpcomingEventsConfig } from "@/lib/sectionContent";

/**
 * Lê `upcomingEvents` em SiteSettings e exibe só na home (/)
 * acima do Footer — fora da caixa bege com borda. Não usa HomeSection/ordem.
 */
export default function HomeUpcomingEventsSlot() {
  const pathname = usePathname();
  const [content, setContent] = useState<unknown>(undefined);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (pathname !== "/") {
      setVisible(false);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/settings/site", {
          cache: "no-store",
        });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { upcomingEvents?: unknown };
        if (cancelled) return;
        const cfg = getUpcomingEventsConfig(data.upcomingEvents);
        if (cfg.enabled) {
          setContent(data.upcomingEvents);
          setVisible(true);
        } else {
          setVisible(false);
        }
      } catch {
        if (!cancelled) setVisible(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (!visible || pathname !== "/") return null;

  return <HomeUpcomingEvents sectionContent={content} />;
}
