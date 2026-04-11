// *********************
// Role of the component: Footer component
// Name of the component: Footer.tsx
// Version: 3.0
// Component call: <Footer />
// *********************

"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaPinterest,
  FaTiktok,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import type { IconType } from "react-icons";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import {
  preferUnoptimizedSiteAsset,
  publicBrandAssetUrl,
} from "@/lib/imageUtils";

function whatsappHref(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const t = raw.trim();
  if (/^https?:\/\//i.test(t)) return t;
  const digits = t.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}`;
}

function telHref(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  return `tel:+${digits}`;
}

const Footer = () => {
  const pathname = usePathname();
  const { settings, loading } = useSiteSettings();
  const storeName = loading ? "" : settings.storeName || "";
  const desktopBrandMode =
    settings.navBrandDesktopMode === "logo" ? "logo" : "name";
  const mobileBrandMode =
    settings.navBrandMobileMode === "logo" ? "logo" : "name";
  const hideStoreNameUntilLoaded = settings.hideStoreNameUntilLoaded !== false;

  const wa = whatsappHref(settings.whatsapp);
  const phoneLink = telHref(settings.phone);

  const socialItems = useMemo(() => {
    const items: { href: string; Icon: IconType; label: string }[] = [];
    if (settings.facebook?.trim())
      items.push({
        href: settings.facebook!.trim(),
        Icon: FaFacebook,
        label: "Facebook",
      });
    if (settings.instagram?.trim())
      items.push({
        href: settings.instagram!.trim(),
        Icon: FaInstagram,
        label: "Instagram",
      });
    if (settings.x?.trim())
      items.push({ href: settings.x!.trim(), Icon: FaXTwitter, label: "X" });
    if (settings.youtube?.trim())
      items.push({
        href: settings.youtube!.trim(),
        Icon: FaYoutube,
        label: "YouTube",
      });
    if (settings.linkedin?.trim())
      items.push({
        href: settings.linkedin!.trim(),
        Icon: FaLinkedin,
        label: "LinkedIn",
      });
    if (settings.pinterest?.trim())
      items.push({
        href: settings.pinterest!.trim(),
        Icon: FaPinterest,
        label: "Pinterest",
      });
    if (settings.tiktok?.trim())
      items.push({
        href: settings.tiktok!.trim(),
        Icon: FaTiktok,
        label: "TikTok",
      });
    const w = whatsappHref(settings.whatsapp);
    if (w) items.push({ href: w, Icon: FaWhatsapp, label: "WhatsApp" });
    return items;
  }, [settings]);

  if (
    pathname === "/login" ||
    pathname === "/verify-pin" ||
    pathname.startsWith("/admin")
  ) {
    return null;
  }

  const logoLinkClassMobile =
    "flex h-[120px] w-[120px] shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-black bg-[#FFFF04] shadow-sm sm:h-[140px] sm:w-[140px]";

  /** Tamanhos do logo no rodapé desktop (layout clássico). */
  const logoLinkClassDesktop =
    "flex h-[150px] w-[150px] shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-black bg-[#FFFF04] shadow-sm";

  const contactEmail = settings.email?.trim();
  const contactAddress = settings.address?.trim();
  const waLabel = settings.whatsapp?.trim()
    ? `WA ${settings.whatsapp!.trim()}`
    : settings.phone?.trim()
      ? settings.phone!.trim()
      : null;

  return (
    <footer className="bg-[#861201] text-[#F4F4EE]" aria-label="Rodapé">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 sm:pb-12 sm:pt-10 md:px-0">
        <div className="mx-0 overflow-hidden rounded-[22px] border-2 border-[#FFFF04] sm:mx-2 sm:rounded-[28px] md:mx-6">
          {/* Desktop: layout anterior (headline + redes + logo) */}
          <div className="hidden px-8 py-10 md:block">
            <div className="flex flex-col items-center gap-10 md:flex-row md:items-center md:justify-between md:gap-12">
              <div className="flex w-full max-w-xl flex-col items-center text-center md:items-start md:text-left">
                <p className="text-balance font-sans text-6xl font-bold leading-[0.95] tracking-tight text-[#F4F4EE] md:text-6xl lg:text-7xl xl:text-8xl">
                  Não perca nossos eventos!
                </p>
                {socialItems.length > 0 ? (
                  <ul
                    className="mt-6 flex flex-wrap items-center justify-center gap-3 md:justify-start"
                    aria-label="Redes sociais"
                  >
                    {socialItems.map(({ href, Icon, label }) => (
                      <li key={`${label}-${href}`}>
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#FFFF04] text-black transition hover:brightness-95"
                          aria-label={label}
                        >
                          <Icon className="h-[18px] w-[18px]" aria-hidden />
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <Link href="/" className={logoLinkClassDesktop}>
                {desktopBrandMode === "logo" &&
                publicBrandAssetUrl(settings.storeLogo) ? (
                  <Image
                    src={publicBrandAssetUrl(settings.storeLogo)}
                    alt={storeName || "Loja"}
                    width={200}
                    height={200}
                    className="h-full w-full object-cover"
                    unoptimized={preferUnoptimizedSiteAsset(settings.storeLogo)}
                  />
                ) : hideStoreNameUntilLoaded && loading ? (
                  <span className="text-[10px] font-bold uppercase text-black">
                    …
                  </span>
                ) : (
                  <span className="px-2 text-center text-[10px] font-bold uppercase leading-tight tracking-tight text-black sm:text-xs">
                    {storeName.slice(0, 24) || "Loja"}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile: contato + frase de efeito + marca */}
          <div className="md:hidden">
          {/* Seção 1 — contato */}
          <div className="px-5 pb-6 pt-9 text-left sm:px-8 sm:pb-8 sm:pt-10">
            <div className="space-y-3 text-[13px] leading-snug tracking-[0.06em] text-[#F4F4EE] sm:text-sm">
              {contactEmail ? (
                <p>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="underline-offset-2 transition hover:text-white hover:underline"
                  >
                    {contactEmail}
                  </a>
                </p>
              ) : null}
              {wa || phoneLink ? (
                <p>
                  {wa ? (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline-offset-2 transition hover:text-white hover:underline"
                    >
                      {waLabel}
                    </a>
                  ) : (
                    <a
                      href={phoneLink!}
                      className="underline-offset-2 transition hover:text-white hover:underline"
                    >
                      {settings.phone!.trim()}
                    </a>
                  )}
                </p>
              ) : null}
              {contactAddress ? (
                <p className="text-balance text-[#F4F4EE]/95">{contactAddress}</p>
              ) : null}
              <p className="pt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FFFF04] sm:text-[11px]">
                Somente com hora marcada
              </p>
            </div>

            {socialItems.length > 0 ? (
              <ul
                className="mt-5 flex flex-wrap items-center justify-start gap-2 sm:gap-3"
                aria-label="Redes sociais"
              >
                {socialItems.map(({ href, Icon, label }) => (
                  <li key={`${label}-${href}`}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#FFFF04] text-black transition hover:brightness-95 sm:h-11 sm:w-11"
                      aria-label={label}
                    >
                      <Icon className="h-[18px] w-[18px]" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="h-px w-full bg-[#FFFF04]" aria-hidden />

          {/* Seção 2 — frase de efeito */}
          <div className="px-5 py-7 text-left sm:px-8 sm:py-9">
            <p className="max-w-[min(100%,20rem)] text-pretty font-sans text-4xl font-bold leading-[1.02] tracking-tight text-[#F4F4EE] sm:max-w-xl sm:text-5xl sm:leading-[0.96]">
              Não perca nossos eventos!
            </p>
          </div>

          <div className="h-px w-full bg-[#FFFF04]" aria-hidden />

          {/* Seção 3 — marca */}
          <div className="flex flex-col items-center justify-center gap-4 px-5 py-8 sm:px-8 sm:py-10">
            <Link href="/" className={logoLinkClassMobile}>
              {mobileBrandMode === "logo" &&
              publicBrandAssetUrl(settings.storeLogo) ? (
                <Image
                  src={publicBrandAssetUrl(settings.storeLogo)}
                  alt={storeName || "Loja"}
                  width={200}
                  height={200}
                  className="h-full w-full object-cover"
                  unoptimized={preferUnoptimizedSiteAsset(settings.storeLogo)}
                />
              ) : hideStoreNameUntilLoaded && loading ? (
                <span className="text-[10px] font-bold uppercase text-black">
                  …
                </span>
              ) : (
                <span className="px-2 text-center text-[10px] font-bold uppercase leading-tight tracking-tight text-black sm:text-xs">
                  {storeName.slice(0, 24) || "Loja"}
                </span>
              )}
            </Link>
          </div>
          </div>
        </div>

        <div className="mx-0 mt-5 flex min-h-[40px] flex-row flex-nowrap items-center justify-between gap-1.5 overflow-x-auto rounded-2xl bg-[#FFFF04] px-3 py-2.5 text-black [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-2 sm:min-h-[44px] sm:gap-4 sm:rounded-full sm:px-8 sm:py-2 md:mx-6 [&::-webkit-scrollbar]:hidden">
          <div
            className="flex shrink-0 flex-nowrap items-center justify-start gap-x-2 text-[9px] font-medium sm:gap-x-5 sm:text-[10px]"
            aria-label="Políticas"
          >
            <Link
              href="/privacidade"
              className="shrink-0 whitespace-nowrap underline-offset-2 hover:underline"
            >
              Privacy Policy
            </Link>
            <Link
              href="/cookies"
              className="shrink-0 whitespace-nowrap underline-offset-2 hover:underline"
            >
              Cookie Policy
            </Link>
          </div>
          <p className="ml-2 shrink-0 whitespace-nowrap text-right text-[9px] font-medium tabular-nums sm:ml-0 sm:text-[10px]">
            {storeName || "Loja"}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
