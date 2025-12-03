"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import {
  FaArrowLeft,
  FaSpinner,
  FaShoppingBag,
  FaCheckCircle,
  FaTruck,
  FaClock,
  FaTimesCircle,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaBuilding,
  FaCalendarAlt,
  FaReceipt,
  FaPrint,
} from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";

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
  adress: string;
  apartment?: string;
  postalCode: string;
  city: string;
  country: string;
  status: string;
  orderNotice?: string;
  total: number;
  dateTime: string;
  products: OrderProduct[];
}

export default function OrderDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!session?.user?.id || !orderId) return;

      try {
        setIsLoading(true);
        setError(null);

        // First, get the order details
        const orderResponse = await apiClient.get(`/api/orders/${orderId}`);

        if (!orderResponse.ok) {
          throw new Error("Falha ao carregar detalhes do pedido");
        }

        const orderData = await orderResponse.json();

        // Then, get the products for this order
        const productsResponse = await apiClient.get(
          `/api/order-product/${orderId}`
        );

        if (!productsResponse.ok) {
          throw new Error("Falha ao carregar produtos do pedido");
        }

        const productsData = await productsResponse.json();

        // Combine order and products data
        const combinedOrder = {
          ...orderData,
          products: productsData.map((item: any) => ({
            id: item.id,
            quantity: item.quantity,
            product: item.product,
          })),
        };

        setOrder(combinedOrder);
      } catch (err) {
        console.error("Erro ao buscar detalhes do pedido:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Erro ao carregar detalhes do pedido"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.id && orderId) {
      fetchOrderDetails();
    }
  }, [session?.user?.id, orderId]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return <FaCheckCircle className="text-green-500" />;
      case "shipped":
        return <FaTruck className="text-blue-500" />;
      case "processing":
        return <FaClock className="text-yellow-500" />;
      case "cancelled":
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "shipped":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "Entregue";
      case "shipped":
        return "Enviado";
      case "processing":
        return "Processando";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Show loading state
  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-4xl text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando detalhes do pedido...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  Erro ao carregar pedido
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error || "Pedido não encontrado"}</p>
                </div>
                <div className="mt-4">
                  <Link
                    href="/user/pedidos"
                    className="text-sm font-medium text-red-600 hover:text-red-500"
                  >
                    ← Voltar aos Pedidos
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalItems = order.products.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 print:bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 print:hidden">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/user/pedidos"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FaArrowLeft />
              Voltar aos Pedidos
            </Link>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Detalhes do Pedido
              </h1>
              <p className="mt-2 text-gray-600">
                Pedido #{order.id.slice(-8).toUpperCase()}
              </p>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FaPrint />
              Imprimir
            </button>
          </div>
        </div>

        {/* Order Status */}
        <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaShoppingBag className="text-blue-600 text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Status do Pedido
                </h2>
                <p className="text-sm text-gray-500">
                  Pedido realizado em {formatDate(order.dateTime)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                  order.status
                )}`}
              >
                <span className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  {getStatusText(order.status)}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Products */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Produtos ({totalItems} {totalItems === 1 ? "item" : "itens"})
              </h3>
              <div className="space-y-4">
                {order.products.map((orderProduct) => (
                  <div
                    key={orderProduct.id}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image
                        src={
                          orderProduct.product.mainImage
                            ? `/${orderProduct.product.mainImage}`
                            : "/product_placeholder.jpg"
                        }
                        alt={orderProduct.product.title}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {orderProduct.product.title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Quantidade: {orderProduct.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(
                          orderProduct.product.price * orderProduct.quantity
                        )}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(orderProduct.product.price)} cada
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Notice */}
            {order.orderNotice && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Observações do Pedido
                </h3>
                <p className="text-gray-700">{order.orderNotice}</p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Informações do Cliente
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-gray-400" />
                  <span className="text-sm text-gray-700">{order.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaPhone className="text-gray-400" />
                  <span className="text-sm text-gray-700">{order.phone}</span>
                </div>
                {order.company && (
                  <div className="flex items-center gap-3">
                    <FaBuilding className="text-gray-400" />
                    <span className="text-sm text-gray-700">
                      {order.company}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Endereço de Entrega
              </h3>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <FaMapMarkerAlt className="text-gray-400 mt-1" />
                  <div className="text-sm text-gray-700">
                    <p>
                      {order.name} {order.lastname}
                    </p>
                    <p>{order.adress}</p>
                    {order.apartment && <p>Apto {order.apartment}</p>}
                    <p>
                      {order.city}, {order.postalCode}
                    </p>
                    <p>{order.country}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Resumo do Pedido
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FaCalendarAlt className="text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Data do Pedido
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(order.dateTime)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaReceipt className="text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Total</p>
                    <p className="text-lg font-bold text-blue-600">
                      {formatCurrency(order.total)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
