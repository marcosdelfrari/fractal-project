"use client";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import HeaderTop from "./HeaderTop";
import Image from "next/image";
import SearchInput from "./SearchInput";
import Link from "next/link";
import {
  FaBell,
  FaUser,
  FaShoppingBag,
  FaMapMarkerAlt,
  FaStar,
  FaSignOutAlt,
  FaSearch,
  FaPhoneAlt,
  FaHeart,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

import CartElement from "./CartElement";
import HeartElement from "./HeartElement";
import { signOut, useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useWishlistStore } from "@/app/_zustand/wishlistStore";
import apiClient from "@/lib/api";
import MegaMenu from "./MegaMenu";
import {
  fetchAllMenuData,
  fetchHeaderNavLinks,
  type MenuData,
  type HeaderNavLink,
} from "@/mocks/menuData";

const Header = () => {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const { wishlist, setWishlist, wishQuantity } = useWishlistStore();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileItem, setExpandedMobileItem] = useState<string | null>(
    null
  );
  const [menuData, setMenuData] = useState<{
    men: MenuData | null;
    women: MenuData | null;
  }>({
    men: null,
    women: null,
  });
  const [headerNavLinks, setHeaderNavLinks] = useState<HeaderNavLink[]>([]);

  const handleLogout = () => {
    setTimeout(() => signOut(), 1000);
    toast.success("Logout successful!");
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
      })
    );

    setWishlist(productArray);
  };

  // getting user by email so I can get his user id
  const getUserByEmail = async () => {
    if (session?.user?.email) {
      apiClient
        .get(`/api/users/email/${session?.user?.email}`, {
          cache: "no-store",
        })
        .then((response) => response.json())
        .then((data) => {
          getWishlistByUserId(data?.id);
        });
    }
  };

  // Carregar dados do menu via mock
  useEffect(() => {
    const loadMenuData = async () => {
      try {
        const [allMenuData, navLinks] = await Promise.all([
          fetchAllMenuData(),
          fetchHeaderNavLinks(),
        ]);
        setMenuData({
          men: allMenuData.men,
          women: allMenuData.women,
        });
        setHeaderNavLinks(navLinks);
      } catch (error) {
        console.error("Erro ao carregar dados do menu:", error);
      }
    };

    loadMenuData();
  }, []);

  useEffect(() => {
    getUserByEmail();
  }, [session?.user?.email, wishlist.length]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setExpandedMobileItem(null);
  }, [pathname]);

  const isHomepage = pathname === "/";
  const isHeaderWhite = !isHomepage || hoveredItem !== null;

  // Ocultar header nas páginas de login, verify-pin e admin
  if (
    pathname === "/login" ||
    pathname === "/verify-pin" ||
    pathname.startsWith("/admin")
  ) {
    return null;
  }

  return (
    <header
      className={`${
        isHomepage
          ? "absolute top-0 w-full z-50 transition-all duration-300"
          : "bg-white text-black relative shadow-md"
      } ${isHeaderWhite ? "bg-white text-black" : "bg-transparent text-white"}`}
      onMouseLeave={() => setHoveredItem(null)}
    >
      {/* Main Header Content */}
      <div
        className={`flex items-center justify-between px-8 py-6 max-w-screen-2xl mx-auto relative ${
          !isHomepage ? "h-24" : ""
        }`}
      >
        {/* LEFT: Menu Links (Visible on Desktop) */}
        <nav className="hidden xl:flex gap-6 text-xs font-bold uppercase tracking-widest h-full items-center">
          {headerNavLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className={`transition-opacity py-6 border-b-2 ${
                link.hasMegaMenu && hoveredItem === link.id
                  ? "border-current opacity-100"
                  : "border-transparent hover:opacity-70"
              }`}
              onMouseEnter={() =>
                setHoveredItem(link.hasMegaMenu ? link.id : null)
              }
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <div className="xl:hidden">
          <button
            className={`text-xl p-2 -mr-2 hover:opacity-70 transition-opacity ${
              isHeaderWhite ? "text-black" : "text-white"
            }`}
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <FaBars />
          </button>
        </div>

        {/* CENTER: Logo */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Link href="/">
            <span
              className={`font-thin text-4xl tracking-widest ${
                isHeaderWhite ? "text-black" : "text-white"
              }`}
            >
              MARCOS
            </span>
          </Link>
        </div>

        {/* RIGHT: Icons & Actions */}
        <div className="flex gap-x-6 items-center justify-end">
          {/* Icons from Reference */}

          <button className="hover:opacity-70 transition-opacity hidden md:block">
            <FaSearch className="text-sm" />
          </button>

          {/* Wishlist */}
          <div className="relative hover:opacity-70 transition-opacity">
            <Link href="/wishlist">
              <FaHeart className="text-sm" />
              {wishQuantity > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                  {wishQuantity}
                </span>
              )}
            </Link>
          </div>

          {/* User Account */}
          {session?.user ? (
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="flex items-center gap-2 hover:opacity-70 transition-opacity"
              >
                <FaUser className="text-sm" />
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content z-[1] menu p-2 shadow bg-white text-black rounded-lg w-64 border border-gray-200 mt-4"
              >
                <li className="px-3 py-2 text-sm text-gray-500 border-b border-gray-100">
                  {session.user.name || session.user.email}
                </li>
                <li>
                  <Link href="/user">Dashboard</Link>
                </li>
                <li>
                  <Link href="/user/perfil">Meu Perfil</Link>
                </li>
                <li>
                  <Link href="/user/pedidos">Meus Pedidos</Link>
                </li>
                <li>
                  <Link href="/user/enderecos">Endereços</Link>
                </li>
                <li className="border-t border-gray-100 mt-1">
                  <button onClick={handleLogout} className="text-red-600">
                    Sair
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <Link
              href="/login"
              className="hover:opacity-70 transition-opacity hidden md:block"
            >
              <FaUser className="text-sm " />
            </Link>
          )}

          {/* Cart */}
          <CartElement isHeaderWhite={isHeaderWhite} />
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

      {/* Side Menu */}
      <div
        className={`fixed inset-y-0 left-0 w-full max-w-xs sm:max-w-sm bg-white z-50 shadow-2xl transition-transform duration-500 cubic-bezier(0.19, 1, 0.22, 1) transform ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } xl:hidden flex flex-col overflow-y-auto`}
      >
        <div className="flex justify-between items-center p-6 sm:p-8">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
            <span className="font-thin text-2xl tracking-[0.2em] text-black uppercase">
              MARCOS
            </span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-gray-400 hover:text-black transition-colors p-2 -mr-2"
            aria-label="Close menu"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <nav className="flex flex-col px-6 sm:px-8 gap-8 text-base font-medium tracking-wide text-gray-800">
          {headerNavLinks.map((navLink) => {
            // Se tem mega menu, renderiza com expansão
            if (navLink.hasMegaMenu) {
              const navMenuData = menuData[navLink.id as keyof typeof menuData];
              const isExpanded = expandedMobileItem === navLink.id;

              return (
                <div
                  key={navLink.id}
                  className="border-b border-gray-50 last:border-0 pb-4 last:pb-0"
                >
                  <button
                    onClick={() =>
                      setExpandedMobileItem(isExpanded ? null : navLink.id)
                    }
                    className={`flex items-center justify-between w-full hover:text-black transition-colors uppercase text-sm font-bold tracking-widest ${
                      isExpanded ? "text-black" : "text-gray-600"
                    }`}
                  >
                    <span>{navLink.name}</span>
                    <span
                      className={`transform transition-transform duration-300 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    >
                      <FaChevronDown className="text-xs" />
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out overflow-hidden ${
                      isExpanded
                        ? "grid-rows-[1fr] opacity-100 mt-4"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="min-h-0 flex flex-col gap-4 pl-2">
                      {navMenuData && (
                        <>
                          {/* Left Links */}
                          <div className="flex flex-col gap-3">
                            {navMenuData.leftLinks.map((link) => (
                              <Link
                                key={link.name}
                                href={link.href}
                                className="text-gray-500 hover:text-black text-sm transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {link.name}
                              </Link>
                            ))}
                          </div>

                          {/* Categories */}
                          {navMenuData.categories.map((category) => (
                            <div key={category.title} className="mt-2">
                              <span className="font-semibold text-xs text-black uppercase tracking-wider mb-3 block">
                                {category.title}
                              </span>
                              <div className="flex flex-col gap-2 pl-2 border-l border-gray-100">
                                {category.items.map((item) => (
                                  <Link
                                    key={item.name}
                                    href={item.href}
                                    className="text-gray-500 hover:text-black text-sm transition-colors"
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
                className="hover:text-black transition-colors uppercase text-sm font-bold tracking-widest text-gray-600 border-b border-gray-50 pb-4 last:border-0 last:pb-0"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {navLink.name}
              </Link>
            );
          })}

          <div className="mt-4 pt-6 border-t border-gray-100 flex flex-col gap-4 text-sm text-gray-600">
            <Link
              href="/wishlist"
              className="flex items-center gap-3 hover:text-black transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FaHeart className="text-gray-400" />
              <span>Wishlist</span>
              {wishQuantity > 0 && (
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                  {wishQuantity}
                </span>
              )}
            </Link>
            {!session?.user ? (
              <Link
                href="/login"
                className="flex items-center gap-3 hover:text-black transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FaUser className="text-gray-400" /> Login / Register
              </Link>
            ) : (
              <Link
                href="/user"
                className="flex items-center gap-3 hover:text-black transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FaUser className="text-gray-400" /> My Account
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
