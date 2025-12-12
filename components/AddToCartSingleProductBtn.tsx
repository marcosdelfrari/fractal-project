// *********************
// Role of the component: Button for adding product to the cart on the single product page
// Name of the component: AddToCartSingleProductBtn.tsx
// Version: 1.0
// Component call: <AddToCartSingleProductBtn product={product} quantityCount={quantityCount}  />
// Input parameters: SingleProductBtnProps interface
// Output: Button with adding to cart functionality
// *********************
"use client";

import React from "react";
import { useProductStore } from "@/app/_zustand/store";
import toast from "react-hot-toast";

const AddToCartSingleProductBtn = ({ product, quantityCount } : SingleProductBtnProps) => {
  const { addToCart, calculateTotals } = useProductStore();

  const handleAddToCart = () => {
    addToCart({
      id: product?.id.toString(),
      title: product?.title,
      price: product?.price,
      image: product?.mainImage,
      amount: quantityCount
    });
    calculateTotals();
    toast.success("Produto adicionado ao carrinho!");
  };
  return (
    <button
      onClick={handleAddToCart}
      className="w-full h-full bg-slate-600 text-white hover:bg-slate-700 font-medium text-base px-6 py-3 transition-colors uppercase tracking-wide"
    >
      Adicionar à sacola
    </button>
  );
};

export default AddToCartSingleProductBtn;
