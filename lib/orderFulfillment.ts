/**
 * Indica se o pedido é retirada na loja / ponto de coleta (não entrega em domicílio).
 * Pedidos antigos podem só ter o marcador em `orderNotice`.
 */
export function orderIsPickup(order: {
  deliveryOption?: string | null;
  orderNotice?: string | null;
}): boolean {
  if (order.deliveryOption === "retirada") return true;
  if (order.orderNotice?.includes("[RETIRADA NA LOJA]")) return true;
  return false;
}

/** Texto de observações sem o prefixo interno de retirada. */
export function displayOrderNotice(
  orderNotice: string | undefined | null,
  isPickup: boolean,
): string {
  if (!orderNotice) return "";
  if (isPickup && orderNotice.includes("[RETIRADA NA LOJA]")) {
    return orderNotice.replace(/^\[RETIRADA NA LOJA\]\s*/i, "").trim();
  }
  return orderNotice;
}
