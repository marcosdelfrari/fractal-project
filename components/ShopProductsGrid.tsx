"use client";

import { motion, useReducedMotion } from "framer-motion";
import ProductItem from "./ProductItem";

const GRID_CLASS =
  "grid grid-cols-4 justify-items-center gap-x-2 gap-y-5 max-[1300px]:grid-cols-4 max-lg:grid-cols-3 max-[500px]:grid-cols-2";

type ShopProductsGridProps = {
  products: Product[];
};

const ShopProductsGrid = ({ products }: ShopProductsGridProps) => {
  const shouldReduceMotion = useReducedMotion();

  if (products.length === 0) {
    if (shouldReduceMotion) {
      return (
        <h3 className="text-3xl mt-5 text-center w-full col-span-full max-[1000px]:text-2xl max-[500px]:text-lg">
          Nenhum produto encontrado para esta busca
        </h3>
      );
    }
    return (
      <motion.h3
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.35,
          ease: [0.21, 0.45, 0.32, 0.9] as const,
        }}
        className="text-3xl mt-5 text-center w-full col-span-full max-[1000px]:text-2xl max-[500px]:text-lg"
      >
        Nenhum produto encontrado para esta busca
      </motion.h3>
    );
  }

  if (shouldReduceMotion) {
    return (
      <div className={GRID_CLASS}>
        {products.map((product) => (
          <ProductItem key={product.id} product={product} color="black" />
        ))}
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.04,
      },
    },
  };

  const ease = [0.21, 0.45, 0.32, 0.9] as const;

  const item = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease },
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={GRID_CLASS}
    >
      {products.map((product) => (
        <motion.div key={product.id} variants={item} className="w-full">
          <ProductItem product={product} color="black" />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ShopProductsGrid;
