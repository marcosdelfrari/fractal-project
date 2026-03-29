"use client";
import { DashboardSidebar } from "@/components";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, use } from "react";
import toast from "react-hot-toast";
import {
  convertCategoryNameToURLFriendly as convertSlugToURLFriendly,
  formatCategoryName,
} from "../../../../../utils/categoryFormating";
import { nanoid } from "nanoid";
import apiClient from "@/lib/api";
import { FaEdit, FaTrash, FaImage, FaTag, FaBox, FaInfoCircle, FaChevronLeft } from "react-icons/fa";

interface DashboardProductDetailsProps {
  params: Promise<{ id: string }>;
}

const DashboardProductDetails = ({ params }: DashboardProductDetailsProps) => {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [product, setProduct] = useState<Product>();
  const [categories, setCategories] = useState<Category[]>();
  const [otherImages, setOtherImages] = useState<OtherImages[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const deleteProduct = async () => {
    if (!window.confirm("Tem certeza que deseja excluir este produto?")) return;
    
    setIsDeleting(true);
    apiClient
      .delete(`/api/products/${id}`)
      .then((response) => {
        if (response.status !== 204) {
          if (response.status === 400) {
            toast.error("Não é possível excluir o produto pois ele está em pedidos existentes.");
          } else {
            throw Error("Erro ao excluir produto");
          }
        } else {
          toast.success("Produto excluído com sucesso");
          router.push("/admin/products");
        }
      })
      .catch(() => toast.error("Erro ao excluir produto"))
      .finally(() => setIsDeleting(false));
  };

  const updateProduct = async () => {
    if (
      !product?.title ||
      !product?.slug ||
      product?.price === undefined ||
      !product?.manufacturer ||
      !product?.description
    ) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setIsUpdating(true);
    apiClient
      .put(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      })
      .then((response) => {
        if (response.status === 200) {
          toast.success("Produto atualizado com sucesso");
          return response.json();
        } else {
          throw Error("Erro ao atualizar produto");
        }
      })
      .catch(() => toast.error("Erro ao atualizar produto"))
      .finally(() => setIsUpdating(false));
  };

  const uploadFile = async (file: any) => {
    const formData = new FormData();
    formData.append("uploadedFile", file);

    try {
      const response = await apiClient.post("/api/main-image", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast.success("Imagem atualizada!");
      } else {
        toast.error("Erro no upload da imagem.");
      }
    } catch (error) {
      toast.error("Erro ao enviar imagem");
    }
  };

  const fetchProductData = async () => {
    apiClient
      .get(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data));

    apiClient.get(`/api/images/${id}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((images) => setOtherImages(images));
  };

  const fetchCategories = async () => {
    apiClient
      .get(`/api/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data));
  };

  useEffect(() => {
    fetchCategories();
    fetchProductData();
  }, [id]);

  return (
    <div className="bg-gray-50 flex min-h-screen max-w-screen-2xl mx-auto max-xl:flex-col animate-fade-in-up">
      <DashboardSidebar />
      <div className="flex-1 p-10 max-md:p-4">
        {/* Header Section */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push("/admin/products")}
              className="p-3 bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 transition-colors"
            >
              <FaChevronLeft size={14} />
            </button>
            <div className="p-3 bg-gray-50 rounded-full text-gray-900">
              <FaEdit size={16} />
            </div>
            <h1 className="text-lg font-light tracking-widest text-gray-900 uppercase">
              Detalhes do Produto
            </h1>
          </div>
          
          <button
            onClick={deleteProduct}
            disabled={isDeleting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-red-100 text-[10px] uppercase tracking-widest font-medium text-red-400 hover:bg-red-50 hover:text-red-600 transition-all duration-300 disabled:opacity-50"
          >
            <FaTrash size={10} />
            {isDeleting ? "Excluindo..." : "Excluir Produto"}
          </button>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 space-y-12 transition-all duration-300">
          {/* Informações Básicas */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-gray-50 rounded-full text-gray-400">
                <FaTag size={12} />
              </div>
              <h2 className="text-sm font-light tracking-widest text-gray-900 uppercase">Informações Básicas</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1">Nome do Produto</label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-2xl py-4 px-6 transition-all duration-300 text-gray-900"
                  value={product?.title || ""}
                  onChange={(e) => setProduct({ ...product!, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1">Slug</label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-2xl py-4 px-6 transition-all duration-300 text-gray-900"
                  value={product?.slug ? convertSlugToURLFriendly(product?.slug) : ""}
                  onChange={(e) => setProduct({ ...product!, slug: convertSlugToURLFriendly(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1">Fabricante</label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-2xl py-4 px-6 transition-all duration-300 text-gray-900"
                  value={product?.manufacturer || ""}
                  onChange={(e) => setProduct({ ...product!, manufacturer: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1">Categoria</label>
                <select
                  className="w-full bg-gray-50 border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-2xl py-4 px-6 transition-all duration-300 text-gray-900 appearance-none cursor-pointer"
                  value={product?.categoryId || ""}
                  onChange={(e) => setProduct({ ...product!, categoryId: e.target.value })}
                >
                  {categories?.map((category: Category) => (
                    <option key={category?.id} value={category?.id}>
                      {formatCategoryName(category?.name)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Preço e Estoque */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-gray-50 rounded-full text-gray-400">
                <FaBox size={12} />
              </div>
              <h2 className="text-sm font-light tracking-widest text-gray-900 uppercase">Preço e Estoque</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1">Preço (R$)</label>
                <input
                  type="number"
                  className="w-full bg-gray-50 border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-2xl py-4 px-6 transition-all duration-300 text-gray-900"
                  value={product?.price || 0}
                  onChange={(e) => setProduct({ ...product!, price: Number(e.target.value) })}
                />
              </div>

              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">Em estoque?</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={(product?.inStock || 0) > 0} 
                      onChange={(e) => {
                        const hasStock = e.target.checked;
                        setProduct({ ...product!, inStock: hasStock ? ((product?.inStock || 0) > 0 ? product!.inStock : 1) : 0 });
                      }}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>
                
                {(product?.inStock || 0) > 0 && (
                  <div className="space-y-2 animate-fade-in">
                    <label className="text-[10px] text-gray-400 uppercase tracking-tighter italic">Quantidade disponível</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full bg-white border-transparent focus:border-gray-100 focus:ring-0 rounded-xl py-2 px-4 text-sm transition-all duration-300 text-gray-900"
                      value={product?.inStock}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setProduct({ ...product!, inStock: isNaN(val) ? 0 : val });
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Imagens */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-gray-50 rounded-full text-gray-400">
                <FaImage size={12} />
              </div>
              <h2 className="text-sm font-light tracking-widest text-gray-900 uppercase">Imagens</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1">Imagem Principal</label>
                <div className="relative group border-2 border-dashed border-gray-100 rounded-[2rem] p-4 transition-all duration-300 hover:border-gray-200 hover:bg-gray-50/50">
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0];
                      if (selectedFile) {
                        uploadFile(selectedFile);
                        setProduct({ ...product!, mainImage: selectedFile.name });
                      }
                    }}
                  />
                  <div className="flex flex-col items-center justify-center py-6">
                    {product?.mainImage ? (
                      <div className="relative w-40 h-40">
                        <Image
                          src={`/` + product?.mainImage}
                          alt={product?.title}
                          fill
                          className="rounded-2xl object-cover border border-gray-100"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center transition-all duration-300">
                          <span className="text-white text-[10px] uppercase tracking-widest">Alterar</span>
                        </div>
                      </div>
                    ) : (
                      <FaImage size={32} className="text-gray-200" />
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1">Galeria</label>
                <div className="border-2 border-dashed border-gray-100 rounded-[2rem] p-4 min-h-[148px] flex flex-wrap gap-3">
                  {otherImages?.map((image) => (
                    <div key={nanoid()} className="relative w-20 h-20">
                      <Image
                        src={`/${image.image}`}
                        alt="Product image"
                        fill
                        className="rounded-xl object-cover border border-gray-100 shadow-none"
                      />
                    </div>
                  ))}
                  <div className="w-20 h-20 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-gray-300 text-xs">...</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Descrição */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-gray-50 rounded-full text-gray-400">
                <FaInfoCircle size={12} />
              </div>
              <h2 className="text-sm font-light tracking-widest text-gray-900 uppercase">Descrição</h2>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1">Descrição do Produto</label>
              <textarea
                className="w-full bg-gray-50 border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-3xl py-6 px-8 transition-all duration-300 text-gray-900 h-48 leading-relaxed resize-none"
                value={product?.description || ""}
                onChange={(e) => setProduct({ ...product!, description: e.target.value })}
              ></textarea>
            </div>
          </section>
          
          <div className="flex justify-end gap-x-4 pt-10 border-t border-gray-50">
            <button
               type="button"
               onClick={() => router.push("/admin/products")}
               className="px-8 py-3.5 rounded-full border border-gray-200 text-[11px] uppercase tracking-widest font-medium text-gray-400 hover:text-gray-900 hover:border-gray-900 transition-all duration-300"
            >
              Voltar
            </button>
            <button
              onClick={updateProduct}
              disabled={isUpdating}
              className="px-12 py-3.5 rounded-full bg-black text-[11px] uppercase tracking-widest font-medium text-white hover:bg-zinc-800 transition-all duration-300 disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center gap-2 shadow-none"
            >
              {isUpdating ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardProductDetails;