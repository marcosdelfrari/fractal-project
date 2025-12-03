// *********************
// Role of the component: Header component
// Name of the component: Header.tsx
// Version: 1.0
// Component call: <Header />
// Input parameters: no input parameters
// Output: Header component
// *********************

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
} from "react-icons/fa";

import CartElement from "./CartElement";
import HeartElement from "./HeartElement";
import { signOut, useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useWishlistStore } from "@/app/_zustand/wishlistStore";
import apiClient from "@/lib/api";

const Header = () => {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const { wishlist, setWishlist, wishQuantity } = useWishlistStore();

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

  return (
    <header className="bg-white">
      <HeaderTop />
      {pathname.startsWith("/admin") === false && (
        <div className="h-32 bg-white flex items-center justify-between px-16 max-[1320px]:px-16 max-md:px-6 max-lg:flex-col max-lg:gap-y-7 max-lg:justify-center max-lg:h-60 max-w-screen-2xl mx-auto">
          <Link href="/">
            <img
              src="/logo v1 svg.svg"
              width={300}
              height={300}
              alt="singitronic logo"
              className="relative right-5 max-[1023px]:w-56"
            />
          </Link>
          <SearchInput />
          <div className="flex gap-x-10 items-center">
            <HeartElement wishQuantity={wishQuantity} />
            <CartElement />

            {/* User Account Dropdown */}
            {session?.user && (
              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaUser className="text-blue-600 text-sm" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    {session.user.name || session.user.email}
                  </span>
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content z-[1] menu p-2 shadow bg-white rounded-lg w-64 border border-gray-200"
                >
                  <li className="px-3 py-2 text-sm text-gray-500 border-b border-gray-100">
                    Minha Conta
                  </li>
                  <li>
                    <Link
                      href="/user"
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded"
                    >
                      <FaUser className="text-gray-400" />
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/user/perfil"
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded"
                    >
                      <FaUser className="text-gray-400" />
                      Meu Perfil
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/user/pedidos"
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded"
                    >
                      <FaShoppingBag className="text-gray-400" />
                      Meus Pedidos
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/user/enderecos"
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded"
                    >
                      <FaMapMarkerAlt className="text-gray-400" />
                      Endereços
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/user/avaliacoes"
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded"
                    >
                      <FaStar className="text-gray-400" />
                      Avaliações
                    </Link>
                  </li>
                  <li className="border-t border-gray-100 mt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-red-50 rounded text-red-600 w-full text-left"
                    >
                      <FaSignOutAlt className="text-red-400" />
                      Sair
                    </button>
                  </li>
                </ul>
              </div>
            )}

            {/* Login Button for non-authenticated users */}
            {!session?.user && (
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaUser />
                <span className="hidden sm:block">Entrar</span>
              </Link>
            )}
          </div>
        </div>
      )}
      {pathname.startsWith("/admin") === true && (
        <div className="flex justify-between h-32 bg-white items-center px-16 max-[1320px]:px-10  max-w-screen-2xl mx-auto max-[400px]:px-5">
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
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="w-10">
                <Image
                  src="/randomuser.jpg"
                  alt="random profile photo"
                  width={30}
                  height={30}
                  className="w-full h-full rounded-full"
                />
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
              >
                <li>
                  <Link href="/admin">Dashboard</Link>
                </li>
                <li>
                  <a>Profile</a>
                </li>
                <li onClick={handleLogout}>
                  <a href="#">Logout</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
