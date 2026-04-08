"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import OrderCard from "@/components/OrderCard";
import Pagination from "@/components/Pagination";
import { FaSpinner, FaShoppingBag } from "react-icons/fa";
import Link from "next/link";

interface OrderProduct {
  id: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    mainImage: string;
    price: number;
    slug: string;
  };
}

interface Order {
  id: string;
  name: string;
  lastname: string;
  phone: string;
  email: string;
  company?: string;
  address: {
    street: string;
    apartment?: string;
    postalCode: string;
    city: string;
    country: string;
  };
  status: string;
  orderNotice?: string;
  total: number;
  dateTime: string;
  products: OrderProduct[];
}

interface OrdersResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function UserOrders() {
  const { data: session } = useSession();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buildQueryParams = (page: number) => {
    return new URLSearchParams({
      page: page.toString(),
      limit: "10",
    }).toString();
  };

  const resolveBackendUserId = async () => {
    if (session?.user?.id) {
      return session.user.id;
    }
    const me = await apiClient.get("/api/users/me", { cache: "no-store" });
    if (!me.ok) return null;
    const data = await me.json();
    return data?.id ?? null;
  };

  const fetchOrdersByUserId = async (userId: string, page: number) => {
    const query = buildQueryParams(page);
    return apiClient.get(`/api/users/${userId}/orders?${query}`);
  };

  const fetchOrders = async (page = 1) => {
    if (!session?.user) return;

    try {
      setIsLoading(true);
      setError(null);

      let backendUserId = await resolveBackendUserId();
      let response: Response | null = null;

      if (backendUserId) {
        response = await fetchOrdersByUserId(backendUserId, page);
      }

      if (!response || !response.ok) {
        const status = response?.status;
        let apiMessage = "";

        try {
          const body = response ? await response.json() : null;
          apiMessage =
            body?.message || body?.error || body?.details || body?.msg || "";
        } catch {
          // Ignora parse de body inválido
        }

        throw new Error(
          apiMessage
            ? `Falha ao carregar pedidos (${status ?? "sem status"}): ${apiMessage}`
            : `Falha ao carregar pedidos (${status ?? "sem status"})`,
        );
      }

      const data: OrdersResponse = await response.json();

      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Erro ao buscar pedidos:", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar pedidos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchOrders();
    }
  }, [session?.user?.id]);

  const handlePageChange = (page: number) => {
    fetchOrders(page);
  };

  const handleViewDetails = (orderId: string) => {
    router.push(`/usuario/pedidos/${orderId}`);
  };

  if (isLoading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <FaSpinner className="text-4xl text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Erro ao carregar pedidos
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-3xl font-light text-gray-900 tracking-tight">
          Meus Pedidos
        </h2>
        <p className="text-gray-500 font-light mt-1">
          Acompanhe o histórico dos seus pedidos e seu status.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-black p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-light text-gray-900 mb-2">
            Nenhum pedido encontrado
          </h3>
          <p className="text-gray-500 font-light mb-8">
            Você ainda não fez nenhum pedido.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-black px-8 py-3 text-sm uppercase tracking-wider font-medium text-white hover:bg-zinc-800 transition-all duration-300"
          >
            Fazer Compras
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-6 mb-8">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}

          <div className="mt-8 bg-white rounded-3xl border-2 border-black p-8">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-6 mb-6">
              <div className="p-3 bg-[#E3E1D6] rounded-full text-gray-900">
                <FaShoppingBag size={16} />
              </div>
              <h3 className="text-lg font-light tracking-widest text-gray-900 uppercase">
                Resumo dos Pedidos
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {pagination.total}
                </p>
                <p className="text-sm text-gray-600">Total de Pedidos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {
                    orders.filter((order) => order.status === "delivered")
                      .length
                  }
                </p>
                <p className="text-sm text-gray-600">Entregues</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {
                    orders.filter((order) => order.status === "processing")
                      .length
                  }
                </p>
                <p className="text-sm text-gray-600">Em Processamento</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
