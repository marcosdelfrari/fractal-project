// *********************
// Role of the component: Showing products on the shop page with applied filter and sort
// Name of the component: Products.tsx
// Version: 1.0
// Component call: <Products params={params} searchParams={searchParams} />
// Input parameters: { params, searchParams }: { params: { slug?: string[] }, searchParams: { [key: string]: string | string[] | undefined } }
// Output: products grid
// *********************

import React from "react";
import ShopProductsGrid from "./ShopProductsGrid";
import apiClient from "@/lib/api";

const Products = async ({
  params,
  searchParams,
}: {
  params: { slug?: string[] };
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  let products: Product[] = [];

  try {
    // getting all data from URL slug and preparing everything for sending GET request
    const page = searchParams?.page ? Number(searchParams?.page) : 1;

    const rawQ = searchParams?.q;
    const qStr =
      typeof rawQ === "string"
        ? rawQ
        : Array.isArray(rawQ)
          ? (rawQ[0] ?? "")
          : "";
    const qPart = qStr.trim() ? `&q=${encodeURIComponent(qStr.trim())}` : "";

    const categorySlug = params?.slug?.[0];
    const categoryPart =
      categorySlug && categorySlug.length > 0
        ? `filters[category][$equals]=${encodeURIComponent(categorySlug)}&`
        : "";

    const sortParam =
      typeof searchParams?.sort === "string" && searchParams.sort
        ? searchParams.sort
        : "defaultSort";

    // sending API request with filtering, sorting and pagination for getting all products
    const data = await apiClient.get(
      `/api/products?filters[price][$lte]=${
        searchParams?.price || 3000
      }&${categoryPart}sort=${sortParam}&page=${page}${qPart}`,
    );

    if (!data.ok) {
      console.error(`API Error: ${data.status} ${data.statusText}`);
      // Return empty state instead of crashing
      return (
        <div className="grid grid-cols-4 justify-items-center gap-x-2 gap-y-5 max-[1300px]:grid-cols-4 max-lg:grid-cols-3 max-[500px]:grid-cols-2">
          <h3 className="text-3xl mt-5 text-center w-full col-span-full max-[1000px]:text-2xl max-[500px]:text-lg text-gray-500">
            Não foi possível carregar os produtos no momento.
          </h3>
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
    console.error("Error fetching products:", error);
    // Return empty state instead of crashing
    return (
      <div className="grid grid-cols-4 justify-items-center gap-x-2 gap-y-5 max-[1300px]:grid-cols-4 max-lg:grid-cols-3 max-[500px]:grid-cols-2">
        <h3 className="text-3xl mt-5 text-center w-full col-span-full max-[1000px]:text-2xl max-[500px]:text-lg text-gray-500">
          Não foi possível carregar os produtos no momento.
        </h3>
      </div>
    );
  }

  return <ShopProductsGrid products={products} />;
};

export default Products;
