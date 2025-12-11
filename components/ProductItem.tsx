// *********************
// Role of the component: Product item component
// Name of the component: ProductItem.tsx
// Version: 2.0
// Component call: <ProductItem product={product} color={color} />
// Input parameters: { product: Product; color: string; }
// Output: Product item component that contains product image, title, link to the single product page, price, button...
// *********************

import Image from "next/image";
import React from "react";
import Link from "next/link";
import { sanitize } from "@/lib/sanitize";
import { FaPlus, FaRegHeart } from "react-icons/fa6";

const ProductItem = ({ product }: { product: Product; color?: string }) => {
  // Installment logic simulation based on price
  const installmentCount = product.price > 90 ? 10 : 9;
  const installmentValue = (product.price / installmentCount)
    .toFixed(2)
    .replace(".", ",");
  const priceFormatted = product.price.toFixed(2).replace(".", ",");

  return (
    <div className="group flex flex-col items-center w-full">
      <div className="relative w-full aspect-[3/4] bg-[#f5f5f7] mb-4 overflow-hidden">
        <Link href={`/product/${product.slug}`} className="block w-full h-full">
          <Image
            src={
              product.mainImage
                ? `/${product.mainImage}`
                : "/product_placeholder.jpg"
            }
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
            alt={sanitize(product?.title) || "Product image"}
          />
        </Link>

        {/* Heart Icon */}
        <button className="absolute top-3 right-3 text-black hover:text-gray-600 transition-colors z-10">
          <FaRegHeart size={20} />
        </button>

        {/* Plus Icon */}
        <button className="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:bg-gray-50 transition-colors z-10">
          <FaPlus size={14} />
        </button>
      </div>

      <div className="flex flex-col items-center text-center px-1 w-full">
        <Link
          href={`/product/${product.slug}`}
          className="text-sm text-gray-800 font-medium leading-relaxed line-clamp-2 mb-2 hover:text-black"
        >
          {sanitize(product.title)}
        </Link>

        <div className="flex flex-col items-center gap-0.5">
          <span className="text-base font-bold text-black">
            R$ {priceFormatted}
          </span>
          <span className="text-xs text-gray-500 font-light">
            ou {installmentCount}x R$ {installmentValue} sem juros
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
