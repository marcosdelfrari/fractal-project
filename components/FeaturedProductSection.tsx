"use client";
import React, { useState } from "react";
import Image from "next/image";

interface FeaturedProduct {
  id: number;
  lifestyleImage: string;
  productImage: string;
  title: string;
  category: string;
}

const FeaturedProductSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Dados de exemplo - você pode substituir por dados reais da API
  const featuredProducts: FeaturedProduct[] = [
    {
      id: 1,
      lifestyleImage: "/bertp.webp",
      productImage: "/bag.webp",
      title: "Laurel Knit Shopper Bag",
      category: "TENNIS CLUB",
    },
    {
      id: 2,
      lifestyleImage: "/bertp.webp",
      productImage: "/racket.webp",
      title: "Classic Tennis Racket",
      category: "TENNIS CLUB",
    },
    {
      id: 3,
      lifestyleImage: "/bertp.webp",
      productImage: "/shoes.webp",
      title: "Premium Tennis Shoes",
      category: "TENNIS CLUB",
    },
  ];

  const currentProduct = featuredProducts[currentIndex];

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="w-full flex min-h-[600px] max-md:flex-col p-10">
      {/* Lado Esquerdo - Imagem Lifestyle com Dots */}
      <div className="relative w-1/2 max-md:w-full h-[600px] max-md:h-[400px] overflow-hidden rounded-t-3xl md:rounded-t-none md:rounded-l-3xl">
        <div className="relative w-full h-full">
          <Image
            src={currentProduct.lifestyleImage}
            alt={currentProduct.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Dots indicadores - posicionados um pouco antes do final da imagem */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-10 ">
          {featuredProducts.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Ir para produto ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Lado Direito - Informações do Produto */}
      <div className="w-1/2 max-md:w-full bg-[#f5f5f5] h-[600px] max-md:h-[400px] flex flex-col items-center justify-center px-12 py-16 max-md:px-6 max-md:py-12 rounded-b-3xl md:rounded-b-none md:rounded-r-3xl">
        {/* Categoria */}
        <h2 className="text-4xl md:text-5xl font-thin text-[#1a4d3a] mb-8 text-center">
          {currentProduct.category}
        </h2>

        {/* Imagem do Produto */}
        <div className="hidden md:block relative w-64 h-64 mb-8 max-md:w-48 max-md:h-48">
          <Image
            src={currentProduct.productImage}
            alt={currentProduct.title}
            fill
            className="object-contain"
          />
        </div>

        {/* Título do Produto */}
        <h3 className="text-xl md:text-2xl text-gray-800 font-sans mb-8 text-center">
          {currentProduct.title}
        </h3>

        {/* Botão Discover */}
        <button className="border-2 border-[#1a4d3a] text-[#1a4d3a] px-8 py-3 rounded-full hover:bg-[#1a4d3a] hover:text-white transition-all uppercase text-sm tracking-wider font-sans">
          Discover
        </button>
      </div>
    </div>
  );
};

export default FeaturedProductSection;
