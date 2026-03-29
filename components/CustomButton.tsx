// *********************
// Role of the component: Custom button component
// Name of the component: CustomButton.tsx
// Version: 1.0
// Component call: <CustomButton paddingX={paddingX} paddingY={paddingY} text={text} buttonType={buttonType} customWidth={customWidth} textSize={textSize} />
// Input parameters: CustomButtonProps interface
// Output: custom button component
// *********************

import React from "react";

interface CustomButtonProps {
  paddingX: number;
  paddingY: number;
  text: string;
  buttonType: "submit" | "reset" | "button";
  customWidth: string;
  textSize: string;
  disabled?: boolean;
}

const CustomButton = ({
  paddingX,
  paddingY,
  text,
  buttonType,
  customWidth,
  textSize,
  disabled = false,
}: CustomButtonProps) => {
  return (
    <button
      type={`${buttonType}`}
      disabled={disabled}
      className={`${
        customWidth !== "no" && `w-${customWidth}`
      } uppercase bg-black px-6 py-3 text-${textSize} font-medium tracking-widest text-white border border-black hover:bg-zinc-800 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-full`}
    >
      {text}
    </button>
  );
};

export default CustomButton;
