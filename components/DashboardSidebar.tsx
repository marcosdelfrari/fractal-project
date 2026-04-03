"use client";

import React, { useEffect, useState } from "react";
import { MdDashboard, MdCategory } from "react-icons/md";
import {
  FaTable,
  FaRegUser,
  FaGear,
  FaBagShopping,
  FaXmark,
} from "react-icons/fa6";
import Link from "next/link";
import { usePathname } from "next/navigation";

const DashboardSidebar = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* The original mobile menu button was replaced by the bottom navigation */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-white border-r border-gray-100 flex flex-col pt-8 pb-8 transition-transform duration-300 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 mb-8 flex items-center justify-between">
          <h2 className="text-xs font-light tracking-[0.3em] text-gray-900 uppercase">
            Painel Admin
          </h2>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-gray-500 hover:text-gray-900 transition-colors"
            aria-label="Fechar menu admin"
          >
            <FaXmark size={18} />
          </button>
        </div>

        <nav className="flex flex-col gap-2 px-4">
          {sidebarItems.map((item) => {
            const isActive =
              item.href === "/admin/settings"
                ? pathname === "/admin/settings" ||
                  pathname.startsWith("/admin/settings/")
                : pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex gap-x-4 items-center py-4 px-4 rounded-2xl transition-all duration-300 group ${
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
      </aside>

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
        <div className="mt-auto px-10">
          <div className="p-6 bg-[#E3E1D6] rounded-[2rem] border border-gray-100">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-light">
              Versão do Sistema
            </p>
            <p className="text-xs font-medium text-gray-900">v2.4.0 - PRO</p>
          </div>
        </div>
      </div>

      {/* Admin Mobile Bottom Navigation (Pill Style) */}
      <div className="lg:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-md rounded-full border border-zinc-200/80 bg-white/95 backdrop-blur-sm shadow-[0_12px_30px_rgba(0,0,0,0.08)] px-2 py-2.5 flex justify-between items-center overflow-x-auto gap-2">
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
              className={`relative flex flex-col items-center justify-center flex-shrink-0 w-12 h-12 rounded-2xl transition-all duration-200 ${
                isActive
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
              }`}
              aria-label={item.label}
            >
              <span className="transition-colors duration-200">
                {item.icon}
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
};

export default DashboardSidebar;
