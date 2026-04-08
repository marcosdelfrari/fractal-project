"use client";
import { DashboardSidebar } from "@/components";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { formatCategoryName } from "../../../../utils/categoryFormating";
import apiClient from "@/lib/api";
import { MdCategory } from "react-icons/md";
import { FaSearch } from "react-icons/fa";

const DashboardCategory = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // getting all categories to be displayed on the all categories page
  useEffect(() => {
    apiClient
      .get("/api/categories")
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setCategories(data);
      });
  }, []);

  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => {
      const name = (c.name || "").toLowerCase();
      const formatted = formatCategoryName(c.name || "").toLowerCase();
      const id = (c.id || "").toLowerCase();
      return name.includes(q) || formatted.includes(q) || id.includes(q);
    });
  }, [categories, searchQuery]);

  return (
    <div className="bg-white flex min-h-screen max-w-screen-2xl mx-auto max-lg:flex-col animate-fade-in-up">
      <DashboardSidebar />
      <div className="flex-1 p-10 max-md:p-4 pb-admin-mobile-nav">
        {/* Header Section */}
        <div className="flex items-center gap-3 border-b border-gray-100 pb-6 mb-10">
          <div className="p-3 bg-[#E3E1D6] rounded-full text-gray-900">
            <MdCategory size={16} />
          </div>
          <h1 className="text-lg font-light tracking-widest text-gray-900 uppercase">
            Gerenciar Categorias
          </h1>
        </div>

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
              placeholder="Buscar por nome ou ID..."
              className="w-full bg-[#E3E1D6] border border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-full py-3 pl-10 pr-5 text-sm text-gray-900 placeholder:text-gray-400"
              autoComplete="off"
            />
          </div>
          <Link
            href="/admin/categories/new"
            className="shrink-0 self-end sm:self-auto"
          >
            <button
              type="button"
              className="flex items-center justify-center rounded-full bg-black px-6 py-3 text-[11px] uppercase tracking-widest font-medium text-white hover:bg-zinc-800 transition-all duration-300"
            >
              Adicionar Categoria
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
                  Nome da Categoria
                </th>
                <th className="py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.length > 0 &&
              searchQuery.trim() &&
              filteredCategories.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="py-12 text-center text-sm text-gray-400"
                  >
                    Nenhuma categoria encontrada para essa busca.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category: Category) => (
                  <tr
                    key={category.id}
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
                        <p className="font-medium text-gray-900">
                          {formatCategoryName(category?.name)}
                        </p>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardCategory;
