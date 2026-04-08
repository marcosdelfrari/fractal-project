"use client";
import { DashboardSidebar } from "@/components";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { convertCategoryNameToURLFriendly } from "../../../../../utils/categoryFormating";
import apiClient from "@/lib/api";
import {
  MdCategory,
  MdChevronLeft,
  MdAddCircle,
  MdLabel,
} from "react-icons/md";
import { useRouter } from "next/navigation";

const DashboardNewCategoryPage = () => {
  const [categoryInput, setCategoryInput] = useState({
    name: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const addNewCategory = () => {
    if (categoryInput.name.length === 0) {
      toast.error("Por favor, preencha o nome da categoria");
      return;
    }

    setIsSubmitting(true);
    apiClient
      .post(`/api/categories`, {
        name: convertCategoryNameToURLFriendly(categoryInput.name),
      })
      .then((response) => {
        if (response.status === 201) {
          toast.success("Categoria criada com sucesso");
          setCategoryInput({ name: "" });
          router.push("/admin/categories");
        } else {
          throw Error("Erro ao criar categoria");
        }
      })
      .catch(() => toast.error("Erro ao criar categoria"))
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="bg-white flex min-h-screen max-w-screen-2xl mx-auto max-lg:flex-col animate-fade-in-up">
      <DashboardSidebar />
      <div className="flex-1 p-10 max-md:p-4 pb-admin-mobile-nav">
        {/* Header Section */}
        <div className="flex items-center gap-3 border-b border-gray-100 pb-6 mb-10">
          <button
            onClick={() => router.push("/admin/categories")}
            className="p-3 bg-[#E3E1D6] rounded-full text-gray-400 hover:text-gray-900 transition-colors"
          >
            <MdChevronLeft size={16} />
          </button>
          <div className="p-3 bg-[#E3E1D6] rounded-full text-gray-900">
            <MdAddCircle size={16} />
          </div>
          <h1 className="text-lg font-light tracking-widest text-gray-900 uppercase">
            Nova Categoria
          </h1>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 space-y-12 transition-all duration-300">
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-[#E3E1D6] rounded-full text-gray-400">
                <MdLabel size={12} />
              </div>
              <h2 className="text-sm font-light tracking-widest text-gray-900 uppercase">
                Nome e Identificação
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2 md:col-span-2">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1">
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Eletrônicos, Roupas, etc."
                  className="w-full bg-[#E3E1D6] border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-2xl py-4 px-6 transition-all duration-300 text-gray-900 placeholder:text-gray-300"
                  value={categoryInput.name}
                  onChange={(e) =>
                    setCategoryInput({ ...categoryInput, name: e.target.value })
                  }
                />
                <p className="text-[10px] text-gray-300 px-1 uppercase tracking-tighter italic mt-2">
                  Slug será:{" "}
                  {convertCategoryNameToURLFriendly(categoryInput.name) ||
                    "---"}
                </p>
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-x-4 pt-10 border-t border-gray-50">
            <button
              type="button"
              onClick={() => router.push("/admin/categories")}
              className="px-8 py-3.5 rounded-full border border-gray-200 text-[11px] uppercase tracking-widest font-medium text-gray-400 hover:text-gray-900 hover:border-gray-900 transition-all duration-300"
            >
              Cancelar
            </button>
            <button
              onClick={addNewCategory}
              disabled={isSubmitting}
              className="px-12 py-3.5 rounded-full bg-black text-[11px] uppercase tracking-widest font-medium text-white hover:bg-zinc-800 transition-all duration-300 disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center gap-2 shadow-none"
            >
              {isSubmitting ? "Criando..." : "Criar Categoria"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardNewCategoryPage;
