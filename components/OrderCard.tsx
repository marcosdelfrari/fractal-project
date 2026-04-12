// *********************
// Role of the component: Order card component for displaying order information
// Name of the component: OrderCard.tsx
// Version: 1.0
// Component call: <OrderCard order={order} onViewDetails={onViewDetails} />
// Input parameters: OrderCardProps interface
// Output: order card component
// *********************

import React from "react";
import Image from "next/image";
import {
  FaEye,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaShoppingBag,
  FaCheckCircle,
  FaClock,
  FaTruck,
  FaTimesCircle,
  FaStore,
} from "react-icons/fa";
import { productImageUnoptimized, productMainImageUrl } from "@/lib/imageUtils";
import {
  getOrderStatusBadgeClasses,
  getOrderStatusLabel,
  normalizeOrderStatus,
} from "@/lib/orderStatusDisplay";

interface Product {
  id: string;
  title: string;
  mainImage: string;
  price: number;
  slug: string;
}

interface OrderProduct {
  id: string;
  quantity: number;
  product: Product;
}

interface OrderAddress {
  street: string;
  apartment?: string;
  postalCode: string;
  city: string;
  country: string;
}

interface Order {
  id: string;
  name: string;
  lastname: string;
  phone: string;
  email: string;
  company?: string;
  address: OrderAddress;
  status: string;
  orderNotice?: string;
  total: number;
  dateTime: string;
  products: OrderProduct[];
}

interface OrderCardProps {
  order: Order;
  onViewDetails?: (orderId: string) => void;
  className?: string;
}

const OrderCard = ({
  order,
  onViewDetails,
  className = "",
}: OrderCardProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
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
    switch (normalizeOrderStatus(status)) {
      case "delivered":
        return <FaCheckCircle className="text-emerald-600" />;
      case "ready_for_pickup":
        return <FaStore className="text-teal-600" />;
      case "shipped":
        return <FaTruck className="text-sky-600" />;
      case "processing":
        return <FaClock className="text-blue-600" />;
      case "cancelled":
        return <FaTimesCircle className="text-red-600" />;
      case "pending":
        return <FaClock className="text-amber-600" />;
      default:
        return <FaClock className="text-gray-600" />;
    }
  };

  const totalItems = order.products.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  return (
    <div
      className={`bg-white rounded-2xl border-2 border-black transition-all duration-300 ${className}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#E3E1D6] rounded-full text-gray-900">
              <FaShoppingBag />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Pedido #{order.id.slice(-8).toUpperCase()}
              </h3>
              <p className="text-sm text-gray-500">
                {order.name} {order.lastname}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border ${getOrderStatusBadgeClasses(
                order.status,
              )}`}
            >
              <span className="flex items-center gap-1">
                {getStatusIcon(order.status)}
                {getOrderStatusLabel(order.status)}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Order Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaCalendarAlt className="text-gray-400" />
            <span>{formatDate(order.dateTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaMapMarkerAlt className="text-gray-400" />
            <span>
              {order.address.city}, {order.address.country}
            </span>
          </div>
        </div>

        {/* Products Summary */}
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">
            Produtos ({totalItems} itens)
          </h4>
          <div className="space-y-2">
            {order.products.slice(0, 3).map((item) => {
              const oImg = productMainImageUrl(item.product.mainImage);
              return (
              <div key={item.id} className="flex items-center gap-3">
                <Image
                  src={oImg}
                  alt={item.product.title}
                  width={40}
                  height={40}
                  unoptimized={productImageUnoptimized(oImg)}
                  className="rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.product.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    Qtd: {item.quantity} • {formatCurrency(item.product.price)}
                  </p>
                </div>
              </div>
            );
            })}
            {order.products.length > 3 && (
              <p className="text-xs text-gray-500 ml-13">
                +{order.products.length - 3} produto(s) adicional(is)
              </p>
            )}
          </div>
        </div>

        {/* Order Notice */}
        {order.orderNotice && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Observação:</strong> {order.orderNotice}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
          <div className="text-right">
            <p className="text-sm text-gray-500 font-light">Total do pedido</p>
            <p className="text-lg font-medium text-gray-900">
              {formatCurrency(order.total)}
            </p>
          </div>
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(order.id)}
              className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-full text-sm font-medium hover:bg-zinc-800 transition-all duration-300"
            >
              <FaEye />
              Ver Detalhes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente de exemplo com dados mockados para demonstração
export const OrderCardExample = () => {
  const exampleOrder: Order = {
    id: "order-12345678-1234-1234-1234-123456789012",
    name: "João",
    lastname: "Silva",
    phone: "11999999999",
    email: "joao@example.com",
    company: "Empresa LTDA",
    address: {
      street: "Rua das Flores, 123",
      apartment: "Apto 45",
      postalCode: "01234567",
      city: "São Paulo",
      country: "Brasil",
    },
    status: "delivered",
    orderNotice: "Entregar após 18h",
    total: 79.97,
    dateTime: "2024-01-15T10:30:00.000Z",
    products: [
      {
        id: "order-product-1",
        quantity: 2,
        product: {
          id: "product-1",
          title: "Smartphone Samsung Galaxy S23",
          mainImage:
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&h=100&fit=crop",
          price: 29.99,
          slug: "smartphone-samsung-galaxy-s23",
        },
      },
      {
        id: "order-product-2",
        quantity: 1,
        product: {
          id: "product-2",
          title: "Fone de Ouvido Bluetooth",
          mainImage:
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop",
          price: 19.99,
          slug: "fone-ouvido-bluetooth",
        },
      },
    ],
  };

  const handleViewDetails = (orderId: string) => {
    console.log("Ver detalhes do pedido:", orderId);
  };

  return (
    <div className="max-w-md mx-auto">
      <OrderCard order={exampleOrder} onViewDetails={handleViewDetails} />
    </div>
  );
};

export default OrderCard;
