"use client";
import { DashboardSidebar } from "@/components";
import apiClient from "@/lib/api";
import { convertCategoryNameToURLFriendly as convertSlugToURLFriendly } from "@/utils/categoryFormating";
import { sanitizeFormData } from "@/lib/form-sanitize";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { nanoid } from "nanoid";
import { FaPlus, FaImage, FaTag, FaBox, FaInfoCircle } from "react-icons/fa";
import MultiValueInput from "@/components/MultiValueInput";

interface SecondaryImage {
  id: string;
  file: File;
  preview: string;
  name: string;
}

const AddNewProduct = () => {
  const [product, setProduct] = useState<{
    title: string;
    price: number;
    manufacturer: string;
    inStock: number;
    mainImage: string;
    description: string;
    additionalInfo: string;
    material: string;
    colors: { name: string; class?: string }[];
    sizes: string[];
    slug: string;
    categoryId: string;
  }>({
    title: "",
    price: 0,
    manufacturer: "",
    inStock: 1,
    mainImage: "",
    description: "",
    additionalInfo: "",
    material: "",
    colors: [],
    sizes: [],
    slug: "",
    categoryId: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [mainImagePreview, setMainImagePreview] = useState<string>("");
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [secondaryImages, setSecondaryImages] = useState<SecondaryImage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const getImageBaseName = (index: number) =>
    convertSlugToURLFriendly(product?.slug || product?.title || "produto") +
    `-${index}`;

  const addProduct = async () => {
    if (
      product.title === "" ||
      product.manufacturer === "" ||
      product.description == "" ||
      product.slug === ""
    ) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    if (!mainImageFile && !product.mainImage) {
      toast.error("Por favor, selecione uma imagem principal");
      return;
    }

    setIsSubmitting(true);

    try {
      const productToSend = {
        ...product,
        mainImage: product.mainImage || mainImageFile?.name || "",
      };

      const sanitizedProduct = sanitizeFormData(productToSend);
      const response = await apiClient.post(`/api/products`, sanitizedProduct);

      if (response.status === 201) {
        const data = await response.json();
        const productId = data.id;

        if (secondaryImages.length > 0) {
          for (const [index, img] of secondaryImages.entries()) {
            const uploadedFileName = await uploadFile(
              img.file,
              getImageBaseName(index + 2),
            );
            await apiClient.post("/api/images", {
              productID: productId,
              image: uploadedFileName,
            });
          }
        }

        toast.success("Produto adicionado com sucesso!");

        setProduct({
          title: "",
          price: 0,
          manufacturer: "",
          inStock: 1,
          mainImage: "",
          description: "",
          additionalInfo: "",
          material: "",
          colors: [],
          sizes: [],
          slug: "",
          categoryId: categories[0]?.id || "",
        });
        setMainImagePreview("");
        setMainImageFile(null);
        setSecondaryImages([]);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Erro ao adicionar produto");
      }
    } catch (error) {
      toast.error("Erro ao adicionar produto");
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadFile = async (file: File, desiredFileName?: string) => {
    const formData = new FormData();
    formData.append("uploadedFile", file);
    if (desiredFileName) {
      formData.append("desiredFileName", desiredFileName);
    }

    try {
      const response = await fetch("/api/main-image", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.message || `Erro no upload da imagem (${response.status})`,
        );
      }
      const data = await response.json();
      return data.fileName || file.name;
    } catch (error) {
      throw error;
    }
  };

  const handleMainImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setMainImageFile(selectedFile);
      const previewUrl = URL.createObjectURL(selectedFile);
      setMainImagePreview(previewUrl);

      try {
        const uploadedFileName = await uploadFile(
          selectedFile,
          getImageBaseName(1),
        );
        setProduct((prev) => ({ ...prev, mainImage: uploadedFileName }));
        toast.success("Imagem principal carregada!");
      } catch (error) {
        toast.error("Erro ao fazer upload da imagem");
      }
    }
  };

  const handleSecondaryImagesChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newImages: SecondaryImage[] = Array.from(files).map((file) => ({
        id: nanoid(),
        file: file,
        preview: URL.createObjectURL(file),
        name: file.name,
      }));
      setSecondaryImages([...secondaryImages, ...newImages]);
    }
  };

  const removeSecondaryImage = (id: string) => {
    setSecondaryImages(secondaryImages.filter((img) => img.id !== id));
  };

  const fetchCategories = async () => {
    apiClient
      .get(`/api/categories`)
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        setProduct((prev) => ({ ...prev, categoryId: data[0]?.id }));
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="bg-white flex min-h-screen max-w-screen-2xl mx-auto max-lg:flex-col animate-fade-in-up">
      <DashboardSidebar />
      <div className="flex-1 p-10 max-md:p-4 pb-admin-mobile-nav">
        {/* Header Section */}
        <div className="flex items-center gap-3 border-b border-gray-100 pb-6 mb-10">
          <div className="p-3 bg-[#E3E1D6] rounded-full text-gray-900">
            <FaPlus size={16} />
          </div>
          <h1 className="text-lg font-light tracking-widest text-gray-900 uppercase">
            Novo Produto
          </h1>
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
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Camiseta Básica"
                  className="w-full bg-[#E3E1D6] border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-2xl py-4 px-6 transition-all duration-300 text-gray-900 placeholder:text-gray-300"
                  value={product?.title}
                  onChange={(e) =>
                    setProduct({ ...product, title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1">
                  Slug do Produto *
                </label>
                <input
                  type="text"
                  placeholder="ex-camiseta-basica"
                  className="w-full bg-[#E3E1D6] border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-2xl py-4 px-6 transition-all duration-300 text-gray-900 placeholder:text-gray-300"
                  value={convertSlugToURLFriendly(product?.slug)}
                  onChange={(e) =>
                    setProduct({
                      ...product,
                      slug: convertSlugToURLFriendly(e.target.value),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1">
                  Categoria
                </label>
                <select
                  className="w-full bg-[#E3E1D6] border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-2xl py-4 px-6 transition-all duration-300 text-gray-900 appearance-none cursor-pointer"
                  value={product?.categoryId}
                  onChange={(e) =>
                    setProduct({ ...product, categoryId: e.target.value })
                  }
                >
                  {categories.map((category: any) => (
                    <option key={category?.id} value={category?.id}>
                      {category?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1">
                  Fabricante *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Marca XYZ"
                  className="w-full bg-[#E3E1D6] border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-2xl py-4 px-6 transition-all duration-300 text-gray-900 placeholder:text-gray-300"
                  value={product?.manufacturer}
                  onChange={(e) =>
                    setProduct({ ...product, manufacturer: e.target.value })
                  }
                />
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
                  Preço (R$) *
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full bg-[#E3E1D6] border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-2xl py-4 px-6 transition-all duration-300 text-gray-900 placeholder:text-gray-300"
                  value={product?.price}
                  onChange={(e) =>
                    setProduct({ ...product, price: Number(e.target.value) })
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
                      checked={product.inStock > 0}
                      onChange={(e) => {
                        const hasStock = e.target.checked;
                        if (!hasStock) {
                          setProduct({ ...product, inStock: 0 });
                        } else if (product.inStock <= 0) {
                          setProduct({ ...product, inStock: 1 });
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
                    className={`w-full bg-[#E3E1D6] border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-2xl py-4 px-6 transition-all duration-300 text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${product.inStock <= 0 ? "opacity-50 grayscale" : ""}`}
                    value={product.inStock || 0}
                    onWheel={(e) =>
                      (e.currentTarget as HTMLInputElement).blur()
                    }
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setProduct({ ...product, inStock: isNaN(val) ? 0 : val });
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
                Imagens do Produto
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                  Imagem Principal <span className="text-red-400">*</span>
                </label>
                <div className="relative group cursor-pointer border-2 border-dashed border-gray-100 rounded-[2rem] p-4 transition-all duration-300 hover:border-gray-200 hover:bg-[#E3E1D6]/50">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={handleMainImageChange}
                  />
                  <div className="flex flex-col items-center justify-center py-6">
                    {mainImagePreview ? (
                      <div className="relative w-40 h-40">
                        <img
                          src={mainImagePreview}
                          alt="Preview"
                          className="w-full h-full rounded-2xl object-cover border border-gray-100"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center transition-all duration-300">
                          <span className="text-white text-[10px] uppercase tracking-widest">
                            Alterar
                          </span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <FaImage size={32} className="text-gray-200 mb-2" />
                        <span className="text-xs text-gray-400 font-light">
                          Selecione a imagem principal
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1 flex items-center justify-between w-full">
                  Imagens Secundárias
                  <span className="text-[9px] text-gray-300 tracking-normal italic uppercase">
                    Múltiplas imagens
                  </span>
                </label>
                <div className="border-2 border-dashed border-gray-100 rounded-[2rem] p-4 min-h-[148px] flex flex-wrap gap-3 transition-all duration-300 hover:border-gray-200">
                  {secondaryImages.map((img, index) => (
                    <div key={img.id} className="relative group w-20 h-20">
                      <img
                        src={img.preview}
                        alt={`Imagem ${index + 1}`}
                        className="w-full h-full rounded-xl object-cover border border-gray-100 shadow-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeSecondaryImage(img.id)}
                        className="absolute -top-1.5 -right-1.5 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-all duration-300"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <div className="relative w-20 h-20 flex items-center justify-center bg-[#E3E1D6] rounded-xl cursor-pointer hover:bg-gray-100 transition-all duration-300">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      multiple
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleSecondaryImagesChange}
                    />
                    <FaPlus size={16} className="text-gray-300" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Detalhes */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-[#E3E1D6] rounded-full text-gray-400">
                <FaInfoCircle size={12} />
              </div>
              <h2 className="text-sm font-light tracking-widest text-gray-900 uppercase">
                Detalhes e Descrição
              </h2>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1">
                Descrição Completa *
              </label>
              <textarea
                className="w-full bg-[#E3E1D6] border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-3xl py-6 px-8 transition-all duration-300 text-gray-900 placeholder:text-gray-300 h-48 leading-relaxed resize-none"
                placeholder="Descreva os detalhes, características e benefícios do produto..."
                value={product?.description}
                onChange={(e) =>
                  setProduct({ ...product, description: e.target.value })
                }
              ></textarea>
            </div>

            <div className="space-y-2 mt-6">
              <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1">
                Informações Adicionais (Opcional)
              </label>
              <textarea
                className="w-full bg-[#E3E1D6] border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-3xl py-6 px-8 transition-all duration-300 text-gray-900 placeholder:text-gray-300 h-32 leading-relaxed resize-none"
                placeholder="Ex: material, cuidados, composição, observações..."
                value={product?.additionalInfo}
                onChange={(e) =>
                  setProduct({ ...product, additionalInfo: e.target.value })
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
                  placeholder="Ex: Alumínio"
                  className="w-full bg-[#E3E1D6] border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-2xl py-4 px-6 transition-all duration-300 text-gray-900 placeholder:text-gray-300"
                  value={product.material}
                  onChange={(e) =>
                    setProduct({ ...product, material: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <MultiValueInput
                  label="Cores (Opcional)"
                  placeholder="Ex: Preto, Prata"
                  values={
                    Array.isArray(product.colors)
                      ? product.colors.map((c) => c.name)
                      : []
                  }
                  onChange={(nextColors) =>
                    setProduct({
                      ...product,
                      colors: nextColors.map((name) => ({ name })),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <MultiValueInput
                  label="Tamanhos (Opcional)"
                  placeholder="Ex: P, M, G"
                  values={Array.isArray(product.sizes) ? product.sizes : []}
                  onChange={(nextSizes) =>
                    setProduct({
                      ...product,
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
              onClick={() => window.history.back()}
              className="px-8 py-3.5 rounded-full border border-gray-200 text-[11px] uppercase tracking-widest font-medium text-gray-400 hover:text-gray-900 hover:border-gray-900 transition-all duration-300"
            >
              Cancelar
            </button>
            <button
              onClick={addProduct}
              type="button"
              disabled={isSubmitting}
              className="px-12 py-3.5 rounded-full bg-black text-[11px] uppercase tracking-widest font-medium text-white hover:bg-zinc-800 transition-all duration-300 disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center gap-2 shadow-none"
            >
              {isSubmitting ? (
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
                  Processando...
                </>
              ) : (
                "Cadastrar Produto"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNewProduct;
