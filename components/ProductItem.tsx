// *********************
// Role of the component: Product item component
// Name of the component: ProductItem.tsx
// Version: 2.0
// Component call: <ProductItem product={product} color={color} />
// Input parameters: { product: Product; color: string; }
// Output: Product card — imagem, nome em pílula (layout vitrine)
// *********************

import Image from "next/image";
import React from "react";
import Link from "next/link";
import { sanitize } from "@/lib/sanitize";

/** Divisor curvo (linha preta côncava) entre área branca e faixa amarela — viewBox fixo, stretch horizontal. */
function WhiteYellowCurveSeparator() {
  return (
    <div aria-hidden className="w-full h-6  bg-[#FFFF04]">
      <div className="relative w-full h-4 border-b-2 border-black  rounded-b-2xl shrink-0 bg-[#F9F9F9]"></div>
    </div>
  );
}

const ProductItem = ({ product }: { product: Product; color?: string }) => {
  return (
    <div className="w-full">
      <Link
        href={`/produto/${product.slug}`}
        className="group flex aspect-[3/4] w-full origin-center flex-col overflow-hidden rounded-[2rem] border-2 border-black bg-white transition-transform duration-300 ease-out hover:-rotate-2 hover:skew-x-1"
      >
        <div className="relative min-h-0 flex-[3] overflow-hidden bg-white [&>span]:bg-white">
          <div
            className="pointer-events-none absolute inset-0 z-0 bg-white"
            aria-hidden
          />
          <Image
            src={
              product.mainImage
                ? `/${product.mainImage}`
                : "/product_placeholder.jpg"
            }
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="z-[1] block origin-center scale-[1.14] object-cover object-center"
            alt={sanitize(product?.title) || "Product image"}
          />
        </div>

        <WhiteYellowCurveSeparator />

        <div className="flex min-h-0 flex-[1] items-center justify-center bg-[#FFFF04] px-3 pb-5 pt-3 max-h-[55px]">
          <span className="line-clamp-1 w-full uppercase text-center rounded-full bg-[#861201] px-2 md:px-5 py-2.5 text-xs md:text-sm font-medium text-white">
            {sanitize(product.title)}
          </span>
        </div>
      </Link>
    </div>
  );
};

export default ProductItem;
