export const dynamic = "force-dynamic";
export const revalidate = 0;

import { Breadcrumb, Pagination, Products, SortBy } from "@/components";
import ProductPageMotion from "@/components/ProductPageMotion";
import ShopShell from "@/components/ShopShell";
import React from "react";
import { sanitize } from "@/lib/sanitize";

// improve readabillity of category text, for example category text "smart-watches" will be "smart watches"
const improveCategoryText = (text: string): string => {
  if (text.indexOf("-") !== -1) {
    let textArray = text.split("-");

    return textArray.join(" ");
  } else {
    return text;
  }
};

const ShopPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  // Await both params and searchParams
  const awaitedParams = await params;
  const awaitedSearchParams = await searchParams;

  const heading =
    awaitedParams?.slug && awaitedParams?.slug[0]?.length > 0
      ? sanitize(improveCategoryText(awaitedParams?.slug[0]))
      : "Catálogo";

  const productsListKey = [
    awaitedParams.slug?.join("/") ?? "",
    ...Object.keys(awaitedSearchParams)
      .sort()
      .map((k) => {
        const v = awaitedSearchParams[k];
        if (v === undefined) return "";
        return `${k}=${Array.isArray(v) ? v.join(",") : v}`;
      }),
  ].join("|");

  return (
    <div className="text-gray-800 bg-[#E3E1D6] min-h-screen">
      <div className="mx-auto max-w-7xl px-4 pb-6 pt-3 md:px-6 md:pb-10 md:pt-6 lg:px-8">
        <ProductPageMotion className="mb-2 md:mb-6">
          <Breadcrumb />
        </ProductPageMotion>

        <ShopShell title={heading}>
          <div className="flex flex-col">
            <ProductPageMotion
              className="mb-6 hidden items-end justify-between md:flex md:mb-8"
              delay={0.05}
              y={14}
            >
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 capitalize">
                {heading}
              </h2>
              <SortBy />
            </ProductPageMotion>

            <Products
              key={productsListKey}
              params={awaitedParams}
              searchParams={awaitedSearchParams}
            />

            <ProductPageMotion
              className="mt-12 border-t border-zinc-100 pt-8"
              delay={0.1}
              y={12}
            >
              <Pagination />
            </ProductPageMotion>
          </div>
        </ShopShell>
      </div>
    </div>
  );
};

export default ShopPage;
