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
      icon: <MdDashboard className="text-xl" />,
      label: "Dashboard",
    },
    {
      href: "/admin/orders",
      icon: <FaBagShopping className="text-xl" />,
      label: "Orders",
    },
    {
      href: "/admin/products",
      icon: <FaTable className="text-xl" />,
      label: "Products",
    },
    {
      href: "/admin/categories",
      icon: <MdCategory className="text-xl" />,
      label: "Categories",
    },
    {
      href: "/admin/users",
      icon: <FaRegUser className="text-xl" />,
      label: "Users",
    },
    {
      href: "/admin/settings",
      icon: <FaGear className="text-xl" />,
      label: "Settings",
    },
  ];

  return (
    <div className="xl:w-64 w-full bg-white border-r border-gray-200 min-h-screen flex flex-col pt-5 pb-10">
      <div className="px-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Admin</h2>
      </div>
      <nav className="flex flex-col gap-1 px-3">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex gap-x-3 items-center py-3 px-4 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span
                  className={`${
                    isActive
                      ? "text-blue-600"
                      : "text-gray-400 group-hover:text-gray-600"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="text-sm">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default DashboardSidebar;
