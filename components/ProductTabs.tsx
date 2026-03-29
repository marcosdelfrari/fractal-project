// *********************
// Role of the component: Single product tabs on the single product page containing product description, main product info and reviews
// Name of the component: ProductTabs.tsx
// Version: 1.0
// Component call: <ProductTabs product={product} />
// Input parameters: { product: Product }
// Output: Single product tabs containing product description, main product info and reviews
// *********************

"use client";

import React, { useState } from "react";
import RatingPercentElement from "./RatingPercentElement";
import SingleReview from "./SingleReview";
import { formatCategoryName } from "@/utils/categoryFormating";
import { sanitize, sanitizeHtml } from "@/lib/sanitize";

const ProductTabs = ({ product }: { product: Product }) => {
  const [currentProductTab, setCurrentProductTab] = useState<number>(0);

  return (
    <div className="px-5 text-black">
      <div
        role="tablist"
        className="flex items-center gap-8 border-b border-gray-200 text-sm sm:text-base"
      >
        <button
          type="button"
          className={`pb-3 uppercase tracking-widest font-light border-b-2 transition-colors ${
            currentProductTab === 0
              ? "border-black text-black"
              : "border-transparent text-gray-400 hover:text-black"
          }`}
          onClick={() => setCurrentProductTab(0)}
        >
          Descrição
        </button>
        <button
          type="button"
          className={`pb-3 uppercase tracking-widest font-light border-b-2 transition-colors ${
            currentProductTab === 1
              ? "border-black text-black"
              : "border-transparent text-gray-400 hover:text-black"
          }`}
          onClick={() => setCurrentProductTab(1)}
        >
          Informações adicionais
        </button>
      </div>
      <div className="pt-5">
        {currentProductTab === 0 && (
          <div 
            className="text-base lg:text-lg font-light leading-relaxed text-gray-600 space-y-4 whitespace-pre-line"
            dangerouslySetInnerHTML={{ 
              __html: sanitizeHtml(product?.description) 
            }}
          />
        )}

        {currentProductTab === 1 && (
          <div className="overflow-x-auto">
            <table className="table text-base lg:text-lg text-left w-full">
              <tbody className="divide-y divide-gray-100">
                {/* row 1 */}
                <tr className="hover:bg-gray-50">
                  <th className="font-medium p-4 w-1/3">Fabricante:</th>
                  <td className="p-4">{sanitize(product?.manufacturer)}</td>
                </tr>
                {/* row 2 */}
                <tr className="hover:bg-gray-50">
                  <th className="font-medium p-4">Categoria:</th>
                  <td className="p-4">
                    {product?.category?.name
                      ? sanitize(formatCategoryName(product?.category?.name))
                      : "Sem categoria"}
                  </td>
                </tr>
                {/* row 3 */}
                <tr className="hover:bg-gray-50">
                  <th className="font-medium p-4">Cor:</th>
                  <td className="p-4">
                     {product?.colors && product.colors.length > 0 
                        ? product.colors.map(c => c.name).join(", ") 
                        : "N/A"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTabs;
