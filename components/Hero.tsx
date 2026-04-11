"use client";
import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getHeroConfig } from "@/lib/sectionContent";
import { publicAssetUrl } from "@/lib/imageUtils";

interface HeroProps {
  /** JSON da seção `hero` (Admin / API); fallback: `data/home-section-defaults.json`. */
  sectionContent?: unknown;
}

const Hero = ({ sectionContent }: HeroProps) => {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const {
    backgroundImage,
    titlePrefix,
    titleSuffix,
    ctaLabel,
    ctaHref,
  } = getHeroConfig(sectionContent);

  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        const scrolled = window.pageYOffset;
        const rate = scrolled * 0.5;
        parallaxRef.current.style.transform = `translateY(${rate}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const href = (ctaHref || "/").trim() || "/";
  const isExternal = /^https?:\/\//i.test(href);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <motion.div
        ref={parallaxRef}
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${publicAssetUrl(backgroundImage)}')`,
          willChange: "transform",
        }}
      />

      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 flex flex-col  mt-[-74px] items-center justify-center h-full text-center pt-20">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-6xl md:text-8xl text-white font-thin mb-4 tracking-wide relative z-20"
        >
          {titlePrefix ? (
            <span className="hidden xl:inline">{titlePrefix} </span>
          ) : null}
          {titleSuffix}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          {isExternal ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border border-white text-white px-10 py-3 rounded-full hover:bg-white hover:text-black transition-all uppercase text-sm tracking-widest z-20"
            >
              {ctaLabel}
            </a>
          ) : (
            <Link
              href={href}
              className="inline-block border border-white text-white px-10 py-3 rounded-full hover:bg-white hover:text-black transition-all uppercase text-sm tracking-widest z-20"
            >
              {ctaLabel}
            </Link>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
