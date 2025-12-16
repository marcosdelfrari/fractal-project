"use client";
import { DashboardSidebar, StatsElement } from "@/components";
import React from "react";
import { FaArrowUp } from "react-icons/fa6";

const AdminDashboardPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen flex justify-start max-w-screen-2xl mx-auto max-xl:flex-col">
      <DashboardSidebar />
      <div className="flex-1 p-8 max-md:p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          <StatsElement />
          <StatsElement />
          <StatsElement />
        </div>

        <div className="w-full bg-white border border-gray-200 shadow-sm rounded-lg p-8 flex flex-col justify-center items-center gap-y-2">
          <h4 className="text-xl text-gray-500 font-medium">
            Number of visitors today
          </h4>
          <p className="text-4xl font-bold text-gray-900">1,200</p>
          <p className="text-green-500 font-medium flex gap-x-1 items-center bg-green-50 px-3 py-1 rounded-full text-sm">
            <FaArrowUp className="text-xs" />
            12.5% Since last month
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
