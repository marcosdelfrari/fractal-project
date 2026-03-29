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
    <div className="xl:w-80 w-full bg-white border-r border-gray-100 min-h-screen flex flex-col pt-10 pb-10 transition-all duration-300">
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
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
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
        <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-light">Versão do Sistema</p>
          <p className="text-xs font-medium text-gray-900">v2.4.0 - PRO</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;
