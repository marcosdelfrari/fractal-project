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
            className={`text-xl ${isHeaderWhite ? "text-black" : "text-white"}`}
            onClick={() => setIsMobileMenuOpen(true)}
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
              CASA
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
      <div
        className={`fixed inset-0 bg-white z-50 transition-transform duration-300 ease-in-out transform ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } xl:hidden flex flex-col overflow-y-auto`}
      >
        <div className="flex justify-between items-center p-6 border-b">
          <Link href="/">
            <span className="font-thin text-2xl tracking-widest text-black">
              CASA
            </span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-2xl text-black"
          >
            <FaTimes />
          </button>
        </div>

        <nav className="flex flex-col p-6 gap-6 text-lg font-bold uppercase tracking-widest text-black">
          {headerNavLinks.map((navLink) => {
            // Se tem mega menu, renderiza com expansão
            if (navLink.hasMegaMenu) {
              const navMenuData = menuData[navLink.id as keyof typeof menuData];
              return (
                <div key={navLink.id}>
                  <button
                    onClick={() =>
                      setExpandedMobileItem(
                        expandedMobileItem === navLink.id ? null : navLink.id
                      )
                    }
                    className="flex items-center justify-between w-full hover:opacity-70"
                  >
                    <span>{navLink.name}</span>
                    {expandedMobileItem === navLink.id ? (
                      <FaChevronUp className="text-sm" />
                    ) : (
                      <FaChevronDown className="text-sm" />
                    )}
                  </button>
                  {expandedMobileItem === navLink.id && navMenuData && (
                    <div className="pl-4 pt-4 flex flex-col gap-3 text-sm font-normal normal-case">
                      {/* Left Links */}
                      {navMenuData.leftLinks.map((link) => (
                        <Link
                          key={link.name}
                          href={link.href}
                          className="hover:opacity-70"
                        >
                          {link.name}
                        </Link>
                      ))}
                      {/* Categories */}
                      {navMenuData.categories.map((category) => (
                        <div key={category.title} className="mt-2">
                          <span className="font-bold uppercase text-xs text-gray-500 mb-2 block">
                            {category.title}
                          </span>
                          <div className="flex flex-col gap-2 pl-2 border-l-2 border-gray-100">
                            {category.items.map((item) => (
                              <Link
                                key={item.name}
                                href={item.href}
                                className="hover:opacity-70"
                              >
                                {item.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            // Se não tem mega menu, renderiza link simples
            return (
              <Link
                key={navLink.id}
                href={navLink.href}
                className="hover:opacity-70"
              >
                {navLink.name}
              </Link>
            );
          })}

          <div className="border-t pt-6 mt-2 flex flex-col gap-4">
            <Link
              href="/wishlist"
              className="flex items-center gap-2 hover:opacity-70 font-normal text-base normal-case"
            >
              <FaHeart /> Wishlist {wishQuantity > 0 && `(${wishQuantity})`}
            </Link>
            {!session?.user ? (
              <Link
                href="/login"
                className="flex items-center gap-2 hover:opacity-70 font-normal text-base normal-case"
              >
                <FaUser /> Login / Register
              </Link>
            ) : (
              <Link
                href="/user"
                className="flex items-center gap-2 hover:opacity-70 font-normal text-base normal-case"
              >
                <FaUser /> My Account
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
