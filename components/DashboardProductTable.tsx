// *********************
// Role of the component: Product table component on admin dashboard page
// Name of the component: DashboardProductTable.tsx
// Version: 1.0
// Component call: <DashboardProductTable />
// Input parameters: no input parameters
// Output: products table
// *********************

"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import apiClient from "@/lib/api";
import { sanitize } from "@/lib/sanitize";
import { productImageUnoptimized, productMainImageUrl } from "@/lib/imageUtils";
import { FaSearch } from "react-icons/fa";

const DashboardProductTable = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    apiClient
      .get("/api/products?mode=admin", { cache: "no-store" })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setProducts(data);
      });
  }, []);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const title = (p.title || "").toLowerCase();
      const slug = (p.slug || "").toLowerCase();
      const manufacturer = (p.manufacturer || "").toLowerCase();
      return (
        title.includes(q) || slug.includes(q) || manufacturer.includes(q)
      );
    });
  }, [products, searchQuery]);

  return (
    <div className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="relative w-full sm:flex-1 sm:min-w-0 sm:max-w-lg">
          <FaSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none"
            aria-hidden
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome, fabricante ou slug..."
            className="w-full bg-[#E3E1D6] border border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-full py-3 pl-10 pr-5 text-sm text-gray-900 placeholder:text-gray-400"
            autoComplete="off"
          />
        </div>
        <Link href="/admin/products/new" className="shrink-0 self-end sm:self-auto">
          <button
            type="button"
            className="flex items-center justify-center rounded-full bg-black px-6 py-3 text-[11px] uppercase tracking-widest font-medium text-white hover:bg-zinc-800 transition-all duration-300"
          >
            Adicionar Produto
          </button>
        </Link>
      </div>

      <div className="w-full overflow-auto h-[70vh] bg-white rounded-3xl border border-gray-100">
        <table className="table table-md table-pin-cols">
          {/* head */}
          <thead className="bg-[#E3E1D6]/50">
            <tr>
              <th className="py-4 px-6 text-[11px] font-light tracking-widest text-gray-500 uppercase">
                <label>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm rounded-md"
                  />
                </label>
              </th>
              <th className="py-4 text-[11px] font-light tracking-widest text-gray-500 uppercase">
                Produto
              </th>
              <th className="py-4 text-[11px] font-light tracking-widest text-gray-500 uppercase">
                Disponibilidade
              </th>
              <th className="py-4 text-[11px] font-light tracking-widest text-gray-500 uppercase">
                Preço
              </th>
              <th className="py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.length > 0 &&
            searchQuery.trim() &&
            filteredProducts.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-12 text-center text-sm text-gray-400"
                >
                  Nenhum produto encontrado para essa busca.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const pImg = productMainImageUrl(product?.mainImage);
                return (
                <tr
                  key={product.id}
                  className="hover:bg-[#E3E1D6]/50 transition-colors"
                >
                  <th className="px-6">
                    <label>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm rounded-md"
                      />
                    </label>
                  </th>

                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="mask mask-squircle w-12 h-12">
                          <Image
                            width={48}
                            height={48}
                            src={pImg}
                            unoptimized={productImageUnoptimized(pImg)}
                            alt={sanitize(product?.title) || "Product image"}
                            className="w-auto h-auto object-cover"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {sanitize(product?.title)}
                        </div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-widest">
                          {sanitize(product?.manufacturer)}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4">
                    {product?.inStock ? (
                      <span className="px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider bg-green-50 text-green-600 border border-green-100">
                        Em estoque
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider bg-red-50 text-red-600 border border-red-100">
                        Esgotado
                      </span>
                    )}
                  </td>
                  <td className="py-4 font-medium text-gray-900">
                    R$ {product?.price}
                  </td>
                  <th className="py-4 text-right pr-6">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-[10px] font-medium uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                    >
                      Editar
                    </Link>
                  </th>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardProductTable;
