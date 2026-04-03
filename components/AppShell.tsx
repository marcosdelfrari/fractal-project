"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";
import HomeUpcomingEventsSlot from "@/components/HomeUpcomingEventsSlot";
import BrandTiragem from "./BrandTiragem";

type AppShellProps = {
  children: React.ReactNode;
};

/** Fundo #861201 no site; corpo #E3E1D6 com borda 2px. Rotas “nuas” sem moldura. */
export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const bare =
    pathname === "/login" ||
    pathname === "/verify-pin" ||
    pathname.startsWith("/admin");

  if (bare) {
    return (
      <div className="min-h-screen bg-white text-neutral-900">{children}</div>
    );
  }

  return (
    <div className="min-h-screen bg-[#861201]  pb-3 pt-10 px-0">
      <div className="max-w-7xl mx-auto">
        {" "}
        <div className="mx-2 md:mx-6 rounded-t-[50px] border-t-2 border-r-2 border-l-2 border-black bg-[#E3E1D6] text-neutral-900 shadow-none">
          {children}
        </div>
      </div>
      <BrandTiragem />
      <HomeUpcomingEventsSlot />
      <Footer />
    </div>
  );
}
