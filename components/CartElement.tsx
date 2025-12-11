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
}

const CartElement = ({ isHeaderWhite = false }: CartElementProps) => {
  const { allQuantity } = useProductStore();
  const iconColor = isHeaderWhite ? "text-black" : "text-white";

  return (
    <div className="relative ">
      <Link href="/cart">
        <FaCartShopping className={`text-sm ${iconColor}`} />
        <span className="hidden md:flex w-4 h-4 bg-blue-600 text-white text-xs rounded-full flex justify-center items-center absolute top-[-13px] right-[-13px]">
          {allQuantity}
        </span>
      </Link>
    </div>
  );
};

export default CartElement;
