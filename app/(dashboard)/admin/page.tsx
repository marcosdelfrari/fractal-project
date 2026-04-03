import { DashboardSidebar, StatsElement } from "@/components";
import prisma from "@/utils/db";
import React from "react";
import {
  FaArrowDown,
  FaArrowUp,
  FaUsers,
  FaBagShopping,
  FaChartPie,
  FaChartLine,
  FaClockRotateLeft,
} from "react-icons/fa6";

const toPercentageChange = (currentValue: number, previousValue: number) => {
  if (previousValue === 0) {
    if (currentValue === 0) return "0.0%";
    return "100.0%";
  }

  const percentage = ((currentValue - previousValue) / previousValue) * 100;
  return `${percentage.toFixed(1)}%`;
};

const formatCurrencyBRL = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(value);
};

const formatIntegerBR = (value: number) =>
  new Intl.NumberFormat("pt-BR").format(value);

const getMonthRange = (referenceDate: Date) => {
  const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const end = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 1);
  return { start, end };
};

const AdminDashboardPage = async () => {
  const now = new Date();
  const currentMonthRange = getMonthRange(now);
  const previousMonthRange = getMonthRange(
    new Date(now.getFullYear(), now.getMonth() - 1, 1),
  );

  const [
    totalOrders,
    totalUsers,
    totalRevenueAggregate,
    pendingOrders,
    currentMonthOrders,
    previousMonthOrders,
    currentMonthUsers,
    previousMonthUsers,
    currentMonthRevenueAggregate,
    previousMonthRevenueAggregate,
  ] = await Promise.all([
    prisma.customer_order.count(),
    prisma.user.count(),
    prisma.customer_order.aggregate({
      _sum: { total: true },
    }),
    prisma.customer_order.count({
      where: {
        status: {
          in: ["pending", "pendente", "processing", "processando"],
        },
      },
    }),
    prisma.customer_order.count({
      where: {
        dateTime: {
          gte: currentMonthRange.start,
          lt: currentMonthRange.end,
        },
      },
    }),
    prisma.customer_order.count({
      where: {
        dateTime: {
          gte: previousMonthRange.start,
          lt: previousMonthRange.end,
        },
      },
    }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: currentMonthRange.start,
          lt: currentMonthRange.end,
        },
      },
    }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: previousMonthRange.start,
          lt: previousMonthRange.end,
        },
      },
    }),
    prisma.customer_order.aggregate({
      where: {
        dateTime: {
          gte: currentMonthRange.start,
          lt: currentMonthRange.end,
        },
      },
      _sum: { total: true },
    }),
    prisma.customer_order.aggregate({
      where: {
        dateTime: {
          gte: previousMonthRange.start,
          lt: previousMonthRange.end,
        },
      },
      _sum: { total: true },
    }),
  ]);

  const totalRevenue = totalRevenueAggregate._sum.total ?? 0;
  const currentMonthRevenue = currentMonthRevenueAggregate._sum.total ?? 0;
  const previousMonthRevenue = previousMonthRevenueAggregate._sum.total ?? 0;

  const ordersChange = toPercentageChange(currentMonthOrders, previousMonthOrders);
  const usersChange = toPercentageChange(currentMonthUsers, previousMonthUsers);
  const revenueChange = toPercentageChange(currentMonthRevenue, previousMonthRevenue);
  const averageTicket =
    totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const pendingShare =
    totalOrders > 0 ? ((pendingOrders / totalOrders) * 100).toFixed(1) : "0.0";

  return (
    <div className="bg-[#E3E1D6] min-h-screen flex justify-start max-w-screen-2xl mx-auto max-lg:flex-col">
      <DashboardSidebar />
      <div className="flex-1 p-10 max-md:p-4 animate-fade-in-up">
        {/* Header Section */}
        <div className="flex items-center gap-3 border-b border-gray-100 pb-6 mb-10">
          <div className="p-3 bg-[#E3E1D6] rounded-full text-gray-900">
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
            value={formatIntegerBR(totalOrders)} 
            change={ordersChange}
            period="Mês atual vs mês anterior"
            icon={<FaBagShopping size={16} />} 
          />
          <StatsElement 
            title="Total de Usuários" 
            value={formatIntegerBR(totalUsers)} 
            change={usersChange}
            period="Cadastros no mês vs mês anterior"
            icon={<FaUsers size={16} />} 
          />
          <StatsElement 
            title="Faturamento" 
            value={formatCurrencyBRL(totalRevenue)} 
            change={revenueChange}
            period="Receita no mês vs mês anterior"
            icon={<FaChartLine size={16} />} 
          />
        </div>

        {/* Large Card Section */}
        <div className="w-full bg-white border border-gray-100 rounded-[2.5rem] p-12 flex flex-col justify-center items-center text-center">
          <div className="mb-6 p-6 bg-[#E3E1D6] rounded-full text-gray-900">
            <FaClockRotateLeft size={32} />
          </div>
          <h2 className="text-sm font-light tracking-widest text-gray-500 uppercase mb-2">
            Pedidos Pendentes
          </h2>
          <p className="text-6xl font-bold text-gray-900 mb-4 tracking-tighter">
            {formatIntegerBR(pendingOrders)}
          </p>
          <div
            className={`font-medium flex gap-x-1.5 items-center px-4 py-1.5 rounded-full text-sm ${
              pendingOrders > 0 ? "text-amber-600 bg-amber-50" : "text-green-600 bg-green-50"
            }`}
          >
            {pendingOrders > 0 ? (
              <FaArrowUp className="text-xs" />
            ) : (
              <FaArrowDown className="text-xs" />
            )}
            <span>{pendingShare}% dos pedidos estão pendentes</span>
          </div>
          <p className="mt-8 text-xs text-gray-400 font-light max-w-sm">
            Ticket médio geral: {formatCurrencyBRL(averageTicket)}. Dados consultados diretamente do banco em tempo real.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
