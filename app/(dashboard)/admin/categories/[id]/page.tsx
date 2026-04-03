"use client";
import { DashboardSidebar } from "@/components";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, use } from "react";
import toast from "react-hot-toast";
import { formatCategoryName } from "../../../../../utils/categoryFormating";
import { convertCategoryNameToURLFriendly } from "../../../../../utils/categoryFormating";
import apiClient from "@/lib/api";
import { MdCategory, MdEdit, MdChevronLeft, MdDelete, MdLabel } from "react-icons/md";

interface DashboardSingleCategoryProps {
  params: Promise<{ id: string }>;
}

const DashboardSingleCategory = ({ params }: DashboardSingleCategoryProps) => {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [categoryInput, setCategoryInput] = useState<{ name: string }>({
    name: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const deleteCategory = async () => {
    if (!window.confirm("Excluir esta categoria? Apenas categorias sem produtos vinculados podem ser removidas.")) return;
    
    setIsDeleting(true);
    apiClient
      .delete(`/api/categories/${id}`)
      .then(async (response) => {
        if (response.status === 204) {
          toast.success("Categoria excluída com sucesso");
          router.push("/admin/categories");
          return;
        }

        const errorPayload = await response.json().catch(() => null);
        throw new Error(errorPayload?.error || "Erro ao excluir categoria");
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Erro ao excluir categoria";
        toast.error(message);
      })
      .finally(() => setIsDeleting(false));
  };

  const updateCategory = async () => {
    if (categoryInput.name.length === 0) {
      toast.error("O nome da categoria é obrigatório");
      return;
    }

    setIsUpdating(true);
    apiClient
      .put(`/api/categories/${id}`, {
        name: convertCategoryNameToURLFriendly(categoryInput.name),
      })
      .then((response) => {
        if (response.status === 200) {
          toast.success("Categoria atualizada com sucesso");
          return response.json();
        } else {
          throw Error("Erro ao atualizar categoria");
        }
      })
      .catch(() => toast.error("Erro ao atualizar categoria"))
      .finally(() => setIsUpdating(false));
  };

  useEffect(() => {
    apiClient
      .get(`/api/categories/${id}`)
      .then((res) => res.json())
      .then((data) => setCategoryInput({ name: data?.name }));
  }, [id]);

  return (
    <div className="bg-[#E3E1D6] flex min-h-screen max-w-screen-2xl mx-auto max-lg:flex-col animate-fade-in-up">
      <DashboardSidebar />
      <div className="flex-1 p-10 max-md:p-4">
        {/* Header Section */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push("/admin/categories")}
              className="p-3 bg-[#E3E1D6] rounded-full text-gray-400 hover:text-gray-900 transition-colors"
            >
              <MdChevronLeft size={16} />
            </button>
            <div className="p-3 bg-[#E3E1D6] rounded-full text-gray-900">
              <MdEdit size={16} />
            </div>
            <h1 className="text-lg font-light tracking-widest text-gray-900 uppercase">
              Detalhes da Categoria
            </h1>
          </div>
          
          <button
            onClick={deleteCategory}
            disabled={isDeleting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-red-100 text-[10px] uppercase tracking-widest font-medium text-red-400 hover:bg-red-50 hover:text-red-600 transition-all duration-300 disabled:opacity-50"
          >
            <MdDelete size={14} />
            {isDeleting ? "Excluindo..." : "Excluir Categoria"}
          </button>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 space-y-12 transition-all duration-300">
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-[#E3E1D6] rounded-full text-gray-400">
                <MdLabel size={12} />
              </div>
              <h2 className="text-sm font-light tracking-widest text-gray-900 uppercase">Nome e Identificação</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2 md:col-span-2">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1">Nome da Categoria</label>
                <input
                  type="text"
                  className="w-full bg-[#E3E1D6] border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-2xl py-4 px-6 transition-all duration-300 text-gray-900 font-medium"
                  value={formatCategoryName(categoryInput.name)}
                  onChange={(e) => setCategoryInput({ name: e.target.value })}
                />
                <p className="text-[10px] text-gray-300 px-1 uppercase tracking-tighter italic mt-2">
                  Slug gerado: {convertCategoryNameToURLFriendly(categoryInput.name)}
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
              Voltar
            </button>
            <button
              onClick={updateCategory}
              disabled={isUpdating}
              className="px-12 py-3.5 rounded-full bg-black text-[11px] uppercase tracking-widest font-medium text-white hover:bg-zinc-800 transition-all duration-300 disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center gap-2 shadow-none"
            >
              {isUpdating ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </div>

        <div className="mt-8 p-6 bg-red-50/50 border border-red-100 rounded-3xl">
          <p className="text-[10px] text-red-400 uppercase tracking-widest font-medium mb-1">Atenção</p>
          <p className="text-xs text-red-500 font-light leading-relaxed">
            Categorias com produtos vinculados não podem ser excluídas. Mova os produtos para outra categoria antes de prosseguir.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardSingleCategory;