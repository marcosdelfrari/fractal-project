// *********************
// Role of the component: Cart icon and quantity that will be located in the header
// Name of the component: CartElement.tsx
// Version: 1.0
// Component call: <CartElement isHeaderWhite={boolean} />
// Input parameters: isHeaderWhite - boolean indicating if header has white background
// Output: Cart icon and quantity
// *********************

"use client";
import Link from "next/link";
import React from "react";
import { FaCartShopping } from "react-icons/fa6";
import { useProductStore } from "@/app/_zustand/store";

interface CartElementProps {
  isHeaderWhite?: boolean;
  /** Botão amarelo circular (#FFFD04) com ícone preto — navbar retrô */
  variant?: "default" | "retro";
}

const CartElement = ({
  isHeaderWhite = false,
  variant = "default",
}: CartElementProps) => {
  const { allQuantity } = useProductStore();
  const iconColor = isHeaderWhite ? "text-black" : "text-white";

  if (variant === "retro") {
    return (
      <div className="relative shrink-0">
        <Link
          href="/carrinho"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-[#FFFD04] text-black transition hover:brightness-95 sm:h-8 sm:w-8"
          aria-label="Carrinho"
        >
          <FaCartShopping className="text-base" />
          {allQuantity > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full border border-black bg-[#861201] px-0.5 text-[10px] font-bold text-[#FFFD04]">
              {allQuantity > 99 ? "99+" : allQuantity}
            </span>
          )}
        </Link>
      </div>
    );
  }

  return (
    <div className="relative ">
      <Link href="/carrinho">
        <FaCartShopping className={`text-sm ${iconColor}`} />
        <span className="hidden md:flex w-4 h-4 bg-blue-600 text-white text-xs rounded-full flex justify-center items-center absolute top-[-13px] right-[-13px]">
          {allQuantity}
        </span>
      </Link>
    </div>
  );
};

export default CartElement;
