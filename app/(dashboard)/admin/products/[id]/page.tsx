"use client";
import { DashboardSidebar } from "@/components";
import config from "@/lib/config";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, use } from "react";
import toast from "react-hot-toast";
import {
  convertCategoryNameToURLFriendly as convertSlugToURLFriendly,
  formatCategoryName,
} from "../../../../../utils/categoryFormating";
import apiClient from "@/lib/api";
import { sanitizeFormData } from "@/lib/form-sanitize";
import {
  FaEdit,
  FaTrash,
  FaImage,
  FaTag,
  FaBox,
  FaInfoCircle,
  FaChevronLeft,
  FaPlus,
} from "react-icons/fa";
import { ConfirmModal } from "@/components/ConfirmModal";
import MultiValueInput from "@/components/MultiValueInput";

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
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [stockEnabled, setStockEnabled] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const router = useRouter();
  const getImageSrc = (imageName?: string) =>
    imageName ? `/${imageName}` : "/product_placeholder.jpg";
  const getImageBaseName = (index: number) =>
    convertSlugToURLFriendly(product?.slug || product?.title || "produto") +
    `-${index}`;

  const deleteProduct = async () => {
    setIsDeleting(true);
    apiClient
      .delete(`/api/products/${id}`)
      .then((response) => {
        if (response.status !== 204) {
          if (response.status === 400) {
            toast.error(
              "Não é possível excluir o produto pois ele está em pedidos existentes.",
            );
          } else {
            throw Error("Erro ao excluir produto");
          }
        } else {
          toast.success("Produto excluído com sucesso");
          router.push("/admin/products");
        }
      })
      .catch(() => toast.error("Erro ao excluir produto"))
      .finally(() => {
        setIsDeleting(false);
        setIsProductModalOpen(false);
      });
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
    const sanitizedProduct = sanitizeFormData(product);
    apiClient
      .put(`/api/products/${id}`, sanitizedProduct)
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

  const uploadFile = async (file: File, desiredFileName?: string) => {
    const formData = new FormData();
    formData.append("uploadedFile", file);
    if (desiredFileName) {
      formData.append("desiredFileName", desiredFileName);
    }

    try {
      const response = await fetch(`${config.apiBaseUrl}/api/main-image`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return data.fileName || file.name;
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.message || `Erro no upload (${response.status})`,
        );
      }
    } catch (error: any) {
      throw new Error(error?.message || "Falha ao enviar arquivo");
    }
  };

  const handleGalleryImagesChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const uploadedImages: OtherImages[] = [];

    const startIndex = otherImages.length + 1;
    for (const [offset, file] of Array.from(files).entries()) {
      try {
        const uploadedFileName = await uploadFile(
          file,
          getImageBaseName(startIndex + offset),
        );

        const response = await apiClient.post("/api/images", {
          productID: id,
          image: uploadedFileName,
        });

        if (!response.ok) {
          throw new Error("Erro ao salvar imagem no produto");
        }

        const createdImage = await response.json();
        uploadedImages.push(createdImage);
      } catch (error: any) {
        toast.error(error?.message || `Erro ao enviar ${file.name}`);
      }
    }

    if (uploadedImages.length > 0) {
      setOtherImages((prev) => [...prev, ...uploadedImages]);
      toast.success(
        `${uploadedImages.length} imagem(ns) adicionada(s) na galeria`,
      );
    }

    e.target.value = "";
  };

  const fetchProductData = async () => {
    apiClient
      .get(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data));

    apiClient
      .get(`/api/images/${id}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((images) => setOtherImages(images));
  };

  const handleDeleteGalleryImage = async () => {
    if (!imageToDelete) return;

    setDeletingImageId(imageToDelete);
    try {
      const response = await apiClient.delete(`/api/images/${imageToDelete}`);
      if (!response.ok) {
        throw new Error("Erro ao excluir imagem");
      }

      setOtherImages((prev) =>
        prev.filter((img) => String(img.imageID) !== imageToDelete),
      );
      toast.success("Imagem removida da galeria");
    } catch (_) {
      toast.error("Não foi possível excluir a imagem");
    } finally {
      setDeletingImageId(null);
      setIsImageModalOpen(false);
      setImageToDelete(null);
    }
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

  useEffect(() => {
    setStockEnabled((product?.inStock || 0) > 0);
  }, [product?.inStock]);

  return (
    <div className="bg-white flex min-h-screen max-w-screen-2xl mx-auto max-lg:flex-col animate-fade-in-up">
      <DashboardSidebar />
      <div className="flex-1 p-10 max-md:p-4 pb-admin-mobile-nav">
        {/* Header Section */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/products")}
              className="p-3 bg-[#E3E1D6] rounded-full text-gray-400 hover:text-gray-900 transition-colors"
            >
              <FaChevronLeft size={14} />
            </button>
            <div className="p-3 bg-[#E3E1D6] rounded-full text-gray-900">
              <FaEdit size={16} />
            </div>
            <h1 className="text-lg font-light tracking-widest text-gray-900 uppercase">
              Detalhes do Produto
            </h1>
          </div>

          <button
            onClick={() => setIsProductModalOpen(true)}
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
              <div className="p-2 bg-[#E3E1D6] rounded-full text-gray-400">
                <FaTag size={12} />
              </div>
              <h2 className="text-sm font-light tracking-widest text-gray-900 uppercase">
                Informações Básicas
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1">
                  Nome do Produto
                </label>
                <input
                  type="text"
                  className="w-full bg-[#E3E1D6] border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-2xl py-4 px-6 transition-all duration-300 text-gray-900"
                  value={product?.title || ""}
                  onChange={(e) =>
                    setProduct({ ...product!, title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1">
                  Slug
                </label>
                <input
                  type="text"
                  className="w-full bg-[#E3E1D6] border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-2xl py-4 px-6 transition-all duration-300 text-gray-900"
                  value={
                    product?.slug ? convertSlugToURLFriendly(product?.slug) : ""
                  }
                  onChange={(e) =>
                    setProduct({
                      ...product!,
                      slug: convertSlugToURLFriendly(e.target.value),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1">
                  Fabricante
                </label>
                <input
                  type="text"
                  className="w-full bg-[#E3E1D6] border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-2xl py-4 px-6 transition-all duration-300 text-gray-900"
                  value={product?.manufacturer || ""}
                  onChange={(e) =>
                    setProduct({ ...product!, manufacturer: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1">
                  Categoria
                </label>
                <select
                  className="w-full bg-[#E3E1D6] border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-2xl py-4 px-6 transition-all duration-300 text-gray-900 appearance-none cursor-pointer"
                  value={product?.categoryId || ""}
                  onChange={(e) =>
                    setProduct({ ...product!, categoryId: e.target.value })
                  }
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
              <div className="p-2 bg-[#E3E1D6] rounded-full text-gray-400">
                <FaBox size={12} />
              </div>
              <h2 className="text-sm font-light tracking-widest text-gray-900 uppercase">
                Preço e Estoque
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1">
                  Preço (R$)
                </label>
                <input
                  type="number"
                  className="w-full bg-[#E3E1D6] border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-2xl py-4 px-6 transition-all duration-300 text-gray-900"
                  value={product?.price || 0}
                  onChange={(e) =>
                    setProduct({ ...product!, price: Number(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">
                    Em estoque?
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={stockEnabled}
                      onChange={(e) => {
                        const hasStock = e.target.checked;
                        setStockEnabled(hasStock);
                        if (!hasStock) {
                          setProduct({ ...product!, inStock: 0 });
                        } else if ((product?.inStock || 0) <= 0) {
                          setProduct({ ...product!, inStock: 1 });
                        }
                      }}
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className={`w-full bg-[#E3E1D6] border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-2xl py-4 px-6 transition-all duration-300 text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${!stockEnabled ? "opacity-50 grayscale" : ""}`}
                    value={product?.inStock || 0}
                    onWheel={(e) =>
                      (e.currentTarget as HTMLInputElement).blur()
                    }
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      const finalVal = isNaN(val) ? 0 : val;
                      setProduct({ ...product!, inStock: finalVal });
                      setStockEnabled(finalVal > 0);
                    }}
                    placeholder="0"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 uppercase font-medium tracking-widest pointer-events-none">
                    Unidades
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Imagens */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-[#E3E1D6] rounded-full text-gray-400">
                <FaImage size={12} />
              </div>
              <h2 className="text-sm font-light tracking-widest text-gray-900 uppercase">
                Imagens
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1">
                  Imagem Principal
                </label>
                <div className="relative group border-2 border-dashed border-gray-100 rounded-[2rem] p-4 transition-all duration-300 hover:border-gray-200 hover:bg-[#E3E1D6]/50">
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={async (e) => {
                      const selectedFile = e.target.files?.[0];
                      if (selectedFile) {
                        const uploadedFileName = await uploadFile(
                          selectedFile,
                          getImageBaseName(1),
                        );
                        if (!uploadedFileName) {
                          toast.error("Erro ao enviar imagem");
                          return;
                        }
                        toast.success("Imagem atualizada!");
                        setProduct({
                          ...product!,
                          mainImage: uploadedFileName,
                        });
                      }
                    }}
                  />
                  <div className="flex flex-col items-center justify-center py-6">
                    {product?.mainImage ? (
                      <div className="relative w-40 h-40">
                        <Image
                          src={getImageSrc(product?.mainImage)}
                          alt={product?.title}
                          fill
                          className="rounded-2xl object-cover border border-gray-100"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center transition-all duration-300">
                          <span className="text-white text-[10px] uppercase tracking-widest">
                            Alterar
                          </span>
                        </div>
                      </div>
                    ) : (
                      <FaImage size={32} className="text-gray-200" />
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1">
                  Galeria
                </label>
                <div className="border-2 border-dashed border-gray-100 rounded-[2rem] p-4 min-h-[148px] flex flex-wrap gap-3">
                  {otherImages?.map((image) => (
                    <button
                      key={image.imageID}
                      type="button"
                      onClick={() => {
                        setImageToDelete(String(image.imageID));
                        setIsImageModalOpen(true);
                      }}
                      disabled={deletingImageId === String(image.imageID)}
                      className="relative w-20 h-20 group cursor-pointer disabled:opacity-60"
                      title="Excluir imagem"
                    >
                      <Image
                        src={getImageSrc(image.image)}
                        alt="Product image"
                        fill
                        className="rounded-xl object-cover border border-gray-100 shadow-none"
                      />
                      <div className="absolute inset-0 rounded-xl bg-red-600/45 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                        <FaTrash size={14} className="text-white" />
                      </div>
                    </button>
                  ))}
                  <div className="relative w-20 h-20 flex items-center justify-center bg-[#E3E1D6] rounded-xl border border-gray-100 hover:bg-gray-100 transition-all duration-300">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      multiple
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleGalleryImagesChange}
                    />
                    <FaPlus size={16} className="text-gray-300" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Descrição */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-[#E3E1D6] rounded-full text-gray-400">
                <FaInfoCircle size={12} />
              </div>
              <h2 className="text-sm font-light tracking-widest text-gray-900 uppercase">
                Descrição
              </h2>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1">
                Descrição do Produto
              </label>
              <textarea
                className="w-full bg-[#E3E1D6] border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-3xl py-6 px-8 transition-all duration-300 text-gray-900 h-48 leading-relaxed resize-none"
                value={product?.description || ""}
                onChange={(e) =>
                  setProduct({ ...product!, description: e.target.value })
                }
              ></textarea>
            </div>

            <div className="space-y-2 mt-6">
              <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1">
                Informações Adicionais (Opcional)
              </label>
              <textarea
                className="w-full bg-[#E3E1D6] border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-3xl py-6 px-8 transition-all duration-300 text-gray-900 h-32 leading-relaxed resize-none"
                value={product?.additionalInfo || ""}
                onChange={(e) =>
                  setProduct({ ...product!, additionalInfo: e.target.value })
                }
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1">
                  Material (Opcional)
                </label>
                <input
                  type="text"
                  className="w-full bg-[#E3E1D6] border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-2xl py-4 px-6 transition-all duration-300 text-gray-900"
                  placeholder="Ex: Alumínio"
                  value={product?.material || ""}
                  onChange={(e) =>
                    setProduct({ ...product!, material: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <MultiValueInput
                  label="Cores (Opcional)"
                  placeholder="Ex: Preto, Prata"
                  values={
                    Array.isArray(product?.colors)
                      ? product.colors.map((color) => color.name)
                      : []
                  }
                  onChange={(nextColors) =>
                    setProduct({
                      ...product!,
                      colors: nextColors.map((name) => ({ name })),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <MultiValueInput
                  label="Tamanhos (Opcional)"
                  placeholder="Ex: P, M, G"
                  values={Array.isArray(product?.sizes) ? product.sizes : []}
                  onChange={(nextSizes) =>
                    setProduct({
                      ...product!,
                      sizes: nextSizes,
                    })
                  }
                />
              </div>
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
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
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

      <ConfirmModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onConfirm={deleteProduct}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este produto? Esta ação é irreversível."
        confirmText="Excluir"
        isLoading={isDeleting}
      />

      <ConfirmModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onConfirm={handleDeleteGalleryImage}
        title="Excluir Imagem"
        message="Tem certeza que deseja excluir esta imagem da galeria?"
        confirmText="Excluir"
        isLoading={deletingImageId !== null}
      />
    </div>
  );
};

export default DashboardProductDetails;
