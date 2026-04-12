"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { fetchNextApi } from "@/lib/nextApiOrigin";
import {
  FaArrowLeft,
  FaSpinner,
  FaShoppingBag,
  FaCheckCircle,
  FaTruck,
  FaClock,
  FaTimesCircle,
  FaCalendarAlt,
  FaPrint,
  FaStore,
  FaRedo,
} from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import UserAccountShell, {
  type UserAccountTab,
} from "@/components/UserAccountShell";
import { useProductStore } from "@/app/_zustand/store";
import {
  getOrderStatusBadgeClasses,
  getOrderStatusLabel,
  normalizeOrderStatus,
} from "@/lib/orderStatusDisplay";
import {
  displayOrderNotice,
  orderIsPickup,
} from "@/lib/orderFulfillment";
import { productImageUnoptimized, productMainImageUrl } from "@/lib/imageUtils";

interface OrderProduct {
  id: string;
  quantity: number;
  selectedColor?: string | null;
  selectedSize?: string | null;
  product?: {
    id: string;
    title: string;
    mainImage: string;
    price: number;
    slug: string;
  } | null;
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
  deliveryOption?: string | null;
}

type OrderDetailPanel = "resumo" | "itens" | "informacoes";

export default function OrderDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const { addToCart, calculateTotals } = useProductStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailPanel, setDetailPanel] = useState<OrderDetailPanel>("resumo");

  const handleAccountTab = useCallback(
    (tab: UserAccountTab) => {
      const newUrl = tab === "orders" ? "/usuario" : `/usuario?tab=${tab}`;
      router.push(newUrl, { scroll: false });
    },
    [router],
  );

  const handleBuyAgain = () => {
    const lines = order?.products?.filter((op) => op.product) ?? [];
    if (!lines.length) {
      toast.error("Não há itens com produto disponível para repetir a compra.");
      return;
    }
    for (const op of lines) {
      const p = op.product!;
      const cartItemKey = `${p.id}__${op.selectedColor || ""}__${op.selectedSize || ""}`;
      addToCart({
        cartItemKey,
        id: p.id,
        title: p.title,
        price: num(p.price),
        image: p.mainImage || "",
        amount: op.quantity,
        selectedColor: op.selectedColor || undefined,
        selectedSize: op.selectedSize || undefined,
      });
    }
    calculateTotals();
    toast.success("Itens adicionados à sacola!");
    router.push("/carrinho");
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!session?.user?.id || !orderId) return;

      try {
        setIsLoading(true);
        setError(null);

        const orderUrl = `/api/orders/${encodeURIComponent(orderId)}?include=products`;
        const orderResponse = await fetchNextApi(orderUrl);

        if (!orderResponse.ok) {
          throw new Error("Falha ao carregar detalhes do pedido");
        }

        const raw = (await orderResponse.json()) as Record<string, unknown>;

        if (raw && typeof raw === "object" && "error" in raw && !("id" in raw)) {
          throw new Error(
            typeof raw.error === "string" ? raw.error : "Pedido indisponível",
          );
        }

        const orderData = raw as unknown as Order & {
          products?: OrderProduct[];
        };

        let products: OrderProduct[] = Array.isArray(orderData.products)
          ? orderData.products
          : [];

        if (products.length === 0) {
          const itemsRes = await fetchNextApi(
            `/api/orders/${encodeURIComponent(orderId)}/items`,
          );
          if (itemsRes.ok) {
            const lines = (await itemsRes.json()) as unknown;
            if (Array.isArray(lines) && lines.length > 0) {
              products = lines as OrderProduct[];
            }
          }
        }

        setOrder({ ...orderData, products });
      } catch (err) {
        console.error("Erro ao buscar detalhes do pedido:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Erro ao carregar detalhes do pedido",
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
    }).format(value);
  };

  const num = (v: number | string | null | undefined) => {
    if (v == null) return 0;
    const n = typeof v === "string" ? parseFloat(v) : v;
    return Number.isFinite(n) ? n : 0;
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

  const getStatusIcon = (orderStatus: string) => {
    switch (normalizeOrderStatus(orderStatus)) {
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

  const handlePrint = () => {
    window.print();
  };

  const userForShell = {
    id: session?.user?.id ?? "",
    name: session?.user?.name,
    email: session?.user?.email,
    image: session?.user?.image,
  };

  if (status === "loading" || !session?.user?.id) {
    return (
      <div className="min-h-screen bg-[#E3E1D6] flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-4xl text-zinc-800 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-light">Carregando…</p>
        </div>
      </div>
    );
  }

  if (isLoading || !order) {
    const inner =
      isLoading && !error ? (
        <div className="flex flex-col items-center justify-center py-20">
          <FaSpinner className="text-4xl text-zinc-800 animate-spin mb-4" />
          <p className="text-gray-600 font-light">Carregando detalhes do pedido…</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border-2 border-black p-8 md:p-10">
          <div className="flex flex-col items-center text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <FaTimesCircle className="text-red-500 text-xl" />
            </div>
            <h2 className="text-xl font-light text-gray-900 tracking-tight mb-2">
              Não foi possível carregar o pedido
            </h2>
            <p className="text-gray-500 font-light text-sm mb-8">
              {error || "Pedido não encontrado."}
            </p>
            <Link
              href="/usuario"
              className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-black px-8 py-3 text-sm uppercase tracking-wider font-medium text-white hover:bg-zinc-800 transition-all duration-300"
            >
              <FaArrowLeft className="text-xs" />
              Voltar aos pedidos
            </Link>
          </div>
        </div>
      );

    return (
      <UserAccountShell
        user={userForShell}
        activeTab="orders"
        onTabChange={handleAccountTab}
      >
        {inner}
      </UserAccountShell>
    );
  }

  const totalItems = order.products.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  const isPickup = orderIsPickup(order);
  const noticeText = displayOrderNotice(order.orderNotice, isPickup);

  const panelVisible = (id: OrderDetailPanel) =>
    detailPanel === id ? "block" : "hidden print:block";

  const tabs: { id: OrderDetailPanel; label: string }[] = [
    { id: "resumo", label: "Resumo" },
    {
      id: "itens",
      label: `Itens${totalItems > 0 ? ` (${totalItems})` : ""}`,
    },
    { id: "informacoes", label: isPickup ? "Retirada e contato" : "Entrega e contato" },
  ];

  return (
    <UserAccountShell
      user={userForShell}
      activeTab="orders"
      onTabChange={handleAccountTab}
    >
      <div className="animate-fade-in-up print:bg-white max-w-4xl mx-auto w-full">
        <Link
          href="/usuario"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-light mb-5 transition-colors print:hidden"
        >
          <FaArrowLeft className="text-xs" />
          Voltar aos pedidos
        </Link>

        <div className="bg-white rounded-2xl border border-black/90 shadow-sm overflow-hidden print:shadow-none print:border print:rounded-lg">
          {/* Cabeçalho fixo do pedido */}
          <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-gray-200/90 bg-[#E3E1D6]/40">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white border border-gray-200/80 text-zinc-800">
                  <FaShoppingBag className="text-lg" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">
                    Pedido
                  </p>
                  <p className="text-lg sm:text-xl font-medium text-gray-900 tracking-tight truncate">
                    #{order.id.slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${getOrderStatusBadgeClasses(
                  order.status,
                )}`}
              >
                {getStatusIcon(order.status)}
                {getOrderStatusLabel(order.status)}
              </span>
            </div>
          </div>

          {/* Abas internas */}
          <div
            className="flex gap-0 border-b border-gray-200 bg-gray-50/80 overflow-x-auto print:hidden"
            role="tablist"
            aria-label="Seções do pedido"
          >
            {tabs.map((t) => {
              const active = detailPanel === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setDetailPanel(t.id)}
                  className={`relative flex-1 min-w-[7.5rem] px-3 py-3.5 text-center text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                    active
                      ? "text-gray-900 bg-white"
                      : "text-gray-500 hover:text-gray-800 hover:bg-white/60"
                  }`}
                >
                  {active ? (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-black rounded-full" />
                  ) : null}
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="p-5 sm:p-6 md:p-8">
            {/* Painel Resumo */}
            <div className={`${panelVisible("resumo")} space-y-6`}>
              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                <div className="rounded-xl border border-gray-100 bg-gray-50/40 p-4">
                  <dt className="text-[10px] uppercase tracking-widest text-gray-400 font-medium mb-1">
                    Data
                  </dt>
                  <dd className="text-sm text-gray-900 font-light flex items-center gap-2">
                    <FaCalendarAlt className="text-gray-400 shrink-0 text-xs" />
                    {formatDate(order.dateTime)}
                  </dd>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/40 p-4">
                  <dt className="text-[10px] uppercase tracking-widest text-gray-400 font-medium mb-1">
                    Modalidade
                  </dt>
                  <dd className="text-sm text-gray-900 font-light flex items-center gap-2">
                    {isPickup ? (
                      <>
                        <FaStore className="text-teal-600 shrink-0 text-sm" />
                        <span>Retirada na loja</span>
                      </>
                    ) : (
                      <>
                        <FaTruck className="text-sky-600 shrink-0 text-sm" />
                        <span>Entrega em domicílio</span>
                      </>
                    )}
                  </dd>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/40 p-4 sm:col-span-1">
                  <dt className="text-[10px] uppercase tracking-widest text-gray-400 font-medium mb-1">
                    Total
                  </dt>
                  <dd className="text-2xl font-light text-gray-900 tabular-nums">
                    {formatCurrency(order.total)}
                  </dd>
                </div>
              </dl>

              {noticeText ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-[#E3E1D6]/20 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">
                    Observações
                  </p>
                  <p className="text-sm text-gray-800 font-light leading-relaxed whitespace-pre-wrap">
                    {noticeText}
                  </p>
                </div>
              ) : null}

              <div className="flex flex-col sm:flex-row gap-2 sm:justify-end pt-2 print:hidden">
                <button
                  type="button"
                  onClick={handleBuyAgain}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-black bg-black px-5 py-2.5 text-xs uppercase tracking-wider font-medium text-white hover:bg-zinc-800 transition-colors"
                >
                  <FaRedo className="text-sm" />
                  Comprar novamente
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-2.5 text-xs uppercase tracking-wider font-medium text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  <FaPrint className="text-sm" />
                  Imprimir
                </button>
              </div>
            </div>

            {/* Painel Itens */}
            <div className={`${panelVisible("itens")}`}>
              {order.products.length === 0 ? (
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-8 text-center">
                  <p className="text-sm text-gray-600 font-light">
                    Nenhum produto listado neste pedido.
                  </p>
                  <p className="text-xs text-gray-400 font-light mt-2 max-w-sm mx-auto">
                    Pode ser um pedido ajustado manualmente, cancelado antes
                    de registrar itens, ou os dados ainda estão sendo
                    sincronizados.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100 overflow-hidden">
                  {order.products.map((orderProduct) => {
                    const p = orderProduct.product;
                    if (!p) {
                      return (
                        <li
                          key={orderProduct.id}
                          className="print:break-inside-avoid bg-white"
                        >
                          <div className="p-4 text-sm text-gray-600 font-light">
                            <p className="font-medium text-gray-900">
                              Item sem produto vinculado
                            </p>
                            <p className="text-xs mt-1 text-gray-500">
                              Quantidade: {orderProduct.quantity} (produto pode
                              ter sido removido do catálogo)
                            </p>
                          </div>
                        </li>
                      );
                    }
                    const unit = num(p.price);
                    const pedidoLineImg = productMainImageUrl(p.mainImage);
                    return (
                      <li
                        key={orderProduct.id}
                        className="print:break-inside-avoid bg-white"
                      >
                        <div className="p-4 hover:bg-gray-50/50 transition-colors">
                          <div className="flex gap-4">
                            <Link
                              href={`/produto/${p.slug}`}
                              className="relative h-16 w-16 sm:h-[72px] sm:w-[72px] shrink-0 rounded-lg overflow-hidden ring-1 ring-black/[0.06]"
                            >
                              <Image
                                src={pedidoLineImg}
                                alt={p.title}
                                fill
                                unoptimized={productImageUnoptimized(
                                  pedidoLineImg,
                                )}
                                className="object-cover"
                              />
                            </Link>
                            <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                              <div className="min-w-0">
                                <Link
                                  href={`/produto/${p.slug}`}
                                  className="text-sm font-medium text-gray-900 hover:text-zinc-600 line-clamp-2"
                                >
                                  {p.title}
                                </Link>
                                {(orderProduct.selectedColor ||
                                  orderProduct.selectedSize) && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {orderProduct.selectedColor
                                      ? `Cor: ${orderProduct.selectedColor}`
                                      : ""}
                                    {orderProduct.selectedColor &&
                                    orderProduct.selectedSize
                                      ? " · "
                                      : ""}
                                    {orderProduct.selectedSize
                                      ? `Tam.: ${orderProduct.selectedSize}`
                                      : ""}
                                  </p>
                                )}
                              </div>
                              <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0.5 shrink-0 text-right">
                                <span className="text-xs tabular-nums text-gray-500">
                                  ×{orderProduct.quantity}
                                </span>
                                <span className="text-sm font-semibold text-gray-900 tabular-nums">
                                  {formatCurrency(unit * orderProduct.quantity)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Painel Informações: duas colunas em desktop */}
            <div className={`${panelVisible("informacoes")}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                <div>
                  <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-4">
                    Contato
                  </h3>
                  <dl className="space-y-3">
                    <div className="flex gap-3 items-baseline">
                      <dt className="w-16 shrink-0 text-xs text-gray-400">
                        E-mail
                      </dt>
                      <dd className="text-sm text-gray-900 font-light break-all min-w-0">
                        {order.email}
                      </dd>
                    </div>
                    <div className="flex gap-3 items-baseline">
                      <dt className="w-16 shrink-0 text-xs text-gray-400">
                        Tel.
                      </dt>
                      <dd className="text-sm text-gray-900 font-light">
                        {order.phone}
                      </dd>
                    </div>
                    {order.company ? (
                      <div className="flex gap-3 items-baseline">
                        <dt className="w-16 shrink-0 text-xs text-gray-400">
                          Ponto
                        </dt>
                        <dd className="text-sm text-gray-900 font-light min-w-0">
                          {order.company}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </div>

                <div className="md:border-l md:border-gray-100 md:pl-10">
                  <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-1">
                    {isPickup ? "Retirada" : "Entrega"}
                  </h3>
                  <p className="text-xs text-gray-500 font-light mb-4">
                    {isPickup
                      ? "Endereço do ponto de retirada (não é entrega em domicílio)"
                      : "Endereço para envio do pedido"}
                  </p>
                  <address className="text-sm text-gray-800 font-light not-italic leading-relaxed">
                    <span className="block font-medium text-gray-900">
                      {order.name} {order.lastname}
                    </span>
                    <span className="block mt-2">{order.adress}</span>
                    {order.apartment ? (
                      <span className="block mt-1">{order.apartment}</span>
                    ) : null}
                    <span className="block mt-2 text-gray-600">
                      {order.city} · CEP {order.postalCode}
                    </span>
                    <span className="block mt-1">{order.country}</span>
                  </address>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserAccountShell>
  );
}
