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
import apiClient from "@/lib/api";
import BrandTiragem from "./BrandTiragem";
import HomeProductsSearchBar from "./HomeProductsSearchBar";
import ProductListContent from "./ProductListContent";

const ProductsSection = async () => {
  let products: Product[] = [];

  try {
    // sending API request for getting all products
    const data = await apiClient.get("/api/products");

    if (!data.ok) {
      const errorText = await data
        .text()
        .catch(() => "Não foi possível ler a resposta de erro");
      console.error(`API Error: ${data.status} ${data.statusText}`, {
        url: data.url,
        status: data.status,
        statusText: data.statusText,
        errorBody: errorText,
      });
      // Return empty state instead of crashing
      return (
        <div className="bg-[#E3E1D6]">
          <div className="max-w-screen-2xl mx-auto pt-10 pb-20">
            <div className="text-center py-10">
              <p className="text-gray-500">
                Não foi possível carregar os produtos no momento.
              </p>
              {process.env.NODE_ENV === "development" && (
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
      <div className="bg-[#E3E1D6]">
        <div className="max-w-screen-2xl mx-auto pt-10 pb-20">
          <div className="text-center py-10">
            <p className="text-gray-500">
              Não foi possível carregar os produtos no momento.
            </p>
            {process.env.NODE_ENV === "development" && (
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
    <div className="bg-[#E3E1D6] overflow-x-hidden">
      {products.length > 0 ? (
        <>
          <div className="pt-10">
            <BrandTiragem />
          </div>
          <div className="max-w-screen-2xl mx-auto px-6 pt-10 pb-8 sm:px-8 md:px-12 lg:px-14">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 lg:gap-10">
              <h2 className="shrink-0 text-[clamp(2.25rem,12vw,6rem)] font-bold leading-none tracking-tight text-black md:text-[clamp(3rem,7.5vw,6rem)]">
                Nossos produtos
              </h2>
              <HomeProductsSearchBar className="w-full shrink-0 sm:ml-2 sm:w-auto sm:max-w-[15rem] md:max-w-[16rem]" />
            </div>
          </div>
          <div className="max-w-screen-2xl mx-auto pt-2">
            <ProductListContent products={products} />
          </div>

          <div className="max-w-screen-2xl mx-auto pb-20 pt-10">
            <div className="flex justify-center">
              <Link
                href="/loja"
                className="text-center text-white bg-[#861201] px-5 py-2.5 rounded-full text-sm font-light uppercase leading-relaxed"
              >
                VER TUDO
              </Link>
            </div>
          </div>
        </>
      ) : (
        <div className="max-w-screen-2xl mx-auto pt-10 pb-20">
          <div className="text-center py-10">
            <p className="text-gray-500">
              Nenhum produto disponível no momento.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsSection;
