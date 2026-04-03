"use client";
import { AdminOrders, DashboardSidebar } from "@/components";
import React from "react";

import { FaBagShopping } from "react-icons/fa6";

const DashboardOrdersPage = () => {
  return (
    <div className="bg-[#E3E1D6] flex min-h-screen max-w-screen-2xl mx-auto max-lg:flex-col animate-fade-in-up">
      <DashboardSidebar />
      <div className="flex-1 p-10 max-md:p-4">
        {/* Header Section */}
        <div className="flex items-center gap-3 border-b border-gray-100 pb-6 mb-10">
          <div className="p-3 bg-[#E3E1D6] rounded-full text-gray-900">
            <FaBagShopping size={16} />
          </div>
          <h1 className="text-lg font-light tracking-widest text-gray-900 uppercase">
            Gerenciar Pedidos
          </h1>
        </div>

        <AdminOrders />
      </div>
    </div>
  );
};

export default DashboardOrdersPage;
