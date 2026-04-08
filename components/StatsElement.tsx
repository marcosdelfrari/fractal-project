// *********************
// IN DEVELOPMENT
// *********************

import React from "react";
import { FaArrowUp, FaArrowDown, FaChartLine } from "react-icons/fa6";

const StatsElement = ({ 
  title = "Novos Produtos", 
  value = "2,230", 
  change = "12.5%", 
  period = "Desde o mês passado",
  icon = <FaChartLine size={16} /> 
}) => {
  const isNegativeChange = String(change).trim().startsWith("-");
  const trendClassName = isNegativeChange
    ? "text-red-500 bg-red-50"
    : "text-green-500 bg-green-50";
  const trendIcon = isNegativeChange ? <FaArrowDown size={10} /> : <FaArrowUp size={10} />;

  return (
    <div className="w-full bg-white border border-gray-100 flex flex-col p-4 rounded-2xl transition-colors hover:border-gray-200 sm:p-6 sm:rounded-3xl">
      <div className="mb-3 flex items-center justify-between sm:mb-4">
        <div className="rounded-full bg-zinc-100 p-2.5 text-zinc-800 sm:bg-[#E3E1D6] sm:p-3">
          {icon}
        </div>
        <div
          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium sm:px-3 sm:py-1 sm:text-xs ${trendClassName}`}
        >
          {trendIcon}
          {change}
        </div>
      </div>

      <div className="space-y-0.5 sm:space-y-1">
        <h4 className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 sm:text-xs sm:font-light sm:tracking-widest">
          {title}
        </h4>
        <p className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl sm:font-bold">
          {value}
        </p>
        <p className="text-[10px] leading-snug text-zinc-400 sm:tracking-tighter">
          {period}
        </p>
      </div>
    </div>
  );
};

export default StatsElement;
