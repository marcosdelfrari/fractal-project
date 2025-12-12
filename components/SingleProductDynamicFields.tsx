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

const SingleProductDynamicFields = ({ product }: { product: Product }) => {
  const colors = product?.colors || [];
  const sizes = product?.sizes || [];

  const [quantityCount, setQuantityCount] = useState<number>(1);
  const [selectedColor, setSelectedColor] = useState<string>(
    colors[0]?.name || ""
  );
  const [selectedSize, setSelectedSize] = useState<string>(sizes[0] || "");

  return (
    <div className="flex flex-col gap-6">
      {/* Colors */}
      {colors.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Cores</h3>
          <div className="flex gap-2">
            {colors.map((color) => (
              <button
                key={color.name}
                onClick={() => setSelectedColor(color.name)}
                className={`w-8 h-8 rounded-none transition-all ${
                  color.class
                } ${
                  selectedColor === color.name
                    ? "ring-2 ring-offset-2 ring-gray-400"
                    : "hover:opacity-80"
                }`}
                title={color.name}
                aria-label={color.name}
              />
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
                className={`min-w-[40px] h-10 px-2 flex items-center justify-center border text-sm transition-all ${
                  selectedSize === size
                    ? "border-black bg-black text-white"
                    : "border-gray-200 text-gray-600 hover:border-gray-400"
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
        <div className="flex gap-4 items-stretch mt-2">
          <div className="bg-gray-100">
            <QuantityInput
              quantityCount={quantityCount}
              setQuantityCount={setQuantityCount}
            />
          </div>

          <div className="flex-1">
            <AddToCartSingleProductBtn
              quantityCount={quantityCount}
              product={product}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleProductDynamicFields;
