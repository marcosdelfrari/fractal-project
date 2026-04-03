// *********************
// Role of the component: Example component demonstrating redirect usage
// Name of the component: RedirectExample.tsx
// Version: 1.0
// Component call: <RedirectExample />
// Input parameters: no input parameters
// Output: Component demonstrating redirect functionality
// *********************

"use client";

import React from "react";
import { useRedirectManager } from "@/hooks/useRedirectManager";
import { useSession } from "next-auth/react";

const RedirectExample = () => {
  const {
    redirectToDashboard,
    redirectToLogin,
    redirectToPromo,
    redirectToHome,
    redirectToShop,
    redirectWithAuthCheck,
    canAccessRoute,
    getAppropriateRedirect,
    isAuthenticated,
    userRole,
  } = useRedirectManager();

  const { data: session } = useSession();

  const handleProtectedAction = () => {
    // Example: Try to access cart
    redirectWithAuthCheck("/carrinho");
  };

  const handleAdminAction = () => {
    // Example: Try to access admin panel
    redirectWithAuthCheck("/admin");
  };

  const handleUserAction = () => {
    // Example: Try to access user dashboard
    redirectWithAuthCheck("/usuario");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        🔄 Exemplo de Sistema de Redirecionamento
      </h2>

      {/* Current Status */}
      <div className="bg-[#E3E1D6] rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">Status Atual:</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Autenticado:</span>
            <span
              className={`ml-2 font-semibold ${
                isAuthenticated ? "text-green-600" : "text-red-600"
              }`}
            >
              {isAuthenticated ? "✅ Sim" : "❌ Não"}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Função:</span>
            <span
              className={`ml-2 font-semibold ${
                userRole === "admin"
                  ? "text-purple-600"
                  : userRole === "user"
                    ? "text-blue-600"
                    : "text-gray-600"
              }`}
            >
              {userRole}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Redirecionamento Apropriado:</span>
            <span className="ml-2 font-semibold text-gray-800">
              {getAppropriateRedirect()}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Pode Acessar /admin:</span>
            <span
              className={`ml-2 font-semibold ${
                canAccessRoute("/admin") ? "text-green-600" : "text-red-600"
              }`}
            >
              {canAccessRoute("/admin") ? "✅" : "❌"}
            </span>
          </div>
        </div>
      </div>

      {/* Redirect Actions */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700">
            Redirecionamentos Básicos:
          </h3>

          <button
            onClick={() => redirectToHome()}
            className="w-full px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            🏠 Ir para Home
          </button>

          <button
            onClick={() => redirectToPromo()}
            className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            🎯 Ir para Promo
          </button>

          <button
            onClick={() => redirectToShop()}
            className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            🛒 Ir para Loja
          </button>

          <button
            onClick={() => redirectToDashboard()}
            className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            📊 Ir para Dashboard
          </button>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700">
            Redirecionamentos com Verificação:
          </h3>

          <button
            onClick={handleProtectedAction}
            className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            🛒 Acessar Carrinho
          </button>

          <button
            onClick={handleUserAction}
            className="w-full px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            👤 Acessar Área do Usuário
          </button>

          <button
            onClick={handleAdminAction}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            👑 Acessar Admin
          </button>

          <button
            onClick={() => redirectToLogin("/carrinho")}
            className="w-full px-4 py-2 bg-[#E3E1D6]0 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            🔐 Fazer Login (com retorno)
          </button>
        </div>
      </div>

      {/* Route Access Matrix */}
      <div className="bg-[#E3E1D6] rounded-lg p-4">
        <h3 className="font-semibold text-gray-700 mb-3">
          Matriz de Acesso às Rotas:
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Rota</th>
                <th className="text-center py-2">Visitante</th>
                <th className="text-center py-2">Usuário</th>
                <th className="text-center py-2">Admin</th>
              </tr>
            </thead>
            <tbody>
              {[
                { route: "/", name: "Home" },
                { route: "/promo", name: "Promo" },
                { route: "/loja", name: "Loja" },
                { route: "/carrinho", name: "Carrinho" },
                { route: "/compra", name: "Compra" },
                { route: "/wishlist", name: "Lista de Desejos" },
                { route: "/profile", name: "Perfil" },
                { route: "/usuario", name: "Área do Usuário" },
                { route: "/admin", name: "Admin" },
                { route: "/login", name: "Login" },
                { route: "/register", name: "Registro" },
              ].map(({ route, name }) => (
                <tr key={route} className="border-b">
                  <td className="py-2 font-mono text-xs">{route}</td>
                  <td className="text-center py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        canAccessRoute(route)
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {canAccessRoute(route) ? "✅" : "❌"}
                    </span>
                  </td>
                  <td className="text-center py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        canAccessRoute(route)
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {canAccessRoute(route) ? "✅" : "❌"}
                    </span>
                  </td>
                  <td className="text-center py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        canAccessRoute(route)
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {canAccessRoute(route) ? "✅" : "❌"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Debug Info */}
      {session && (
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-700 mb-2">
            Informações da Sessão:
          </h3>
          <pre className="text-xs text-gray-600 overflow-x-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default RedirectExample;
