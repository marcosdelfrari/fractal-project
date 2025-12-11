// *********************
// Role of the component: products section intended to be on the home page
// Name of the component: ProductsSection.tsx
// Version: 1.0
// Component call: <ProductsSection slug={slug} />
// Input parameters: no input parameters
// Output: products grid
// *********************

import React from "react";
import Link from "next/link";
import ProductItem from "./ProductItem";
import apiClient from "@/lib/api";

const ProductsSection = async () => {
  // sending API request for getting all products
  const data = await apiClient.get("/api/products");
  const products = await data.json();
  return (
    <div className="bg-white">
      <div className="max-w-screen-2xl mx-auto pt-10 pb-20">
        <div className="grid grid-cols-4 justify-items-center max-w-screen-2xl mx-auto gap-x-4 gap-y-12 px-4 max-xl:grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-2 max-sm:grid-cols-2">
          {products.map((product: Product) => (
            <ProductItem key={product.id} product={product} color="black" />
          ))}
        </div>
        <div className="flex justify-center mt-10">
          <Link href="/shop" className="text-black text-sm font-light underline uppercase leading-relaxed">
            + VER TUDO
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductsSection;
