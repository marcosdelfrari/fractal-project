"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  getFeaturedProductsFromContent,
  type FeaturedProductSlide,
} from "@/lib/sectionContent";

interface FeaturedProductSectionProps {
  /** JSON da seção `featuredProducts` (Admin / API); fallback: `data/home-section-defaults.json`. */
  sectionContent?: unknown;
}

const FeaturedProductSection = ({
  sectionContent,
}: FeaturedProductSectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const featuredProducts: FeaturedProductSlide[] =
    getFeaturedProductsFromContent(sectionContent);

  const currentProduct = featuredProducts[currentIndex];

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
        <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="w-full p-4 md:p-10"
    >
      <div className="flex max-md:flex-col min-h-[600px] w-full rounded-[40px] overflow-hidden">
        {/* Lado Esquerdo - Imagem Lifestyle com Dots */}
        <div className="relative w-1/2 max-md:w-full h-[600px] max-md:h-[400px] bg-gray-100 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentProduct.id + "-lifestyle"}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
              className="relative w-full h-full"
            >
              <Image
                src={currentProduct.lifestyleImage}
                alt={currentProduct.title}
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          </AnimatePresence>

          {/* Dots indicadores - posicionados um pouco antes do final da imagem */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-10 ">
            {featuredProducts.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
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
        <div className="w-1/2 max-md:w-full bg-[#f5f5f5] h-[600px] max-md:h-[400px] flex flex-col items-center justify-center px-12 py-16 max-md:px-6 max-md:py-12 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentProduct.id + "-info"}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col items-center w-full"
            >
              {/* Categoria */}
              <h2 className="text-4xl md:text-5xl font-thin text-[#1a4d3a] mb-8 text-center uppercase tracking-tighter">
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
              <h3 className="text-xl md:text-2xl text-gray-800 font-sans mb-8 text-center max-w-md">
                {currentProduct.title}
              </h3>

              {/* Botão Discover */}
              <button className="border-2 border-[#1a4d3a] text-[#1a4d3a] px-8 py-3 rounded-full hover:bg-[#1a4d3a] hover:text-white transition-all uppercase text-sm tracking-wider font-sans group">
                Discover
                <span className="inline-block transition-transform group-hover:translate-x-1 ml-2">→</span>
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default FeaturedProductSection;
