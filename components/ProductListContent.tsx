"use client";

import React from "react";
import { motion } from "framer-motion";
import ProductItem from "./ProductItem";

interface ProductListContentProps {
  products: Product[];
}

const ProductListContent = ({ products }: ProductListContentProps) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      className="grid grid-cols-4 justify-items-center max-w-screen-2xl mx-auto gap-x-4 gap-y-12 px-4 max-xl:grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-2 max-sm:grid-cols-2"
    >
      {products.map((product) => (
        <motion.div key={product.id} variants={item} className="w-full">
          <ProductItem product={product} color="black" />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ProductListContent;
