// *********************
// Role of the component: Quantity input for incrementing and decrementing product quantity on the single product page
// Name of the component: QuantityInput.tsx
// Version: 1.0
// Component call: <QuantityInput quantityCount={quantityCount} setQuantityCount={setQuantityCount} />
// Input parameters: QuantityInputProps interface
// Output: one number input and two buttons
// *********************

"use client";

import React from "react";
import { FaPlus } from "react-icons/fa6";
import { FaMinus } from "react-icons/fa6";

interface QuantityInputProps {
  quantityCount: number;
  setQuantityCount: React.Dispatch<React.SetStateAction<number>>;
}

const QuantityInput = ({quantityCount, setQuantityCount} : QuantityInputProps) => {

  const handleQuantityChange = (actionName: string): void => {
    if (actionName === "plus") {
      setQuantityCount(quantityCount + 1);
    } else if (actionName === "minus" && quantityCount !== 1) {
      setQuantityCount(quantityCount - 1);
    }
  };

  return (
    <div className="flex items-center h-full">
      <button
        type="button"
        className="w-10 h-full text-gray-600 hover:text-black flex justify-center items-center"
        onClick={() => handleQuantityChange("minus")}
      >
        <FaMinus size={10} />
      </button>

      <input
        type="number"
        id="Quantity"
        disabled={true}
        value={quantityCount}
        className="h-full w-10 text-center bg-transparent border-none focus:ring-0 p-0 text-sm font-medium appearance-none"
      />

      <button
        type="button"
        className="w-10 h-full text-gray-600 hover:text-black flex justify-center items-center"
        onClick={() => handleQuantityChange("plus")}
      >
        <FaPlus size={10} />
      </button>
    </div>
  );
};

export default QuantityInput;
