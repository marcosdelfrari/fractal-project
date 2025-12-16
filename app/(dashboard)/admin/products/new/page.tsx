"use client";
import { DashboardSidebar } from "@/components";
import apiClient from "@/lib/api";
import config from "@/lib/config";
import { convertCategoryNameToURLFriendly as convertSlugToURLFriendly } from "@/utils/categoryFormating";
import { sanitizeFormData } from "@/lib/form-sanitize";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { nanoid } from "nanoid";

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
    slug: string;
    categoryId: string;
  }>({
    title: "",
    price: 0,
    manufacturer: "",
    inStock: 1,
    mainImage: "",
    description: "",
    slug: "",
    categoryId: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [mainImagePreview, setMainImagePreview] = useState<string>("");
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [secondaryImages, setSecondaryImages] = useState<SecondaryImage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addProduct = async () => {
    console.log("Current product state:", product);
    console.log("Main image file:", mainImageFile?.name);
    console.log("Main image preview:", mainImagePreview);
    
    if (
      product.title === "" ||
      product.manufacturer === "" ||
      product.description == "" ||
      product.slug === ""
    ) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    // Check if main image was selected (use mainImageFile as primary check)
    if (!mainImageFile && !product.mainImage) {
      toast.error("Por favor, selecione uma imagem principal");
      return;
    }

    setIsSubmitting(true);

    try {
      // Ensure mainImage is set from file if state wasn't updated
      const productToSend = {
        ...product,
        mainImage: product.mainImage || mainImageFile?.name || "",
      };
      
      // Sanitize form data before sending to API
      const sanitizedProduct = sanitizeFormData(productToSend);
      
      // apiClient.post already does JSON.stringify, so pass the object directly
      const response = await apiClient.post(`/api/products`, sanitizedProduct);
      
      if (response.status === 201) {
        const data = await response.json();
        const productId = data.id;

        // Upload secondary images and associate with the product
        if (secondaryImages.length > 0) {
          for (const img of secondaryImages) {
            // Upload the file first
            await uploadFile(img.file);
            
            // Then create the image record in database
            await apiClient.post("/api/images", {
              productID: productId,
              image: img.name,
            });
          }
        }

        toast.success("Produto adicionado com sucesso!");
        
        // Reset form
        setProduct({
          title: "",
          price: 0,
          manufacturer: "",
          inStock: 1,
          mainImage: "",
          description: "",
          slug: "",
          categoryId: categories[0]?.id || "",
        });
        setMainImagePreview("");
        setMainImageFile(null);
        setSecondaryImages([]);
      } else {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        toast.error(errorData.error || "Erro ao adicionar produto");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Erro ao adicionar produto");
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("uploadedFile", file);

    try {
      // Use fetch directly for FormData (not JSON)
      const response = await fetch(`${config.apiBaseUrl}/api/main-image`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        console.error("File upload unsuccessful");
        throw new Error("Upload failed");
      }
      return true;
    } catch (error) {
      console.error("Error happened while sending request:", error);
      throw error;
    }
  };

  const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      console.log("Selected main image:", selectedFile.name);
      
      // Store the file reference
      setMainImageFile(selectedFile);
      
      // Update state first with functional update to avoid closure issues
      setProduct((prev) => ({ ...prev, mainImage: selectedFile.name }));
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(selectedFile);
      setMainImagePreview(previewUrl);
      
      // Upload file in background (don't block UI)
      try {
        await uploadFile(selectedFile);
        toast.success("Imagem principal carregada!");
      } catch (error) {
        console.error("Error uploading main image:", error);
        toast.error("Erro ao fazer upload da imagem, mas você pode continuar");
      }
    }
  };

  const handleSecondaryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setCategories(data);
        setProduct({
          title: "",
          price: 0,
          manufacturer: "",
          inStock: 1,
          mainImage: "",
          description: "",
          slug: "",
          categoryId: data[0]?.id,
        });
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="bg-gray-50 flex min-h-screen max-w-screen-2xl mx-auto max-xl:flex-col">
      <DashboardSidebar />
      <div className="flex-1 p-8 max-md:p-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Adicionar Novo Produto</h1>
        <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informações Básicas */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">Informações Básicas</h2>
            </div>

            <div>
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text font-medium">Nome do Produto</span>
                </div>
                <input
                  type="text"
                  placeholder="Ex: Camiseta Básica"
                  className="input input-bordered w-full"
                  value={product?.title}
                  onChange={(e) =>
                    setProduct({ ...product, title: e.target.value })
                  }
                />
              </label>
            </div>

            <div>
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text font-medium">Slug do Produto</span>
                </div>
                <input
                  type="text"
                  placeholder="ex-camiseta-basica"
                  className="input input-bordered w-full"
                  value={convertSlugToURLFriendly(product?.slug)}
                  onChange={(e) =>
                    setProduct({
                      ...product,
                      slug: convertSlugToURLFriendly(e.target.value),
                    })
                  }
                />
              </label>
            </div>

            <div>
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text font-medium">Categoria</span>
                </div>
                <select
                  className="select select-bordered w-full"
                  value={product?.categoryId}
                  onChange={(e) =>
                    setProduct({ ...product, categoryId: e.target.value })
                  }
                >
                  {categories &&
                    categories.map((category: any) => (
                      <option key={category?.id} value={category?.id}>
                        {category?.name}
                      </option>
                    ))}
                </select>
              </label>
            </div>

            <div>
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text font-medium">Fabricante</span>
                </div>
                <input
                  type="text"
                  placeholder="Ex: Marca XYZ"
                  className="input input-bordered w-full"
                  value={product?.manufacturer}
                  onChange={(e) =>
                    setProduct({ ...product, manufacturer: e.target.value })
                  }
                />
              </label>
            </div>

            {/* Preço e Estoque */}
            <div className="md:col-span-2 mt-4">
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">Preço e Estoque</h2>
            </div>

            <div>
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text font-medium">Preço (R$)</span>
                </div>
                <input
                  type="number"
                  placeholder="0.00"
                  className="input input-bordered w-full"
                  value={product?.price}
                  onChange={(e) =>
                    setProduct({ ...product, price: Number(e.target.value) })
                  }
                />
              </label>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-4">
                  <span className="label-text font-medium">Controle de Estoque</span>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-success" 
                    checked={product.inStock > 0} 
                    onChange={(e) => {
                      const hasStock = e.target.checked;
                      setProduct({ ...product, inStock: hasStock ? (product.inStock > 0 ? product.inStock : 1) : 0 });
                    }}
                  />
                  <span className="label-text-alt font-bold">{product.inStock > 0 ? 'Em Estoque' : 'Sem Estoque'}</span>
                </label>
              </div>
              
              {product.inStock > 0 && (
                <div className="mt-3 animate-fade-in">
                  <label className="form-control w-full">
                    <div className="label">
                      <span className="label-text text-sm">Quantidade disponível</span>
                    </div>
                    <input
                      type="number"
                      min="1"
                      className="input input-bordered w-full bg-white"
                      value={product.inStock}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setProduct({ ...product, inStock: isNaN(val) ? 0 : val });
                      }}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Imagens */}
            <div className="md:col-span-2 mt-4">
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">Imagens do Produto</h2>
            </div>

            {/* Main Image Upload */}
            <div className="space-y-3">
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text font-medium">
                    Imagem Principal <span className="text-red-500">*</span>
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="file-input file-input-bordered w-full"
                  onChange={handleMainImageChange}
                />
              </label>
              {mainImagePreview && (
                <div className="relative inline-block mt-2">
                  <img
                    src={mainImagePreview}
                    alt={product?.title || "Preview"}
                    className="w-48 h-48 rounded-lg border-2 border-blue-200 shadow-md object-cover bg-white"
                  />
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full shadow-sm">
                    Principal
                  </span>
                </div>
              )}
            </div>

            {/* Secondary Images Upload */}
            <div className="space-y-3">
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text font-medium">
                    Imagens Secundárias
                  </span>
                  <span className="label-text-alt text-gray-500">
                    (Múltiplas imagens)
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  multiple
                  className="file-input file-input-bordered w-full"
                  onChange={handleSecondaryImagesChange}
                />
              </label>
              {secondaryImages.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-3 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  {secondaryImages.map((img, index) => (
                    <div key={img.id} className="relative group w-24 h-24">
                      <img
                        src={img.preview}
                        alt={`Imagem ${index + 1}`}
                        className="w-full h-full rounded-lg border border-gray-200 shadow-sm object-cover bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeSecondaryImage(img.id)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        title="Remover imagem"
                      >
                        ×
                      </button>
                      <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">
                        {index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Descrição */}
            <div className="md:col-span-2 mt-4">
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">Detalhes</h2>
            </div>
            
            <div className="md:col-span-2">
              <label className="form-control">
                <div className="label">
                  <span className="label-text font-medium">Descrição Completa</span>
                </div>
                <textarea
                  className="textarea textarea-bordered h-32 text-base leading-relaxed"
                  placeholder="Descreva os detalhes, características e benefícios do produto..."
                  value={product?.description}
                  onChange={(e) =>
                    setProduct({ ...product, description: e.target.value })
                  }
                ></textarea>
              </label>
            </div>
          </div>
          
          <div className="flex justify-end gap-x-4 pt-6 border-t mt-6">
            <button
               type="button"
               onClick={() => window.history.back()}
               className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={addProduct}
              type="button"
              disabled={isSubmitting}
              className="uppercase bg-blue-600 px-10 py-3 text-lg rounded-lg border border-transparent font-bold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Adicionando...
                </>
              ) : (
                "Adicionar Produto"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNewProduct;
