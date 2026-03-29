export type PickupAddressItem = {
  id: string;
  name: string;
  address: string;
};

/** Normaliza JSON vindo do Prisma/API para lista de pontos de retirada válidos. */
export function parsePickupAddresses(raw: unknown): PickupAddressItem[] {
  let value = raw;
  if (value == null) return [];
  if (typeof value === "string") {
    try {
      value = JSON.parse(value) as unknown;
    } catch {
      return [];
    }
  }
  if (!Array.isArray(value)) return [];
  const out: PickupAddressItem[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const id = typeof o.id === "string" ? o.id.trim() : "";
    const name = typeof o.name === "string" ? o.name.trim() : "";
    const address = typeof o.address === "string" ? o.address.trim() : "";
    if (!name || !address) continue;
    out.push({
      id: id || `pickup-${out.length}`,
      name,
      address,
    });
  }
  return out;
}
