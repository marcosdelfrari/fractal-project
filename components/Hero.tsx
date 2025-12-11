"use client";
import React, { useEffect, useRef } from "react";

const Hero = () => {
  const parallaxRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background image with parallax effect */}
      <div
        ref={parallaxRef}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/hero.webp')",
          willChange: "transform",
        }}
      />

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center pt-20">
        {/* Main Title */}
        <h1 className="text-6xl md:text-8xl text-white font-thin mb-4 tracking-wide relative z-20">
          GIFTING
        </h1>

        {/* Button */}
        <button className="border border-white text-white px-10 py-3 rounded-full hover:bg-white hover:text-black transition-all uppercase text-sm tracking-widest z-20">
          Discover
        </button>
      </div>
    </div>
  );
};

export default Hero;
