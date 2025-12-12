"use client";

// *********************
// Role of the component: Sidebar for user dashboard with navigation
// Name of the component: UserSidebar.tsx
// Version: 1.0
// Component call: <UserSidebar currentPath={currentPath} />
// Input parameters: UserSidebarProps interface
// Output: sidebar for user dashboard page
// *********************

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaUser,
  FaShoppingBag,
  FaMapMarkerAlt,
  FaStar,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";

interface UserSidebarProps {
  className?: string;
  isMobile?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

const UserSidebar = ({
  className = "",
  isMobile = false,
  isOpen = false,
  onToggle,
}: UserSidebarProps) => {
  const pathname = usePathname();

  const navigationItems = [
    {
      href: "/user",
      label: "Dashboard",
      icon: FaHome,
      description: "Visão geral da conta",
    },
    {
      href: "/user/perfil",
      label: "Perfil",
      icon: FaUser,
      description: "Editar informações pessoais",
    },
    {
      href: "/user/pedidos",
      label: "Pedidos",
      icon: FaShoppingBag,
      description: "Histórico de compras",
    },
    {
      href: "/user/enderecos",
      label: "Endereços",
      icon: FaMapMarkerAlt,
      description: "Gerenciar endereços",
    },
    {
      href: "/user/avaliacoes",
      label: "Avaliações",
      icon: FaStar,
      description: "Minhas avaliações",
    },
  ];

  const isActive = (href: string) => {
    if (href === "/user") {
      return pathname === "/user";
    }
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    // Aqui você implementaria a lógica de logout
    console.log("Logout clicked");
    // Exemplo: signOut() do NextAuth
  };

  const sidebarContent = (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-blue-400">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Minha Conta</h2>
          {isMobile && onToggle && (
            <button
              onClick={onToggle}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>
          )}
        </div>
        <p className="text-blue-100 text-sm mt-1">
          Gerencie sua conta e pedidos
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <li key={item.href}>
                <Link href={item.href}>
                  <div
                    className={`flex items-center gap-3 px-6 py-4 text-white transition-colors duration-200 ${
                      active
                        ? "bg-blue-600 border-r-4 border-white"
                        : "hover:bg-blue-600"
                    }`}
                  >
                    <Icon
                      className={`text-xl ${
                        active ? "text-white" : "text-blue-200"
                      }`}
                    />
                    <div className="flex-1">
                      <span
                        className={`font-medium ${
                          active ? "text-white" : "text-white"
                        }`}
                      >
                        {item.label}
                      </span>
                      <p className="text-xs text-blue-200 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-blue-400">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-200 hover:text-red-100 hover:bg-red-600 rounded-lg transition-colors duration-200"
        >
          <FaSignOutAlt className="text-lg" />
          <span className="font-medium">Sair da Conta</span>
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile Toggle Button */}
        <button
          onClick={onToggle}
          className={`fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg shadow-lg ${className}`}
        >
          <FaBars className="text-xl" />
        </button>

        {/* Mobile Sidebar Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50"
            onClick={onToggle}
          />
        )}

        {/* Mobile Sidebar */}
        <div
          className={`fixed top-0 left-0 z-50 w-80 h-full bg-zinc-900 transform transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {sidebarContent}
        </div>
      </>
    );
  }

  // Desktop Sidebar
  return (
    <div className={`xl:w-80 bg-zinc-900 h-full max-xl:w-full ${className}`}>
      {sidebarContent}
    </div>
  );
};

// Componente de exemplo para demonstração
export const UserSidebarExample = () => {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  return (
    <div className="h-screen bg-gray-100">
      {/* Desktop Example */}
      <div className="hidden md:flex h-full">
        <UserSidebar />
        <div className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Conteúdo da Página
          </h1>
          <p className="text-gray-600 mt-4">
            Esta é uma demonstração do UserSidebar em desktop.
          </p>
        </div>
      </div>

      {/* Mobile Example */}
      <div className="md:hidden h-full">
        <UserSidebar
          isMobile={true}
          isOpen={isMobileOpen}
          onToggle={() => setIsMobileOpen(!isMobileOpen)}
        />
        <div className="p-8">
          <h1 className="text-2xl font-bold text-gray-900">Conteúdo Mobile</h1>
          <p className="text-gray-600 mt-4">
            Esta é uma demonstração do UserSidebar em mobile.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserSidebar;
