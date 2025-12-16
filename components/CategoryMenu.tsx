// *********************
// Role of the component: Category wrapper that will contain title and category items (Fashion Shows style)
// Name of the component: CategoryMenu.tsx
// Version: 2.2
// Component call: <CategoryMenu />
// Input parameters: no input parameters
// Output: Fashion Shows carousel section with dots navigation
// *********************

"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Slider from "react-slick";
import { fetchCategories, type CategoryItem } from "@/mocks/menuData";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const CategoryMenu = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 4000,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-white overflow-hidden category-menu-section">
        <div className="max-w-screen-2xl mx-auto px-4 mb-10 relative">
          <div className="flex flex-col items-center justify-center text-[#0a3928] mb-8">
            <h2 className="text-3xl md:text-7xl font-thin tracking-wide uppercase mb-4 text-center">
              Categorias
            </h2>
          </div>
          <div className="flex justify-center items-center h-[550px]">
            <div className="animate-pulse text-gray-400">Carregando...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white overflow-hidden category-menu-section">
      <div className="max-w-screen-2xl mx-auto px-4 mb-10 relative">
        {/* Header */}
        <div className="flex flex-col items-center justify-center text-[#0a3928] mb-8">
          <h2 className="text-3xl md:text-7xl font-thin tracking-wide uppercase mb-4 text-center">
            Categorias
          </h2>
        </div>

        {/* Slider Content */}
        <div className="px-2 md:px-12 pb-8">
          <Slider {...settings}>
            {categories.map((item) => (
              <div key={item.id} className="px-3 focus:outline-none py-2">
                <div className="relative h-[550px] w-full rounded-[32px] overflow-hidden group cursor-pointer">
                  {/* Background Image */}
                  <Image
                    src={item.image || "/categ.webp"}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority={item.id <= 3}
                  />

                  {/* Overlay gradient - darker at bottom for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 text-white z-10 p-6 text-center">
                    <h3 className="text-3xl md:text-4xl font-thin uppercase mb-3 leading-tight drop-shadow-md break-words max-w-full">
                      {item.title}
                    </h3>

                    <Link
                      href={item.href}
                      className="px-10 py-3 border border-white rounded-full uppercase text-xs tracking-[0.15em] hover:bg-white hover:text-black transition-all duration-300 font-medium"
                    >
                      Discover
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
};

export default CategoryMenu;
