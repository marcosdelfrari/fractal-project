// *********************
// IN DEVELOPMENT
// *********************

import React from "react";
import { FaArrowUp, FaChartLine } from "react-icons/fa6";

const StatsElement = ({ 
  title = "Novos Produtos", 
  value = "2,230", 
  change = "12.5%", 
  period = "Desde o mês passado",
  icon = <FaChartLine size={16} /> 
}) => {
  return (
    <div className="w-full bg-white border border-gray-100 flex flex-col p-6 rounded-3xl transition-all duration-300 hover:border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-gray-50 rounded-full text-gray-900">
          {icon}
        </div>
        <div className="text-green-500 bg-green-50 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          <FaArrowUp size={10} />
          {change}
        </div>
      </div>
      
      <div className="space-y-1">
        <h4 className="text-xs font-light tracking-widest text-gray-500 uppercase">
          {title}
        </h4>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-[10px] text-gray-400 font-light uppercase tracking-tighter italic">
          {period}
        </p>
      </div>
    </div>
  );
};

export default StatsElement;
