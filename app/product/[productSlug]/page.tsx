import {
  StockAvailabillity,
  SingleProductRating,
  SingleProductDynamicFields,
  AddToWishlistBtn,
  ProductTabs,
} from "@/components";
import apiClient from "@/lib/api";
import Image from "next/image";
import { notFound } from "next/navigation";
import React from "react";
import { FaSquareFacebook, FaSquareXTwitter, FaSquarePinterest } from "react-icons/fa6";
import { sanitize } from "@/lib/sanitize";
import Link from "next/link";

interface ImageItem {
  imageID: string;
  productID: string;
  image: string;
}

interface SingleProductPageProps {
  params: Promise<{ productSlug: string; id: string }>;
}

const SingleProductPage = async ({ params }: SingleProductPageProps) => {
  const paramsAwaited = await params;
  let product: any = null;
  let images: ImageItem[] = [];

  try {
    const data = await apiClient.get(
      `/api/slugs/${paramsAwaited?.productSlug}`
    );

    if (!data.ok) {
      console.error(`API Error: ${data.status} ${data.statusText}`);
      notFound();
    }

    product = await data.json();

    if (!product || product.error) {
      notFound();
    }

    try {
      const imagesData = await apiClient.get(
        `/api/images/${paramsAwaited?.id || product?.id}`
      );

      if (imagesData.ok) {
        images = await imagesData.json();
        if (!Array.isArray(images)) {
          images = [];
        }
      }
    } catch (imageError) {
      console.error("Error fetching images:", imageError);
      images = [];
    }
  } catch (error) {
    console.error("Error fetching product:", error);
    notFound();
  }

  // Calculate installments (mock logic)
  const installmentPrice = (product?.price / 7).toFixed(2).replace(".", ",");
  const formattedPrice = product?.price?.toFixed(2).replace(".", ",");

  return (
    <div className="bg-white text-gray-800">
      <div className="max-w-screen-2xl mx-auto px-5 py-10">
        {/* Breadcrumbs */}
        <div className="text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-black transition-colors">Início</Link>
          <span className="mx-2">/</span>
          <span className="capitalize">{product?.category?.name || "Categoria"}</span>
          <span className="mx-2">/</span>
          <span className="text-black">{sanitize(product?.title)}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Gallery */}
          <div className="lg:col-span-7 flex gap-4 h-fit sticky top-4">
             {/* Thumbnails (Vertical) */}
            <div className="flex flex-col gap-4 w-24 max-h-[600px] overflow-y-auto hidden md:flex">
              {product?.mainImage && (
                <div className="border border-gray-200 cursor-pointer hover:border-black transition-colors">
                  <Image
                    src={`/${product?.mainImage}`}
                    width={100}
                    height={120}
                    alt="thumbnail"
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
              {images?.map((imageItem: ImageItem, key: number) => (
                <div key={imageItem.imageID + key} className="border border-gray-200 cursor-pointer hover:border-black transition-colors">
                  <Image
                    src={`/${imageItem.image}`}
                    width={100}
                    height={120}
                    alt="thumbnail"
                    className="w-full h-auto object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Main Image */}
            <div className="flex-1 bg-gray-50 relative aspect-[4/5] w-full">
               <Image
                src={
                  product?.mainImage
                    ? `/${product?.mainImage}`
                    : "/product_placeholder.jpg"
                }
                fill
                alt="main image"
                className="object-cover w-full h-full"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
               <div className="absolute top-4 right-4">
                  <AddToWishlistBtn
                    product={product}
                    slug={paramsAwaited.productSlug}
                  />
               </div>
            </div>
          </div>

          {/* Right Column: Product Details */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Title & Reviews */}
            <div>
                <h1 className="text-2xl lg:text-3xl font-normal mb-2">{sanitize(product?.title)}</h1>
                <div className="flex items-center gap-2 mb-4">
                    <SingleProductRating rating={product?.rating} />
                    <a href="#reviews" className="text-sm text-orange-400 hover:underline">
                        Clique e veja os comentários!
                    </a>
                </div>
            </div>

            {/* Description Preview */}
            <div className="text-gray-600 text-sm leading-relaxed">
                <p>
                    {product?.description?.substring(0, 150)}... 
                    <a href="#description" className="underline text-black ml-1">Ler mais</a>
                </p>
            </div>

            {/* Price */}
            <div>
                <p className="text-3xl font-bold text-gray-900">R$ {formattedPrice}</p>
                <p className="text-gray-500 text-sm">ou 7x de R$ {installmentPrice}</p>
            </div>

            {/* Table of Measures Link */}
            {product?.measureTable && (
            <div>
                 <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20"></path><path d="M2 12v3a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-3"></path><path d="M22 16h-2"></path><path d="M4 16H2"></path><path d="M18 16h-2"></path><path d="M8 16H6"></path><path d="M14 16h-2"></path></svg>
                    Tabela de medidas
                 </button>
            </div>
            )}

            {/* Dynamic Fields (Colors, Sizes, Add to Cart) */}
            <SingleProductDynamicFields product={product} />

            {/* Shipping Calculator */}
            <div className="border-t border-b border-gray-100 py-6 my-2">
                <label className="text-sm font-medium mb-2 block">Calcule o frete</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Digite seu CEP" 
                        className="border border-gray-300 px-4 py-2 text-sm w-full max-w-[200px] focus:outline-none focus:border-black"
                    />
                    <button className="bg-black text-white px-6 py-2 text-sm font-medium hover:bg-gray-800 transition-colors">
                        Consultar
                    </button>
                </div>
                <div className="mt-4 flex items-center gap-2 bg-gray-50 p-3 text-sm text-gray-600">
                    <span className="text-xl">🚚</span>
                    Frete grátis todo Brasil acima de R$329
                </div>
            </div>

             {/* Bulk Buy / Wholesale */}
             <div className="text-center">
                 <Link href="#" className="text-sm font-bold text-gray-600 hover:text-black border-b border-gray-600 hover:border-black pb-0.5">
                     + 12 Peças? <span className="font-normal underline">Compre aqui</span>
                 </Link>
             </div>

            {/* Share */}
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-2">
              <span>Compartilhe:</span>
              <div className="flex items-center gap-3 text-lg">
                <button className="hover:text-black"><FaSquareFacebook /></button>
                <button className="hover:text-black"><FaSquareXTwitter /></button>
                <button className="hover:text-black"><FaSquarePinterest /></button>
              </div>
            </div>

          </div>
        </div>

        {/* Detailed Tabs (Description, Reviews) */}
        <div id="description" className="mt-20 border-t border-gray-200 pt-10">
          <ProductTabs product={product} />
        </div>
      </div>
    </div>
  );
};

export default SingleProductPage;
