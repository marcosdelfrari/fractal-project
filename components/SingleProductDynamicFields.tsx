// *********************
// Role of the component: Helper component for seperating dynamic client component from server component on the single product page with the intention to preserve SEO benefits of Next.js
// Name of the component: SingleProductDynamicFields.tsx
// Version: 1.0
// Component call: <SingleProductDynamicFields product={product} />
// Input parameters: { product: Product }
// Output: Quantity, add to cart and buy now component on the single product page
// *********************

"use client";
import React, { useState } from "react";
import QuantityInput from "./QuantityInput";
import AddToCartSingleProductBtn from "./AddToCartSingleProductBtn";
import BuyNowSingleProductBtn from "./BuyNowSingleProductBtn";

const COLOR_MAP: Record<string, string> = {
  branco: "#ffffff",
  white: "#ffffff",
  offwhite: "#f8f8f5",
  off_white: "#f8f8f5",
  gelo: "#f4f5f7",
  marfim: "#fff8e7",
  ivory: "#fff8e7",
  creme: "#f6ead0",
  bege: "#d6c6a5",
  nude: "#d6b89b",
  areia: "#c8b899",
  caqui: "#bdb76b",
  khaki: "#bdb76b",
  preto: "#111111",
  black: "#111111",
  grafite: "#374151",
  chumbo: "#4b5563",
  cinza: "#9ca3af",
  gray: "#9ca3af",
  grey: "#9ca3af",
  prata: "#c0c0c0",
  silver: "#c0c0c0",
  dourado: "#d4af37",
  gold: "#d4af37",
  azul: "#2563eb",
  blue: "#2563eb",
  marinho: "#1e3a8a",
  navy: "#1e3a8a",
  turquesa: "#14b8a6",
  ciano: "#06b6d4",
  cyan: "#06b6d4",
  verde: "#16a34a",
  green: "#16a34a",
  oliva: "#6b8e23",
  olive: "#6b8e23",
  lima: "#84cc16",
  lime: "#84cc16",
  vermelho: "#dc2626",
  red: "#dc2626",
  vinho: "#7f1d1d",
  bordo: "#7f1d1d",
  burgundy: "#7f1d1d",
  rosa: "#ec4899",
  pink: "#ec4899",
  magenta: "#d946ef",
  roxo: "#7c3aed",
  purple: "#7c3aed",
  lilas: "#a78bfa",
  amarelo: "#eab308",
  yellow: "#eab308",
  mostarda: "#ca8a04",
  laranja: "#f97316",
  orange: "#f97316",
  marrom: "#7c4a2d",
  brown: "#7c4a2d",
};

const normalizeColorKey = (value?: string) =>
  (value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-]+/g, "_");

const DIRECT_CSS_COLOR_REGEX =
  /^(#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})|rgb(a)?\([^)]+\)|hsl(a)?\([^)]+\))$/i;

const WHITE_LIKE_TOKENS = ["branco", "white", "offwhite", "off_white", "gelo"];

const findMappedColor = (rawName?: string) => {
  const normalized = normalizeColorKey(rawName);
  if (!normalized) return "";

  if (DIRECT_CSS_COLOR_REGEX.test(normalized)) {
    return normalized;
  }

  if (COLOR_MAP[normalized]) {
    return COLOR_MAP[normalized];
  }

  const compact = normalized.replace(/_/g, "");
  if (COLOR_MAP[compact]) {
    return COLOR_MAP[compact];
  }

  // Composite names like "azul marinho", "cinza chumbo", "off white fosco"
  for (const token of normalized.split("_")) {
    if (COLOR_MAP[token]) {
      return COLOR_MAP[token];
    }
  }

  return "";
};

const SingleProductDynamicFields = ({ product }: { product: Product }) => {
  const colors = product?.colors || [];
  const sizes = product?.sizes || [];

  const [quantityCount, setQuantityCount] = useState<number>(1);
  const [selectedColor, setSelectedColor] = useState<string>(
    colors[0]?.name || ""
  );
  const [selectedSize, setSelectedSize] = useState<string>(sizes[0] || "");
  const optionBaseClass =
    "h-9 px-4 border rounded-full text-[13px] font-medium transition-all flex items-center justify-center gap-2";
  const optionActiveClass = "border-black bg-black text-white";
  const optionInactiveClass =
    "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-[#E3E1D6]";

  return (
    <div className="flex flex-col gap-6">
      {/* Colors */}
      {colors.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Cores</h3>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              (() => {
                const normalizedName = normalizeColorKey(color.name);
                const colorHex = findMappedColor(color.name);
                const isWhiteLike =
                  colorHex === "#ffffff" ||
                  WHITE_LIKE_TOKENS.some((token) =>
                    normalizedName.includes(token)
                  );
                const selected = selectedColor === color.name;
                const fallbackClass = color.class || "";

                return (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`${optionBaseClass} ${
                      selected
                        ? optionActiveClass
                        : optionInactiveClass
                    }`}
                    title={color.name}
                    aria-label={color.name}
                  >
                    <span
                      className={`inline-block w-3.5 h-3.5 rounded-full border ${
                        isWhiteLike ? "border-gray-300" : "border-black/10"
                      } ${!colorHex ? fallbackClass : ""}`}
                      style={colorHex ? { backgroundColor: colorHex } : undefined}
                    />
                    <span className="capitalize">{color.name}</span>
                  </button>
                );
              })()
            ))}
          </div>
        </div>
      )}

      {/* Sizes */}
      {sizes.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Tamanhos</h3>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`${optionBaseClass} ${
                  selectedSize === size
                    ? optionActiveClass
                    : optionInactiveClass
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity & Add to Cart */}
      {Boolean(product.inStock) && (
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex gap-4 items-stretch h-12">
            <div className="border border-gray-200 rounded-full px-2">
              <QuantityInput
                quantityCount={quantityCount}
                setQuantityCount={setQuantityCount}
              />
            </div>

            <div className="flex-1">
              <AddToCartSingleProductBtn
                quantityCount={quantityCount}
                product={product}
                selectedColor={selectedColor}
                selectedSize={selectedSize}
              />
            </div>
          </div>

          <div className="hidden lg:block">
            <BuyNowSingleProductBtn
              quantityCount={quantityCount}
              product={product}
              selectedColor={selectedColor}
              selectedSize={selectedSize}
            />
          </div>
        </div>
      )}

      {/* Mobile Fixed Bottom Bar */}
      {Boolean(product.inStock) && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 flex gap-4 items-center shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
          <div className="flex-1">
            <p className="text-lg font-bold text-gray-900 leading-tight">
              R$ {product.price?.toFixed(2).replace(".", ",")}
            </p>
            <p className="text-xs text-gray-500">
              ou 7x de R$ {(product.price / 7).toFixed(2).replace(".", ",")}
            </p>
          </div>
          <div className="flex-[1.5]">
            <BuyNowSingleProductBtn
              quantityCount={quantityCount}
              product={product}
              selectedColor={selectedColor}
              selectedSize={selectedSize}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleProductDynamicFields;
