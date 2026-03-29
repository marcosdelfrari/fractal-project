// *********************
// Role of the component: Carrossel da home com cards configuráveis (seção categoryMenu).
// Version: 3.0 — itens vêm só do JSON da seção (independentes do cadastro de categorias).
// *********************

"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import Slider from "react-slick";
import { motion } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import {
  getCategoryMenuFullConfig,
  normalizeCategoryMenuHref,
} from "@/lib/sectionContent";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const NextArrow = (props: any) => {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-[#0a3928] p-4 rounded-full border border-[#0a3928]/10 transition-all duration-300 -mr-4 md:-mr-6 hidden md:flex items-center justify-center group"
      aria-label="Next"
    >
      <FaChevronRight className="w-5 h-5 transition-transform group-hover:scale-110" />
    </button>
  );
};

const PrevArrow = (props: any) => {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-[#0a3928] p-4 rounded-full border border-[#0a3928]/10 transition-all duration-300 -ml-4 md:-ml-6 hidden md:flex items-center justify-center group"
      aria-label="Previous"
    >
      <FaChevronLeft className="w-5 h-5 transition-transform group-hover:scale-110" />
    </button>
  );
};

interface CategoryMenuProps {
  sectionContent?: unknown;
}

const CategoryMenu = ({ sectionContent }: CategoryMenuProps) => {
  const { title: sectionTitle, items: itemList } =
    getCategoryMenuFullConfig(sectionContent);

  const slides = useMemo(
    () =>
      itemList.filter(
        (it) => it.enabled && it.image?.trim() && it.label?.trim(),
      ),
    [itemList],
  );

  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    cssEase: "cubic-bezier(0.87, 0, 0.13, 1)",
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

  if (slides.length === 0) {
    return (
      <section className="py-16 bg-white overflow-hidden category-menu-section">
        <div className="max-w-screen-2xl mx-auto px-4 text-center text-gray-500 text-sm">
          <h2 className="text-2xl font-thin tracking-wide uppercase text-[#0a3928] mb-4">
            {sectionTitle}
          </h2>
          <p>
            Nenhum card ativo com imagem. Configure os itens em Admin →
            Configurações → Menu de categorias.
          </p>
        </div>
      </section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="py-16 bg-white overflow-hidden category-menu-section"
    >
      <div className="max-w-screen-2xl mx-auto px-4 mb-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col items-center justify-center text-[#0a3928] mb-8"
        >
          <h2 className="text-3xl md:text-7xl font-thin tracking-wide uppercase mb-4 text-center">
            {sectionTitle}
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="px-2 md:px-12 pb-8 relative"
        >
          <Slider {...settings}>
            {slides.map((item, index) => {
              const href = normalizeCategoryMenuHref(item.href);
              const external = /^https?:\/\//i.test(href);
              return (
                <div key={item.id} className="px-3 focus:outline-none py-2">
                  <motion.div
                    whileHover={{ y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="relative h-[550px] w-full rounded-[32px] overflow-hidden group cursor-pointer border border-black/5"
                  >
                    <Image
                      src={item.image.trim()}
                      alt={item.label}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity group-hover:opacity-90" />

                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 text-white z-10 p-6 text-center">
                      <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 * index }}
                        className="text-3xl md:text-4xl font-thin uppercase mb-3 leading-tight break-words max-w-full"
                      >
                        {item.label}
                      </motion.h3>

                      {external ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-10 py-3 border border-white rounded-full uppercase text-xs tracking-[0.15em] hover:bg-white hover:text-black transition-all duration-300 font-medium inline-block"
                        >
                          Descobrir
                        </a>
                      ) : (
                        <Link
                          href={href}
                          className="px-10 py-3 border border-white rounded-full uppercase text-xs tracking-[0.15em] hover:bg-white hover:text-black transition-all duration-300 font-medium inline-block"
                        >
                          Descobrir
                        </Link>
                      )}
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </Slider>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default CategoryMenu;
