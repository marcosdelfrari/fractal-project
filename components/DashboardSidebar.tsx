"use client";

import React from "react";
import { MdDashboard, MdCategory } from "react-icons/md";
import { FaTable, FaRegUser, FaGear, FaBagShopping } from "react-icons/fa6";
import Link from "next/link";
import { usePathname } from "next/navigation";

const DashboardSidebar = () => {
  const pathname = usePathname();

  const sidebarItems = [
    {
      href: "/admin",
      icon: <MdDashboard size={18} />,
      label: "DASHBOARD",
    },
    {
      href: "/admin/orders",
      icon: <FaBagShopping size={18} />,
      label: "PEDIDOS",
    },
    {
      href: "/admin/products",
      icon: <FaTable size={18} />,
      label: "PRODUTOS",
    },
    {
      href: "/admin/categories",
      icon: <MdCategory size={18} />,
      label: "CATEGORIAS",
    },
    {
      href: "/admin/users",
      icon: <FaRegUser size={18} />,
      label: "USUÁRIOS",
    },
    {
      href: "/admin/settings",
      icon: <FaGear size={18} />,
      label: "CONFIGURAÇÕES",
    },
  ];

  return (
    <>
      <div className="hidden lg:flex lg:w-80 w-full bg-white border-r border-gray-100 min-h-screen flex-col pt-10 pb-10 transition-all duration-300">
        <div className="px-10 mb-12">
          <h2 className="text-sm font-light tracking-[0.3em] text-gray-900 uppercase">
            Painel Admin
          </h2>
        </div>
        <nav className="flex flex-col gap-2 px-6">
          {sidebarItems.map((item) => {
            const isActive =
              item.href === "/admin/settings"
                ? pathname === "/admin/settings" ||
                  pathname.startsWith("/admin/settings/")
                : pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex gap-x-4 items-center py-4 px-6 rounded-2xl transition-all duration-300 group ${
                    isActive
                      ? "bg-black text-white shadow-none"
                      : "text-gray-500 hover:bg-[#E3E1D6] hover:text-gray-900"
                  }`}
                >
                  <span
                    className={`${
                      isActive
                        ? "text-white"
                        : "text-gray-400 group-hover:text-gray-900"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="text-[11px] font-medium tracking-widest uppercase">
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto px-10"></div>
      </div>

      {/* Mobile: wrapper full-width sem transform — evita bug de position:fixed com -translate (nav rolando com a página em telas com tabela). */}
      <div
        className="lg:hidden pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex justify-center px-2"
        style={{
          paddingBottom: "max(1.25rem, env(safe-area-inset-bottom, 0px))",
        }}
      >
        <nav
          className="pointer-events-auto flex w-full max-w-md items-center justify-between gap-2 overflow-x-auto rounded-full border border-zinc-200/80 bg-white/95 px-2 py-2.5 shadow-[0_12px_30px_rgba(0,0,0,0.08)] backdrop-blur-sm"
          aria-label="Navegação do painel"
        >
          {sidebarItems.map((item) => {
            const isActive =
              item.href === "/admin/settings"
                ? pathname === "/admin/settings" ||
                  pathname.startsWith("/admin/settings/")
                : pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-full transition-all duration-200 ${
                  isActive
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
                }`}
                aria-label={item.label}
              >
                <span className="transition-colors duration-200">{item.icon}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default DashboardSidebar;
