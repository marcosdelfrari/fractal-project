"use client";
import { DashboardSidebar } from "@/components";
import { nanoid } from "nanoid";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { formatCategoryName } from "../../../../utils/categoryFormating";
import apiClient from "@/lib/api";
import { MdCategory } from "react-icons/md";

const DashboardCategory = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  // getting all categories to be displayed on the all categories page
  useEffect(() => {
    apiClient.get("/api/categories")
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setCategories(data);
      });
  }, []);

  return (
    <div className="bg-gray-50 flex min-h-screen max-w-screen-2xl mx-auto max-xl:flex-col animate-fade-in-up">
      <DashboardSidebar />
      <div className="flex-1 p-10 max-md:p-4">
        {/* Header Section */}
        <div className="flex items-center gap-3 border-b border-gray-100 pb-6 mb-10">
          <div className="p-3 bg-gray-50 rounded-full text-gray-900">
            <MdCategory size={16} />
          </div>
          <h1 className="text-lg font-light tracking-widest text-gray-900 uppercase">
            Gerenciar Categorias
          </h1>
        </div>

        <div className="flex justify-end mb-8">
          <Link href="/admin/categories/new">
            <button className="flex items-center justify-center rounded-full bg-black px-6 py-3 text-[11px] uppercase tracking-widest font-medium text-white hover:bg-zinc-800 transition-all duration-300">
              Adicionar Categoria
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
                    <input type="checkbox" className="checkbox checkbox-sm rounded-md" />
                  </label>
                </th>
                <th className="py-4 text-[11px] font-light tracking-widest text-gray-500 uppercase">Nome da Categoria</th>
                <th className="py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories &&
                categories.map((category: Category) => (
                  <tr key={nanoid()} className="hover:bg-gray-50/50 transition-colors">
                    <th className="px-6">
                      <label>
                        <input type="checkbox" className="checkbox checkbox-sm rounded-md" />
                      </label>
                    </th>

                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <p className="font-medium text-gray-900">{formatCategoryName(category?.name)}</p>
                      </div>
                    </td>

                    <th className="py-4 text-right pr-6">
                      <Link
                        href={`/admin/categories/${category?.id}`}
                        className="text-[10px] font-medium uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                      >
                        Detalhes
                      </Link>
                    </th>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardCategory;