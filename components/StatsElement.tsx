// *********************
// IN DEVELOPMENT
// *********************

import React from "react";
import { FaArrowUp } from "react-icons/fa6";

const StatsElement = () => {
  return (
    <div className="w-full xl:w-80 h-32 bg-white border border-gray-200 shadow-sm flex flex-col justify-center items-center rounded-lg max-md:w-full hover:shadow-md transition-shadow">
      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">New Products</h4>
      <p className="text-3xl font-bold text-gray-900 mt-1">2,230</p>
      <p className="text-green-500 text-sm font-medium flex gap-x-1 items-center mt-2">
        <FaArrowUp />
        12.5% Since last month
      </p>
    </div>
  );
};

export default StatsElement;
