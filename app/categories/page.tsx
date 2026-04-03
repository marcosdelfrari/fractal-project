"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import apiClient from "@/lib/api";
import { formatCategoryName } from "@/utils/categoryFormating";
import { FaThLarge, FaChevronRight } from "react-icons/fa";

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const response = await apiClient.get("/api/categories");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCats();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#E3E1D6] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#E3E1D6] min-h-screen">
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col items-center mb-16">
          <div className="p-4 bg-white rounded-full mb-6 border border-gray-100">
            <FaThLarge size={24} className="text-gray-900" />
          </div>
          <h1 className="text-4xl font-light tracking-[0.2em] text-gray-900 uppercase text-center mb-4">
            Categorias
          </h1>
          <div className="w-20 h-px bg-gray-200"></div>
          <p className="mt-6 text-gray-400 font-light tracking-wide text-center max-w-md">
            Explore nossa curadoria de produtos organizada por categorias para
            facilitar sua busca.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/loja/${category.name}`}
              className="group block relative overflow-hidden bg-white rounded-[2.5rem] border border-gray-100 transition-all duration-500 hover:border-gray-200"
            >
              <div className="aspect-[4/5] relative overflow-hidden">
                <Image
                  src="/categ.webp" // Placeholder, as category model doesn't have an image field yet
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                  <h2 className="text-2xl font-light tracking-widest uppercase mb-2">
                    {formatCategoryName(category.name)}
                  </h2>
                  <div className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase font-medium opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                    <span>Explorar Coleção</span>
                    <FaChevronRight size={8} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100">
            <p className="text-gray-400 font-light italic">
              Nenhuma categoria encontrada no momento.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default CategoriesPage;
