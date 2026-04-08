"use client";

import type { ReactNode } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import {
  FaShoppingBag,
  FaHeart,
  FaMapMarkerAlt,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";

export type UserAccountTab = "orders" | "addresses" | "profile" | "wishlist";

const menuItems: { id: UserAccountTab; label: string; icon: ReactNode }[] =
  [
    { id: "orders", label: "Meus Pedidos", icon: <FaShoppingBag /> },
    { id: "addresses", label: "Endereços", icon: <FaMapMarkerAlt /> },
    { id: "wishlist", label: "Lista de Desejos", icon: <FaHeart /> },
    { id: "profile", label: "Meu Perfil", icon: <FaUser /> },
  ];

export interface UserAccountShellProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  activeTab: UserAccountTab;
  onTabChange: (tab: UserAccountTab) => void;
  children: ReactNode;
}

export default function UserAccountShell({
  user,
  activeTab,
  onTabChange,
  children,
}: UserAccountShellProps) {
  return (
    <div className="min-h-screen bg-[#E3E1D6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="hidden md:block md:w-72 flex-shrink-0">
            <div className="bg-white rounded-3xl border-2 border-black overflow-hidden sticky top-24">
              <div className="p-8 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#E3E1D6] rounded-full text-gray-900">
                    <FaUser size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 font-light uppercase tracking-widest">
                      Bem-vindo
                    </p>
                    <p className="font-medium text-gray-900 truncate">
                      {user.name || "Usuário"}
                    </p>
                  </div>
                </div>
              </div>

              <nav className="p-4">
                <ul className="space-y-1">
                  {menuItems.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => onTabChange(item.id)}
                        className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 ${
                          activeTab === item.id
                            ? "bg-[#E3E1D6] text-gray-900 border border-gray-200 "
                            : "text-gray-600 hover:bg-[#E3E1D6] hover:text-gray-900 border border-transparent"
                        }`}
                      >
                        <span
                          className={`flex items-center justify-center w-8 h-8 rounded-full ${activeTab === item.id ? "bg-black text-white" : "bg-gray-100 text-gray-500"}`}
                        >
                          {item.icon}
                        </span>
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-sm font-medium text-gray-600 hover:bg-[#E3E1D6] hover:text-gray-900 border border-transparent hover:border-gray-200 transition-all duration-300"
                  >
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500">
                      <FaSignOutAlt />
                    </span>
                    Sair
                  </button>
                </div>
              </nav>
            </div>
          </aside>

          <main className="flex-1 min-w-0 pb-24 md:pb-0">{children}</main>
        </div>
      </div>

      <div className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-md rounded-full border-2 border-black bg-white/95 backdrop-blur-sm px-2 py-2.5 flex justify-between items-center overflow-x-auto gap-2">
        <Link
          href="/"
          className="relative flex flex-col items-center justify-center flex-shrink-0 w-12 h-12 rounded-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 transition-all duration-200"
        >
          <span className="transition-colors duration-200">
            <svg
              stroke="currentColor"
              fill="none"
              strokeWidth="2"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
              height="22"
              width="22"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </span>
        </Link>
        {[
          { id: "orders", icon: <FaShoppingBag size={22} />, tab: "orders" as const },
          {
            id: "addresses",
            icon: <FaMapMarkerAlt size={22} />,
            tab: "addresses" as const,
          },
          { id: "wishlist", icon: <FaHeart size={22} />, tab: "wishlist" as const },
          { id: "profile", icon: <FaUser size={22} />, tab: "profile" as const },
        ].map((item) => {
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.tab)}
              className={`relative flex flex-col items-center justify-center flex-shrink-0 w-12 h-12 rounded-full transition-all duration-200 ${
                isActive
                  ? "bg-zinc-900 text-white "
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
              }`}
            >
              <span className="transition-colors duration-200">{item.icon}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
