// *********************
// Role of the component: Product table component on admin dashboard page
// Name of the component: DashboardProductTable.tsx
// Version: 1.0
// Component call: <DashboardProductTable />
// Input parameters: no input parameters
// Output: products table
// *********************

"use client";
import { nanoid } from "nanoid";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import CustomButton from "./CustomButton";
import apiClient from "@/lib/api";
import { sanitize } from "@/lib/sanitize";

const DashboardProductTable = () => {
  const [products, setProducts] = useState<Product[]>([]);

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

  return (
    <div className="w-full">
      <div className="flex justify-end mb-8">
        <Link href="/admin/products/new">
          <button className="flex items-center justify-center rounded-full bg-black px-6 py-3 text-[11px] uppercase tracking-widest font-medium text-white hover:bg-zinc-800 transition-all duration-300">
            Adicionar Produto
          </button>
        </Link>
      </div>

      <div className="w-full overflow-auto h-[70vh] bg-white rounded-3xl border border-gray-100">
        <table className="table table-md table-pin-cols">
          {/* head */}
          <thead className="bg-gray-50/50">
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
            {/* row 1 */}
            {products &&
              products.map((product) => (
                <tr
                  key={nanoid()}
                  className="hover:bg-gray-50/50 transition-colors"
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
                            src={
                              product?.mainImage
                                ? `/${product?.mainImage}`
                                : "/product_placeholder.jpg"
                            }
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
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardProductTable;
