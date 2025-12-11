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

// Menu Data Structure
const MENU_DATA = {
  men: {
    leftLinks: [
      { name: "New In", href: "/men/new-in" },
      { name: "Exclusives", href: "/men/exclusives" },
      { name: "Gifting", href: "/men/gifting" },
      { name: "Beach Club", href: "/men/beach-club" },
      { name: "Ski Capsule", href: "/men/ski-capsule" },
      { name: "Autumn Winter 2025", href: "/men/aw25" },
      { name: "View all", href: "/men" },
    ],
    categories: [
      {
        title: "READY-TO-WEAR",
        items: [
          { name: "Shirts", href: "/men/shirts" },
          { name: "T-Shirts", href: "/men/t-shirts" },
          { name: "Knitwear", href: "/men/knitwear" },
          { name: "Après Sport", href: "/men/apres-sport" },
          { name: "Denim", href: "/men/denim" },
          { name: "Outerwear", href: "/men/outerwear" },
          { name: "Tailoring", href: "/men/tailoring" },
          { name: "Trousers & Shorts", href: "/men/trousers" },
          { name: "Swimwear", href: "/men/swimwear" },
        ],
      },
      {
        title: "ACCESSORIES",
        items: [
          { name: "All Shoes", href: "/men/shoes" },
          { name: "Sneakers", href: "/men/sneakers" },
          { name: "Moccasins", href: "/men/moccasins" },
          { name: "Eyewear", href: "/men/eyewear" },
          { name: "Jewellery", href: "/men/jewellery" },
          { name: "Bags", href: "/men/bags" },
          { name: "Hats", href: "/men/hats" },
          { name: "Socks", href: "/men/socks" },
          { name: "Belts", href: "/men/belts" },
          { name: "Silk Scarves", href: "/men/scarves" },
          { name: "Lifestyle", href: "/men/lifestyle" },
          { name: "Charms", href: "/men/charms" },
        ],
      },
    ],
    featured: {
      image: "/hero.webp",
      title: "Pour Homme",
      subtitle: "Pour Homme",
      linkText: "Discover",
      linkHref: "/men/discover",
    },
  },
  women: {
    leftLinks: [
      { name: "New In", href: "/women/new-in" },
      { name: "Exclusives", href: "/women/exclusives" },
      { name: "Gifting", href: "/women/gifting" },
      { name: "Beach Club", href: "/women/beach-club" },
      { name: "Ski Capsule", href: "/women/ski-capsule" },
      { name: "Autumn Winter 2025", href: "/women/aw25" },
      { name: "View all", href: "/women" },
    ],
    categories: [
      {
        title: "READY-TO-WEAR",
        items: [
          { name: "Dresses", href: "/women/dresses" },
          { name: "Tops", href: "/women/tops" },
          { name: "Knitwear", href: "/women/knitwear" },
          { name: "Skirts", href: "/women/skirts" },
          { name: "Denim", href: "/women/denim" },
          { name: "Outerwear", href: "/women/outerwear" },
          { name: "Tailoring", href: "/women/tailoring" },
          { name: "Trousers", href: "/women/trousers" },
          { name: "Swimwear", href: "/women/swimwear" },
        ],
      },
      {
        title: "ACCESSORIES",
        items: [
          { name: "All Shoes", href: "/women/shoes" },
          { name: "Heels", href: "/women/heels" },
          { name: "Sneakers", href: "/women/sneakers" },
          { name: "Eyewear", href: "/women/eyewear" },
          { name: "Jewellery", href: "/women/jewellery" },
          { name: "Bags", href: "/women/bags" },
          { name: "Scarves", href: "/women/scarves" },
        ],
      },
    ],
    featured: {
      image: "/hero.webp",
      title: "Pour Femme",
      subtitle: "Pour Femme",
      linkText: "Discover",
      linkHref: "/women/discover",
    },
  },
  // Default empty/fallback for others to prevent errors if hovered
  default: null,
};

const Header = () => {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const { wishlist, setWishlist, wishQuantity } = useWishlistStore();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileItem, setExpandedMobileItem] = useState<string | null>(
    null
  );

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

  useEffect(() => {
    getUserByEmail();
  }, [session?.user?.email, wishlist.length]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setExpandedMobileItem(null);
  }, [pathname]);

  const isHomepage = pathname === "/";
  const isHeaderWhite = !isHomepage || hoveredItem !== null;

  return (
    <header
      className={`${
        isHomepage
          ? "absolute top-0 w-full z-50 transition-all duration-300"
          : "bg-white text-black relative shadow-md"
      } ${isHeaderWhite ? "bg-white text-black" : "bg-transparent text-white"}`}
      onMouseLeave={() => setHoveredItem(null)}
    >
      {!isHomepage && <HeaderTop />}

      {/* Main Header Content */}
      {pathname.startsWith("/admin") === false && (
        <>
          <div
            className={`flex items-center justify-between px-8 py-6 max-w-screen-2xl mx-auto relative ${
              !isHomepage ? "h-24" : ""
            }`}
          >
            {/* LEFT: Menu Links (Visible on Desktop) */}
            <nav className="hidden xl:flex gap-6 text-xs font-bold uppercase tracking-widest h-full items-center">
              <Link
                href="/new-arrivals"
                className="hover:opacity-70 transition-opacity py-6"
                onMouseEnter={() => setHoveredItem(null)}
              >
                New Arrivals
              </Link>
              <Link
                href="/men"
                className={`transition-opacity py-6 border-b-2 ${
                  hoveredItem === "men"
                    ? "border-current opacity-100"
                    : "border-transparent hover:opacity-70"
                }`}
                onMouseEnter={() => setHoveredItem("men")}
              >
                Men
              </Link>
              <Link
                href="/women"
                className={`transition-opacity py-6 border-b-2 ${
                  hoveredItem === "women"
                    ? "border-current opacity-100"
                    : "border-transparent hover:opacity-70"
                }`}
                onMouseEnter={() => setHoveredItem("women")}
              >
                Women
              </Link>
              <Link
                href="/kidswear"
                className="hover:opacity-70 transition-opacity py-6"
                onMouseEnter={() => setHoveredItem(null)}
              >
                Kidswear
              </Link>
              <Link
                href="/fashion-shows"
                className="hover:opacity-70 transition-opacity py-6"
                onMouseEnter={() => setHoveredItem(null)}
              >
                Fashion Shows
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <div className="xl:hidden">
              <button
                className={`text-xl ${
                  isHeaderWhite ? "text-black" : "text-white"
                }`}
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
            data={hoveredItem ? (MENU_DATA as any)[hoveredItem] : null}
          />
        </>
      )}

      {/* Admin Header (Kept as is, just wrapped in condition) */}
      {pathname.startsWith("/admin") === true && (
        <div className="flex justify-between h-32 bg-white items-center px-16 text-black">
          <Link href="/">
            <Image
              src="/logo v1.png"
              width={130}
              height={130}
              alt="singitronic logo"
              className="w-56 h-auto"
            />
          </Link>
          <div className="flex gap-x-5 items-center">
            <FaBell className="text-xl" />
            {/* ... Admin User Dropdown ... */}
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="w-10">
                <Image
                  src="/randomuser.jpg"
                  alt="admin profile"
                  width={30}
                  height={30}
                  className="w-full h-full rounded-full"
                />
              </div>
              <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                <li>
                  <Link href="/admin">Dashboard</Link>
                </li>
                <li onClick={handleLogout}>
                  <a>Logout</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
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
          <Link href="/new-arrivals" className="hover:opacity-70">
            New Arrivals
          </Link>

          {/* Mobile Menu Item: Men */}
          <div>
            <button
              onClick={() =>
                setExpandedMobileItem(
                  expandedMobileItem === "men" ? null : "men"
                )
              }
              className="flex items-center justify-between w-full hover:opacity-70"
            >
              <span>Men</span>
              {expandedMobileItem === "men" ? (
                <FaChevronUp className="text-sm" />
              ) : (
                <FaChevronDown className="text-sm" />
              )}
            </button>
            {expandedMobileItem === "men" && (
              <div className="pl-4 pt-4 flex flex-col gap-3 text-sm font-normal normal-case">
                {/* Left Links */}
                {MENU_DATA.men.leftLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="hover:opacity-70"
                  >
                    {link.name}
                  </Link>
                ))}
                {/* Categories */}
                {MENU_DATA.men.categories.map((category) => (
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

          {/* Mobile Menu Item: Women */}
          <div>
            <button
              onClick={() =>
                setExpandedMobileItem(
                  expandedMobileItem === "women" ? null : "women"
                )
              }
              className="flex items-center justify-between w-full hover:opacity-70"
            >
              <span>Women</span>
              {expandedMobileItem === "women" ? (
                <FaChevronUp className="text-sm" />
              ) : (
                <FaChevronDown className="text-sm" />
              )}
            </button>
            {expandedMobileItem === "women" && (
              <div className="pl-4 pt-4 flex flex-col gap-3 text-sm font-normal normal-case">
                {/* Left Links */}
                {MENU_DATA.women.leftLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="hover:opacity-70"
                  >
                    {link.name}
                  </Link>
                ))}
                {/* Categories */}
                {MENU_DATA.women.categories.map((category) => (
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

          <Link href="/kidswear" className="hover:opacity-70">
            Kidswear
          </Link>
          <Link href="/fashion-shows" className="hover:opacity-70">
            Fashion Shows
          </Link>

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
