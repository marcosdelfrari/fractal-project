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
  let products: Product[] = [];

  try {
    // sending API request for getting all products
    const data = await apiClient.get("/api/products");

    if (!data.ok) {
      const errorText = await data.text().catch(() => 'Unable to read error response');
      console.error(`API Error: ${data.status} ${data.statusText}`, {
        url: data.url,
        status: data.status,
        statusText: data.statusText,
        errorBody: errorText,
      });
      // Return empty state instead of crashing
      return (
        <div className="bg-white">
          <div className="max-w-screen-2xl mx-auto pt-10 pb-20">
            <div className="text-center py-10">
              <p className="text-gray-500">
                Não foi possível carregar os produtos no momento.
              </p>
              {process.env.NODE_ENV === 'development' && (
                <p className="text-xs text-gray-400 mt-2">
                  Erro: {data.status} {data.statusText}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    products = await data.json();

    // Validate that products is an array
    if (!Array.isArray(products)) {
      console.error("API returned invalid data format");
      products = [];
    }
  } catch (error) {
    console.error("Error fetching products:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    // Return empty state instead of crashing
    return (
      <div className="bg-white">
        <div className="max-w-screen-2xl mx-auto pt-10 pb-20">
          <div className="text-center py-10">
            <p className="text-gray-500">
              Não foi possível carregar os produtos no momento.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <p className="text-xs text-gray-400 mt-2">
                {error instanceof Error ? error.message : String(error)}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="max-w-screen-2xl mx-auto pt-10 pb-20">
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-4 justify-items-center max-w-screen-2xl mx-auto gap-x-4 gap-y-12 px-4 max-xl:grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-2 max-sm:grid-cols-2">
              {products.map((product: Product) => (
                <ProductItem key={product.id} product={product} color="black" />
              ))}
            </div>
            <div className="flex justify-center mt-10">
              <Link
                href="/shop"
                className="text-black text-sm font-light underline uppercase leading-relaxed"
              >
                + VER TUDO
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">
              Nenhum produto disponível no momento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsSection;
