/**
 * Rótulos em português e classes Tailwind para badges de status de pedido.
 * Aceita slugs em inglês e sinônimos/variações em português legadas no banco.
 */

const CANONICAL = [
  "pending",
  "processing",
  "shipped",
  "ready_for_pickup",
  "delivered",
  "cancelled",
] as const;

export type OrderStatusCanonical = (typeof CANONICAL)[number];

/** Mapeia valor salvo (EN ou PT) para chave canônica em inglês. */
export function normalizeOrderStatus(status: string): OrderStatusCanonical | "" {
  const raw = (status || "").trim().toLowerCase();
  if (!raw) return "";
  const s = raw.replace(/\s+/g, "_").replace(/-/g, "_");

  const aliases: Record<string, OrderStatusCanonical> = {
    pending: "pending",
    pendente: "pending",
    processing: "processing",
    processando: "processing",
    shipped: "shipped",
    enviado: "shipped",
    ready_for_pickup: "ready_for_pickup",
    pronto_para_retirada: "ready_for_pickup",
    delivered: "delivered",
    entregue: "delivered",
    cancelled: "cancelled",
    cancelado: "cancelled",
  };

  const mapped = aliases[s];
  if (mapped) return mapped;

  if ((CANONICAL as readonly string[]).includes(s)) {
    return s as OrderStatusCanonical;
  }

  return "";
}

const LABELS_PT: Record<OrderStatusCanonical, string> = {
  pending: "Pendente",
  processing: "Em processamento",
  shipped: "Enviado",
  ready_for_pickup: "Pronto para retirada",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

export function getOrderStatusLabel(status: string): string {
  const key = normalizeOrderStatus(status);
  if (key) return LABELS_PT[key];

  const raw = (status || "").trim();
  if (!raw) return "—";

  return raw
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getOrderStatusBadgeClasses(status: string): string {
  const key = normalizeOrderStatus(status);
  switch (key) {
    case "delivered":
      return "bg-emerald-100 text-emerald-900 border-emerald-300";
    case "ready_for_pickup":
      return "bg-teal-100 text-teal-900 border-teal-300";
    case "shipped":
      return "bg-sky-100 text-sky-900 border-sky-300";
    case "processing":
      return "bg-blue-100 text-blue-900 border-blue-300";
    case "cancelled":
      return "bg-red-100 text-red-900 border-red-300";
    case "pending":
      return "bg-amber-100 text-amber-950 border-amber-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
}
