// *********************
// Role of the component: Buy Now button that adds product to the cart and redirects to the checkout page
// Name of the component: BuyNowSingleProductBtn.tsx
// Version: 1.0
// Component call: <BuyNowSingleProductBtn product={product} quantityCount={quantityCount} />
// Input parameters: SingleProductBtnProps interface
// Output: Button with buy now functionality
// *********************

"use client";
import { useProductStore } from "@/app/_zustand/store";
import React from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const BuyNowSingleProductBtn = ({
  product,
  quantityCount,
  selectedColor,
  selectedSize,
}: SingleProductBtnProps) => {
  const router = useRouter();
  const { addToCart, calculateTotals } = useProductStore();

  const handleAddToCart = () => {
    const cartItemKey = `${product?.id.toString()}__${selectedColor || ""}__${selectedSize || ""}`;
    addToCart({
      cartItemKey,
      id: product?.id.toString(),
      title: product?.title,
      price: product?.price,
      image: product?.mainImage,
      amount: quantityCount,
      selectedColor,
      selectedSize,
    });
    calculateTotals();
    toast.success("Produto adicionado ao carrinho!");
    router.push("/compra");
  };
  return (
    <button
      onClick={handleAddToCart}
      className="w-full bg-black text-white hover:bg-gray-800 font-medium text-sm lg:text-base px-6 py-4 transition-all uppercase tracking-widest rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5"
    >
      Comprar Agora
    </button>
  );
};

export default BuyNowSingleProductBtn;
