"use client";
import { DashboardSidebar, StatsElement } from "@/components";
import React from "react";
import { FaArrowUp, FaUsers, FaBagShopping, FaChartPie, FaChartLine } from "react-icons/fa6";

const AdminDashboardPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen flex justify-start max-w-screen-2xl mx-auto max-xl:flex-col">
      <DashboardSidebar />
      <div className="flex-1 p-10 max-md:p-4 animate-fade-in-up">
        {/* Header Section */}
        <div className="flex items-center gap-3 border-b border-gray-100 pb-6 mb-10">
          <div className="p-3 bg-gray-50 rounded-full text-gray-900">
            <FaChartPie size={16} />
          </div>
          <h1 className="text-lg font-light tracking-widest text-gray-900 uppercase">
            Visão Geral do Painel
          </h1>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-10">
          <StatsElement 
            title="Total de Pedidos" 
            value="156" 
            change="14.2%" 
            icon={<FaBagShopping size={16} />} 
          />
          <StatsElement 
            title="Novos Usuários" 
            value="42" 
            change="8.5%" 
            icon={<FaUsers size={16} />} 
          />
          <StatsElement 
            title="Faturamento" 
            value="R$ 12.450" 
            change="23.1%" 
            icon={<FaChartLine size={16} />} 
          />
        </div>

        {/* Large Card Section */}
        <div className="w-full bg-white border border-gray-100 rounded-[2.5rem] p-12 flex flex-col justify-center items-center text-center">
          <div className="mb-6 p-6 bg-gray-50 rounded-full text-gray-900">
            <FaUsers size={32} />
          </div>
          <h2 className="text-sm font-light tracking-widest text-gray-500 uppercase mb-2">
            Visitantes Hoje
          </h2>
          <p className="text-6xl font-bold text-gray-900 mb-4 tracking-tighter">1,200</p>
          <div className="text-green-500 font-medium flex gap-x-1.5 items-center bg-green-50 px-4 py-1.5 rounded-full text-sm">
            <FaArrowUp className="text-xs" />
            <span>12.5% em relação ao mês passado</span>
          </div>
          <p className="mt-8 text-xs text-gray-400 font-light max-w-sm">
            Os dados de visitantes são atualizados em tempo real através do sistema de monitoramento integrado.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
