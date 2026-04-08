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
  const start = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    1,
  );
  const end = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth() + 1,
    1,
  );
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

  const ordersChange = toPercentageChange(
    currentMonthOrders,
    previousMonthOrders,
  );
  const usersChange = toPercentageChange(currentMonthUsers, previousMonthUsers);
  const revenueChange = toPercentageChange(
    currentMonthRevenue,
    previousMonthRevenue,
  );
  const averageTicket =
    totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const pendingShare =
    totalOrders > 0 ? ((pendingOrders / totalOrders) * 100).toFixed(1) : "0.0";

  return (
    <div className="bg-white min-h-screen flex justify-start max-w-screen-2xl mx-auto max-lg:flex-col">
      <DashboardSidebar />
      <div className="flex-1 animate-fade-in-up px-4 pt-6 pb-admin-mobile-nav sm:px-6 lg:p-10 lg:pb-10">
        <div className="mb-6 flex items-center gap-2 border-b border-zinc-100 pb-4 sm:mb-8 sm:gap-3 sm:pb-6 lg:mb-10">
          <div className="rounded-full bg-zinc-100 p-2 text-zinc-800 sm:bg-[#E3E1D6] sm:p-3">
            <FaChartPie size={16} />
          </div>
          <h1 className="text-base font-medium tracking-wide text-zinc-900 sm:text-lg sm:font-light sm:tracking-widest sm:uppercase">
            Visão geral
          </h1>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 xl:gap-8 lg:mb-10">
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

        <div className="flex w-full flex-col items-center rounded-2xl border border-zinc-100 bg-zinc-50/50 px-5 py-8 text-center sm:rounded-3xl sm:bg-white sm:p-10 sm:py-12 lg:rounded-[2.5rem] lg:p-12">
          <div className="mb-4 rounded-full bg-zinc-100 p-4 text-zinc-800 sm:mb-6 sm:bg-[#E3E1D6] sm:p-6">
            <FaClockRotateLeft className="h-7 w-7 sm:h-8 sm:w-8" />
          </div>
          <h2 className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500 sm:mb-2 sm:text-sm sm:font-light sm:tracking-widest">
            Pedidos pendentes
          </h2>
          <p className="mb-3 text-4xl font-semibold tracking-tight text-zinc-900 sm:mb-4 sm:text-6xl sm:font-bold">
            {formatIntegerBR(pendingOrders)}
          </p>
          <div
            className={`flex items-center gap-x-1.5 rounded-full px-3 py-1 text-xs font-medium sm:text-sm ${
              pendingOrders > 0
                ? "bg-amber-50 text-amber-700"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {pendingOrders > 0 ? (
              <FaArrowUp className="text-[10px]" />
            ) : (
              <FaArrowDown className="text-[10px]" />
            )}
            <span>{pendingShare}% do total em aberto</span>
          </div>
          <p className="mt-5 max-w-sm text-xs leading-relaxed text-zinc-500 sm:mt-8">
            Ticket médio: {formatCurrencyBRL(averageTicket)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
