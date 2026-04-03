"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

interface ProductPageMotionProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}

const ProductPageMotion = ({
  children,
  delay = 0,
  y = 20,
  className,
}: ProductPageMotionProps) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: y * 0.5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.21, 0.45, 0.32, 0.9], 
        delay 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ProductPageMotion;
