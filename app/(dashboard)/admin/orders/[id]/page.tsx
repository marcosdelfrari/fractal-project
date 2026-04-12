"use client";
import { DashboardSidebar } from "@/components";
import { fetchNextApi } from "@/lib/nextApiOrigin";
import { isValidEmailAddressFormat, isValidNameOrLastname } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  FaChevronLeft,
  FaTrash,
  FaCheck,
  FaTruck,
  FaClock,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCommentAlt,
  FaReceipt,
  FaStore,
} from "react-icons/fa";
import { FaBagShopping } from "react-icons/fa6";
import {
  getOrderStatusBadgeClasses,
  getOrderStatusLabel,
  normalizeOrderStatus,
} from "@/lib/orderStatusDisplay";
import { orderIsPickup } from "@/lib/orderFulfillment";
import { productImageUnoptimized, productMainImageUrl } from "@/lib/imageUtils";

interface OrderProduct {
  id: string;
  customerOrderId: string;
  productId: string;
  quantity: number;
  selectedColor?: string | null;
  selectedSize?: string | null;
  product: {
    id: string;
    slug: string;
    title: string;
    mainImage: string;
    price: number;
    rating: number;
    description: string;
    manufacturer: string;
    inStock: number;
    categoryId: string;
  };
}

const AdminSingleOrder = () => {
  const [orderProducts, setOrderProducts] = useState<OrderProduct[]>();
  const [order, setOrder] = useState<Order>({
    id: "",
    adress: "",
    apartment: "",
    company: "",
    dateTime: "",
    email: "",
    lastname: "",
    name: "",
    phone: "",
    postalCode: "",
    city: "",
    country: "",
    orderNotice: "",
    status: "processing",
    total: 0,
    deliveryOption: "entrega",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteOrderOpen, setDeleteOrderOpen] = useState(false);

  const params = useParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    const fetchOrderData = async () => {
      const response = await fetchNextApi(`/api/orders/${params?.id}`);
      const data = (await response.json()) as Order & { products?: OrderProduct[] };
      const { products, ...orderFields } = data;
      setOrder(orderFields);
      setOrderProducts(Array.isArray(products) ? products : []);
    };

    if (params?.id) {
      fetchOrderData();
    }
  }, [params?.id]);

  const updateOrder = async () => {
    if (
      !order?.name ||
      !order?.lastname ||
      !order?.phone ||
      !order?.email ||
      !order?.adress ||
      !order?.city ||
      !order?.country ||
      !order?.postalCode
    ) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    if (
      !isValidNameOrLastname(order?.name) ||
      !isValidNameOrLastname(order?.lastname)
    ) {
      toast.error("Formato de nome ou sobrenome inválido");
      return;
    }

    if (!isValidEmailAddressFormat(order?.email)) {
      toast.error("Formato de email inválido");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetchNextApi(`/api/orders/${order?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
      if (response.status === 200) {
        toast.success("Pedido atualizado com sucesso");
      } else {
        throw Error("Erro ao atualizar pedido");
      }
    } catch (error) {
      console.error("Erro ao atualizar pedido:", error);
      toast.error("Erro ao atualizar pedido");
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteOrder = async () => {
    setIsDeleting(true);
    try {
      const itemsRes = await fetchNextApi(`/api/orders/${order?.id}/items`, {
        method: "DELETE",
      });
      if (!itemsRes.ok) {
        throw new Error("Erro ao remover itens do pedido");
      }
      await fetchNextApi(`/api/orders/${order?.id}`, { method: "DELETE" });
      toast.success("Pedido excluído com sucesso");
      router.push("/admin/orders");
    } catch (error) {
      toast.error("Erro ao excluir pedido");
    } finally {
      setIsDeleting(false);
      setDeleteOrderOpen(false);
    }
  };

  const isPickupOrder = orderIsPickup({
    deliveryOption: order?.deliveryOption,
    orderNotice: order?.orderNotice ?? null,
  });

  const getStatusIcon = (status: string) => {
    switch (normalizeOrderStatus(status)) {
      case "delivered":
        return <FaCheck size={10} />;
      case "cancelled":
        return <FaTrash size={10} />;
      case "shipped":
        return <FaTruck size={10} />;
      case "ready_for_pickup":
        return <FaStore size={10} />;
      case "pending":
        return <FaClock size={10} />;
      case "processing":
        return <FaClock size={10} />;
      default:
        return <FaClock size={10} />;
    }
  };

  return (
    <div className="bg-white flex min-h-screen max-w-screen-2xl mx-auto max-lg:flex-col animate-fade-in-up">
      <DashboardSidebar />
      <div className="flex-1 p-10 max-md:p-4 pb-admin-mobile-nav">
        {/* Header Section */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/orders")}
              className="p-3 bg-[#E3E1D6] rounded-full text-gray-400 hover:text-gray-900 transition-colors"
            >
              <FaChevronLeft size={14} />
            </button>
            <div className="p-3 bg-[#E3E1D6] rounded-full text-gray-900">
              <FaBagShopping size={16} />
            </div>
            <h1 className="text-lg font-light tracking-widest text-gray-900 uppercase">
              Detalhes do Pedido
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setDeleteOrderOpen(true)}
            disabled={isDeleting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-red-100 text-[10px] uppercase tracking-widest font-medium text-red-400 hover:bg-red-50 hover:text-red-600 transition-all duration-300 disabled:opacity-50"
          >
            <FaTrash size={10} />
            {isDeleting ? "Excluindo..." : "Excluir Pedido"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-8 space-y-10">
            {/* Order Items */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 transition-all duration-300">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-[#E3E1D6] rounded-full text-gray-400">
                  <FaReceipt size={12} />
                </div>
                <h2 className="text-sm font-light tracking-widest text-gray-900 uppercase">
                  Itens do Pedido
                </h2>
              </div>

              <div className="divide-y divide-gray-50">
                {orderProducts?.map((item) => {
                  const adminOrdImg = productMainImageUrl(
                    item?.product?.mainImage,
                  );
                  return (
                  <div
                    className="flex items-center py-6 first:pt-0"
                    key={item?.id}
                  >
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-gray-50 flex-shrink-0">
                      <Image
                        src={adminOrdImg}
                        alt={item?.product?.title}
                        fill
                        unoptimized={productImageUnoptimized(adminOrdImg)}
                        className="object-cover"
                      />
                    </div>
                    <div className="ml-6 flex-1">
                      <Link
                        href={`/produto/${item?.product?.slug}`}
                        className="text-sm font-medium text-gray-900 hover:underline transition-all"
                      >
                        {item?.product?.title}
                      </Link>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                          R$ {item?.product?.price} × {item?.quantity}
                        </p>
                        <p className="text-xs font-bold text-gray-900">
                          R$ {item?.product?.price * item?.quantity}
                        </p>
                      </div>
                      {(item?.selectedColor || item?.selectedSize) && (
                        <div className="flex items-center gap-4 mt-2">
                          {item?.selectedColor ? (
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                              Cor: {item.selectedColor}
                            </p>
                          ) : null}
                          {item?.selectedSize ? (
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                              Tamanho: {item.selectedSize}
                            </p>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
                );
                })}
              </div>

              <div className="mt-10 pt-10 border-t border-gray-50 space-y-3">
                <div className="flex justify-between text-xs text-gray-400 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-gray-900">R$ {order?.total}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400 uppercase tracking-widest">
                  <span>Taxas (20%)</span>
                  <span className="text-gray-900">R$ {order?.total / 5}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400 uppercase tracking-widest">
                  <span>Entrega</span>
                  <span className="text-gray-900">R$ 5</span>
                </div>
                <div className="flex justify-between items-end pt-4">
                  <span className="text-sm font-light uppercase tracking-[0.2em] text-gray-900">
                    Total do Pedido
                  </span>
                  <span className="text-3xl font-bold text-gray-900 tracking-tighter">
                    R$ {order?.total + order?.total / 5 + 5}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Information Form */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 transition-all duration-300">
              <div className="flex items-center gap-3 mb-10">
                <div className="p-2 bg-[#E3E1D6] rounded-full text-gray-400">
                  <FaUser size={12} />
                </div>
                <h2 className="text-sm font-light tracking-widest text-gray-900 uppercase">
                  Informações do Cliente
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[#E3E1D6] border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-2xl py-4 px-6 transition-all duration-300 text-gray-900"
                    value={order?.name}
                    onChange={(e) =>
                      setOrder({ ...order, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1">
                    Sobrenome
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[#E3E1D6] border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-2xl py-4 px-6 transition-all duration-300 text-gray-900"
                    value={order?.lastname}
                    onChange={(e) =>
                      setOrder({ ...order, lastname: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                    <FaEnvelope size={10} /> Email
                  </label>
                  <input
                    type="email"
                    className="w-full bg-[#E3E1D6] border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-2xl py-4 px-6 transition-all duration-300 text-gray-900"
                    value={order?.email}
                    onChange={(e) =>
                      setOrder({ ...order, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                    <FaPhone size={10} /> WhatsApp
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[#E3E1D6] border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-2xl py-4 px-6 transition-all duration-300 text-gray-900"
                    value={order?.phone}
                    onChange={(e) =>
                      setOrder({ ...order, phone: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Entrega ou retirada */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 transition-all duration-300">
              <div className="flex items-center gap-3 mb-10">
                <div className="p-2 bg-[#E3E1D6] rounded-full text-gray-400">
                  {isPickupOrder ? (
                    <FaStore size={12} />
                  ) : (
                    <FaMapMarkerAlt size={12} />
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-light tracking-widest text-gray-900 uppercase">
                    {isPickupOrder
                      ? "Endereço da retirada"
                      : "Endereço de entrega"}
                  </h2>
                  <p className="text-xs text-gray-400 font-light mt-1 normal-case tracking-normal">
                    {isPickupOrder
                      ? "Local onde o cliente retira o pedido"
                      : "Dados para envio ao domicílio"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1">
                    Empresa (Opcional)
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[#E3E1D6] border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-2xl py-4 px-6 transition-all duration-300 text-gray-900"
                    value={order?.company}
                    onChange={(e) =>
                      setOrder({ ...order, company: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1">
                    Endereço
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[#E3E1D6] border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-2xl py-4 px-6 transition-all duration-300 text-gray-900"
                    value={order?.adress}
                    onChange={(e) =>
                      setOrder({ ...order, adress: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1">
                    Complemento
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[#E3E1D6] border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-2xl py-4 px-6 transition-all duration-300 text-gray-900"
                    value={order?.apartment}
                    onChange={(e) =>
                      setOrder({ ...order, apartment: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[#E3E1D6] border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-2xl py-4 px-6 transition-all duration-300 text-gray-900"
                    value={order?.city}
                    onChange={(e) =>
                      setOrder({ ...order, city: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1">
                    CEP
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[#E3E1D6] border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-2xl py-4 px-6 transition-all duration-300 text-gray-900"
                    value={order?.postalCode}
                    onChange={(e) =>
                      setOrder({ ...order, postalCode: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1">
                    País
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[#E3E1D6] border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-2xl py-4 px-6 transition-all duration-300 text-gray-900"
                    value={order?.country}
                    onChange={(e) =>
                      setOrder({ ...order, country: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Order Notice */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 transition-all duration-300">
              <div className="flex items-center gap-3 mb-10">
                <div className="p-2 bg-[#E3E1D6] rounded-full text-gray-400">
                  <FaCommentAlt size={12} />
                </div>
                <h2 className="text-sm font-light tracking-widest text-gray-900 uppercase">
                  Observações do Pedido
                </h2>
              </div>
              <textarea
                className="w-full bg-[#E3E1D6] border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-3xl py-6 px-8 transition-all duration-300 text-gray-900 h-32 leading-relaxed resize-none"
                value={order?.orderNotice || ""}
                onChange={(e) =>
                  setOrder({ ...order, orderNotice: e.target.value })
                }
                placeholder="Nenhuma observação informada."
              ></textarea>
            </div>
          </div>

          {/* Sidebar Info - Right Side */}
          <div className="lg:col-span-4 space-y-10">
            {/* Status Card */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 transition-all duration-300">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-[#E3E1D6] rounded-full text-gray-400">
                  <FaTruck size={12} />
                </div>
                <h2 className="text-sm font-light tracking-widest text-gray-900 uppercase">
                  Status
                </h2>
              </div>

              <div className="space-y-6">
                <div
                  className={`flex items-center gap-3 px-6 py-4 rounded-2xl border ${getOrderStatusBadgeClasses(
                    order?.status || "",
                  )}`}
                >
                  {getStatusIcon(order?.status || "")}
                  <span className="text-xs font-semibold tracking-wide normal-case">
                    {getOrderStatusLabel(order?.status || "")}
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1">
                    Alterar Status
                  </label>
                  <select
                    className="w-full bg-[#E3E1D6] border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-2xl py-4 px-6 transition-all duration-300 text-gray-900 appearance-none cursor-pointer text-sm"
                    value={order?.status}
                    onChange={(e) =>
                      setOrder({
                        ...order,
                        status: e.target.value as
                          | "pending"
                          | "processing"
                          | "shipped"
                          | "ready_for_pickup"
                          | "delivered"
                          | "cancelled",
                      })
                    }
                  >
                    <option value="pending">Pendente</option>
                    <option value="processing">Em processamento</option>
                    <option value="shipped">Enviado</option>
                    <option value="ready_for_pickup">Pronto para retirada</option>
                    <option value="delivered">Entregue</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-gray-50">
                  <p className="text-[10px] text-gray-300 uppercase tracking-widest mb-1">
                    Data do Pedido
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {order?.dateTime
                      ? new Date(order.dateTime).toLocaleString("pt-BR")
                      : "---"}
                  </p>
                </div>

                <div className="pt-6">
                  <button
                    onClick={updateOrder}
                    disabled={isUpdating}
                    className="w-full py-4 rounded-full bg-black text-[11px] uppercase tracking-widest font-medium text-white hover:bg-zinc-800 transition-all duration-300 disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-none"
                  >
                    {isUpdating ? "Salvando..." : "Salvar Alterações"}
                  </button>
                </div>
              </div>
            </div>

            {/* Order Summary ID */}
            <div className="p-8 bg-[#E3E1D6] rounded-[2rem] border border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 font-light italic">
                Identificação Única
              </p>
              <p className="text-[10px] font-mono text-gray-900 break-all">
                {order?.id}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOrderOpen}
        onClose={() => !isDeleting && setDeleteOrderOpen(false)}
        title="Excluir pedido?"
        description="Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        isBusy={isDeleting}
        onConfirm={deleteOrder}
      />
    </div>
  );
};

export default AdminSingleOrder;
