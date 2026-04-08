const crypto = require("crypto");

const MAX_ENTRIES = 5000;
const TTL_MS = 24 * 60 * 60 * 1000;

/** @type {Map<string, { payloadHash: string; status: number; body: object; expiresAt: number }>} */
const store = new Map();

function cleanup() {
  const now = Date.now();
  for (const [k, v] of store.entries()) {
    if (v.expiresAt <= now) store.delete(k);
  }
  while (store.size > MAX_ENTRIES) {
    const first = store.keys().next().value;
    store.delete(first);
  }
}

/**
 * Ordenação estável dos itens para idempotência (POST com `items`).
 * @param {Array<{ productId: string, quantity: number, selectedColor: string|null, selectedSize: string|null }>} items
 */
function stableOrderItemsForHash(items) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return [...items]
    .map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      selectedColor: i.selectedColor ?? null,
      selectedSize: i.selectedSize ?? null,
    }))
    .sort((a, b) => {
      const key = (x) =>
        `${x.productId}\0${x.quantity}\0${x.selectedColor ?? ""}\0${x.selectedSize ?? ""}`;
      return key(a).localeCompare(key(b));
    });
}

/**
 * Hash estável do payload já validado + flag de duplicata (corpo lógico do POST).
 * @param {unknown} stableOrderItems — retorno de `stableOrderItemsForHash` ou null (sem itens no corpo)
 */
function hashOrderPayload(validatedData, confirmDuplicateOrder, stableOrderItems) {
  const o = {
    ...validatedData,
    _confirmDuplicateOrder: Boolean(confirmDuplicateOrder),
  };
  if (stableOrderItems != null && stableOrderItems.length > 0) {
    o._orderItems = stableOrderItems;
  }
  const keys = Object.keys(o).sort();
  const stable = {};
  for (const key of keys) {
    stable[key] = o[key];
  }
  return crypto.createHash("sha256").update(JSON.stringify(stable)).digest("hex");
}

const MAX_KEY_LEN = 128;

function normalizeIdempotencyKey(raw) {
  if (raw == null || typeof raw !== "string") return null;
  const t = raw.trim();
  if (!t.length || t.length > MAX_KEY_LEN) return null;
  return t;
}

/**
 * @returns {{ hit: true, status: number, body: object } | { hit: false } | { conflict: true }}
 */
function tryBeginIdempotentCreate(idemKey, payloadHash) {
  if (!idemKey) {
    return { hit: false };
  }
  cleanup();
  const prev = store.get(idemKey);
  if (!prev) {
    return { hit: false };
  }
  if (prev.expiresAt <= Date.now()) {
    store.delete(idemKey);
    return { hit: false };
  }
  if (prev.payloadHash !== payloadHash) {
    return { conflict: true };
  }
  return { hit: true, status: prev.status, body: prev.body };
}

function recordIdempotentSuccess(idemKey, payloadHash, status, body) {
  if (!idemKey) return;
  cleanup();
  store.set(idemKey, {
    payloadHash,
    status,
    body,
    expiresAt: Date.now() + TTL_MS,
  });
}

module.exports = {
  hashOrderPayload,
  stableOrderItemsForHash,
  normalizeIdempotencyKey,
  tryBeginIdempotentCreate,
  recordIdempotentSuccess,
  MAX_KEY_LEN,
};
