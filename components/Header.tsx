"use client";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaUser,
  FaShoppingBag,
  FaMapMarkerAlt,
  FaSignOutAlt,
  FaSearch,
  FaHeart,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaThLarge,
} from "react-icons/fa";

import CartElement from "./CartElement";
import { signOut, useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useWishlistStore } from "@/app/_zustand/wishlistStore";
import apiClient from "@/lib/api";
import { preferUnoptimizedSiteAsset, publicAssetUrl } from "@/lib/imageUtils";
import MegaMenu from "./MegaMenu";
import {
  fetchAllMenuData,
  fetchHeaderNavLinks,
  type MenuData,
  type HeaderNavLink,
} from "@/mocks/menuData";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

const Header = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { wishlist, setWishlist, wishQuantity } = useWishlistStore();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileItem, setExpandedMobileItem] = useState<string | null>(
    null,
  );
  const [menuData, setMenuData] = useState<{
    men: MenuData | null;
    women: MenuData | null;
  }>({
    men: null,
    women: null,
  });
  const [headerNavLinks, setHeaderNavLinks] = useState<HeaderNavLink[]>([]);
  const { settings: siteSettings, loading: siteSettingsLoading } =
    useSiteSettings();
  const storeName = siteSettingsLoading ? "" : siteSettings.storeName || "";
  const desktopBrandMode =
    siteSettings.navBrandDesktopMode === "logo" ? "logo" : "name";
  const mobileBrandMode =
    siteSettings.navBrandMobileMode === "logo" ? "logo" : "name";
  /** Mesmo contêiner circular da logo no `Footer` (mobile → desktop). */
  const logoLinkClass =
    "flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-black bg-[#FFFF04] shadow-sm h-[120px] w-[120px] sm:h-[140px] sm:w-[140px] md:h-[150px] md:w-[150px]";
  const hideStoreNameUntilLoaded =
    siteSettings.hideStoreNameUntilLoaded !== false;

  const handleLogout = () => {
    setTimeout(() => signOut(), 1000);
    toast.success("Logout realizado com sucesso!");
  };

  // getting all wishlist items by user id
  const getWishlistByUserId = async (id: string) => {
    const response = await apiClient.get(`/api/wishlist/${id}`, {
      cache: "no-store",
    });
    const wishlist = await response.json();
    const productArray: {
      id: string;
      title: string;
      price: number;
      image: string;
      slug: string;
      stockAvailabillity: number;
    }[] = [];

    wishlist.map((item: any) =>
      productArray.push({
        id: item?.product?.id,
        title: item?.product?.title,
        price: item?.product?.price,
        image: item?.product?.mainImage,
        slug: item?.product?.slug,
        stockAvailabillity: item?.product?.inStock,
      }),
    );

    setWishlist(productArray);
  };

  // Carregar dados do menu via mock
  useEffect(() => {
    const loadMenuData = async () => {
      try {
        const allMenuData = await fetchAllMenuData();
        setMenuData({
          men: allMenuData.men,
          women: allMenuData.women,
        });
        const fallbackLinks = await fetchHeaderNavLinks();
        setHeaderNavLinks(fallbackLinks);
      } catch (error) {
        console.error("Erro ao carregar dados do menu:", error);
      }
    };

    loadMenuData();
  }, []);

  useEffect(() => {
    if (!Array.isArray(siteSettings.navLinks)) return;
    const nextLinks = siteSettings.navLinks
      .map((raw) => ({
        id: String(raw.id || "").trim(),
        name: String(raw.name || "").trim(),
        href: String(raw.href || "").trim(),
        hasMegaMenu: Boolean(raw.hasMegaMenu),
      }))
      .filter((item) => item.id && item.name && item.href);
    if (nextLinks.length > 0) {
      setHeaderNavLinks(nextLinks);
    }
  }, [siteSettings.navLinks]);

  useEffect(() => {
    if (session?.user?.id) {
      getWishlistByUserId(session.user.id);
    }
  }, [session?.user?.id, wishlist.length]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setExpandedMobileItem(null);
  }, [pathname]);

  // Ocultar header nas páginas de login, verify-pin e admin
  if (
    pathname === "/login" ||
    pathname === "/verify-pin" ||
    pathname.startsWith("/admin")
  ) {
    return null;
  }

  const navPillLinkClass =
    "text-[11px] font-bold uppercase tracking-[0.12em] text-black transition-colors";

  /** Mesmo visual do carrinho (`CartElement` variant retro) */
  const navRetroIconBtnClass =
    "relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-black bg-[#FFFD04] text-black transition hover:brightness-95 sm:h-8 sm:w-8";

  return (
    <header
      className="relative z-50 text-neutral-900"
      onMouseLeave={() => setHoveredItem(null)}
    >
      <div className="mx-auto max-w-screen-2xl px-4 pb-3 pt-7 sm:px-6 sm:pb-4 sm:pt-9 md:px-8">
        {/* Faixa vermelha tipo cápsula + logo central sobreposta */}
        <div className="relative mx-auto max-w-7xl">
          <div className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-[42%] sm:-translate-y-[44%]">
            <div className="pointer-events-auto flex flex-col items-center">
              <Link href="/" className={`${logoLinkClass} md:hidden`}>
                {mobileBrandMode === "logo" && siteSettings.storeLogo ? (
                  <Image
                    src={publicAssetUrl(siteSettings.storeLogo)}
                    alt={storeName || "Loja"}
                    width={200}
                    height={200}
                    className="h-full w-full object-cover"
                    unoptimized={preferUnoptimizedSiteAsset(
                      siteSettings.storeLogo,
                    )}
                  />
                ) : hideStoreNameUntilLoaded && siteSettingsLoading ? (
                  <span className="text-[10px] font-bold uppercase text-black">
                    …
                  </span>
                ) : (
                  <span className="px-2 text-center text-[10px] font-bold uppercase leading-tight tracking-tight text-black sm:text-xs">
                    {storeName.slice(0, 24) || "Loja"}
                  </span>
                )}
              </Link>
              <Link href="/" className={`${logoLinkClass} hidden md:flex`}>
                {desktopBrandMode === "logo" && siteSettings.storeLogo ? (
                  <Image
                    src={publicAssetUrl(siteSettings.storeLogo)}
                    alt={storeName || "Loja"}
                    width={200}
                    height={200}
                    className="h-full w-full object-cover"
                    unoptimized={preferUnoptimizedSiteAsset(
                      siteSettings.storeLogo,
                    )}
                  />
                ) : hideStoreNameUntilLoaded && siteSettingsLoading ? (
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

          <nav
            className="relative flex h-[52px] items-stretch rounded-full border border-black/20 bg-[#861201] px-2 shadow-inner sm:h-14 sm:px-3"
            aria-label="Principal"
          >
            <div className="flex md:hidden flex-1 items-center justify-start gap-2 sm:gap-3">
              <button
                type="button"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-black bg-[#FFFD04] text-black transition hover:brightness-95 xl:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Abrir menu"
              >
                <FaBars className="text-sm" />
              </button>
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-1.5 pr-10 sm:gap-3 sm:pr-12 md:pr-14">
              <div className="hidden min-w-0 flex-1 items-center gap-3 overflow-x-auto md:flex">
                {headerNavLinks.map((link) => (
                  <Link
                    key={link.id}
                    href={link.href}
                    className={`${navPillLinkClass} ${
                      link.hasMegaMenu && hoveredItem === link.id
                        ? "opacity-100"
                        : "opacity-90"
                    } relative flex items-center justify-center rounded-full border-2 border-black bg-[#FFFD04] p-2 px-4 transition-colors hover:border-black hover:bg-[#E3E1D6] hover:text-black`}
                    onMouseEnter={() =>
                      setHoveredItem(link.hasMegaMenu ? link.id : null)
                    }
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex flex-1 items-center justify-end gap-2 pl-10 sm:gap-3 sm:pl-12 md:pl-14">
              <div className="hidden items-center gap-2 xl:flex">
                <button
                  type="button"
                  className={navRetroIconBtnClass}
                  aria-label="Buscar"
                >
                  <FaSearch className="text-base" />
                </button>
                <Link
                  href="/wishlist"
                  className={navRetroIconBtnClass}
                  aria-label="Favoritos"
                >
                  <FaHeart className="text-base" />
                  {wishQuantity > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full border border-black bg-[#861201] px-0.5 text-[10px] font-bold text-[#FFFD04]">
                      {wishQuantity > 99 ? "99+" : wishQuantity}
                    </span>
                  )}
                </Link>
                <Link
                  href={session?.user ? "/usuario" : "/login"}
                  className={navRetroIconBtnClass}
                  aria-label={session?.user ? "Minha conta" : "Entrar"}
                >
                  <FaUser className="text-base" />
                </Link>
              </div>
              <CartElement variant="retro" />
            </div>
          </nav>
        </div>
      </div>

      {/* Mega Menu */}
      <MegaMenu
        activeItem={hoveredItem || ""}
        data={
          hoveredItem && menuData[hoveredItem as keyof typeof menuData]
            ? menuData[hoveredItem as keyof typeof menuData]
            : null
        }
      />

      {/* Mobile Menu Overlay */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        } xl:hidden`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Menu mobile: popup centralizado */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 xl:hidden transition-opacity duration-300 ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div
          className={`flex max-h-[min(85vh,720px)] w-full max-w-[400px] flex-col overflow-hidden rounded-[28px] border-2 border-black bg-[#e3e1d6] shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${
            isMobileMenuOpen ? "scale-100" : "scale-95"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
        <div className="flex justify-end p-6 sm:p-8">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-black transition-all hover:opacity-70 hover:rotate-90 p-2 -mr-2 duration-300"
            aria-label="Close menu"
          >
            <FaTimes className="text-2xl font-light" />
          </button>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-6 text-black sm:px-8">
          <div className="flex flex-col gap-6 mb-8">
            {headerNavLinks.map((navLink) => {
              // Se tem mega menu, renderiza com expansão
              if (navLink.hasMegaMenu) {
                const navMenuData =
                  menuData[navLink.id as keyof typeof menuData];
                const isExpanded = expandedMobileItem === navLink.id;

                return (
                  <div
                    key={navLink.id}
                    className="border-b border-black/15 pb-5 last:border-0 last:pb-0"
                  >
                    <button
                      onClick={() =>
                        setExpandedMobileItem(isExpanded ? null : navLink.id)
                      }
                      className="flex w-full items-center justify-between uppercase text-lg font-light tracking-[0.15em] text-black transition-colors hover:opacity-80"
                    >
                      <span>{navLink.name}</span>
                      <span
                        className={`transform transition-transform duration-300 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      >
                        <FaChevronDown className="text-sm font-light text-black/70" />
                      </span>
                    </button>

                    <div
                      className={`grid transition-all duration-300 ease-in-out overflow-hidden ${
                        isExpanded
                          ? "grid-rows-[1fr] opacity-100 mt-6"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="min-h-0 ml-1 flex flex-col gap-6 border-l border-black/15 pl-4">
                        {navMenuData && (
                          <>
                            {/* Left Links */}
                            <div className="flex flex-col gap-4">
                              {navMenuData.leftLinks.map((link) => (
                                <Link
                                  key={link.name}
                                  href={link.href}
                                  className="text-sm tracking-wide text-black transition-colors hover:opacity-80"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  {link.name}
                                </Link>
                              ))}
                            </div>

                            {/* Categories */}
                            {navMenuData.categories.map((category) => (
                              <div key={category.title} className="mt-2">
                                <span className="mb-4 block text-[10px] font-semibold uppercase tracking-widest text-black">
                                  {category.title}
                                </span>
                                <div className="flex flex-col gap-4 border-l border-black/10 pl-3">
                                  {category.items.map((item) => (
                                    <Link
                                      key={item.name}
                                      href={item.href}
                                      className="text-sm tracking-wide text-black transition-colors hover:opacity-80"
                                      onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                      {item.name}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              // Se não tem mega menu, renderiza link simples
              return (
                <Link
                  key={navLink.id}
                  href={navLink.href}
                  className="border-b border-black/15 pb-5 uppercase text-lg font-light text-black transition-colors last:border-0 last:pb-0 hover:opacity-80"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {navLink.name}
                </Link>
              );
            })}
          </div>

          <div className="mt-auto flex flex-col gap-5 pb-12 pt-8 text-[15px] text-black">
            <Link
              href="/wishlist"
              className="group flex items-center gap-4 py-1 transition-colors hover:opacity-80"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FaHeart className="text-lg text-black transition-colors" />
              <span className="tracking-wide">Favoritos</span>
              {wishQuantity > 0 && (
                <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs font-medium text-black">
                  {wishQuantity}
                </span>
              )}
            </Link>
            <Link
              href="/carrinho"
              className="group flex items-center gap-4 py-1 transition-colors hover:opacity-80"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FaShoppingBag className="text-lg text-black transition-colors" />
              <span className="tracking-wide">Carrinho</span>
            </Link>

            <div className="my-2 h-px w-full bg-black/25"></div>

            {!session?.user ? (
              <Link
                href="/login"
                className="group flex items-center gap-4 py-1 transition-colors hover:opacity-80"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FaUser className="text-lg text-black transition-colors" />
                <span className="tracking-wide">Login / Cadastro</span>
              </Link>
            ) : (
              <div className="flex flex-col gap-5 pt-2">
                <span className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-black">
                  Minha Conta
                </span>
                <Link
                  href="/usuario"
                  className="group flex items-center gap-4 transition-colors hover:opacity-80"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FaThLarge className="text-lg text-black transition-colors" />
                  <span className="tracking-wide">Dashboard</span>
                </Link>
                <Link
                  href="/usuario/perfil"
                  className="group flex items-center gap-4 transition-colors hover:opacity-80"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FaUser className="text-lg text-black transition-colors" />
                  <span className="tracking-wide">Meu Perfil</span>
                </Link>
                <Link
                  href="/usuario/pedidos"
                  className="group flex items-center gap-4 transition-colors hover:opacity-80"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FaShoppingBag className="text-lg text-black transition-colors" />
                  <span className="tracking-wide">Meus Pedidos</span>
                </Link>
                <Link
                  href="/usuario/enderecos"
                  className="group flex items-center gap-4 transition-colors hover:opacity-80"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FaMapMarkerAlt className="text-lg text-black transition-colors" />
                  <span className="tracking-wide">Endereços</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="group mt-2 flex items-center gap-4 pt-2 text-left transition-colors hover:text-red-600"
                >
                  <FaSignOutAlt className="text-lg text-black transition-colors group-hover:text-red-500" />
                  <span className="tracking-wide text-black group-hover:text-red-600">
                    Sair
                  </span>
                </button>
              </div>
            )}
          </div>
        </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
