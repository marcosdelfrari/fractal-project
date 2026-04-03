// *********************
// Role of the component: User statistics cards component
// Name of the component: UserStats.tsx
// Version: 1.0
// Component call: <UserStats stats={stats} />
// Input parameters: UserStatsProps interface
// Output: user statistics cards component
// *********************

import React from "react";
import {
  FaShoppingBag,
  FaHeart,
  FaMapMarkerAlt,
  FaStar,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
} from "react-icons/fa";

interface StatCard {
  id: string;
  title: string;
  value: number | string;
  icon: React.ReactNode;
  change?: {
    value: number;
    type: "increase" | "decrease" | "neutral";
    period: string;
  };
  color: "blue" | "green" | "purple" | "orange" | "red";
}

interface UserStatsProps {
  stats: StatCard[];
  className?: string;
}

const UserStats = ({ stats, className = "" }: UserStatsProps) => {
  const getColorClasses = (color: StatCard["color"]) => {
    const colorMap = {
      blue: {
        card: "bg-white border-gray-100",
        iconBg: "bg-[#E3E1D6] text-gray-900",
        title: "text-gray-600 font-light",
        value: "text-gray-900",
        change: "text-gray-500",
      },
      green: {
        card: "bg-white border-gray-100",
        iconBg: "bg-[#E3E1D6] text-gray-900",
        title: "text-gray-600 font-light",
        value: "text-gray-900",
        change: "text-gray-500",
      },
      purple: {
        card: "bg-white border-gray-100",
        iconBg: "bg-[#E3E1D6] text-gray-900",
        title: "text-gray-600 font-light",
        value: "text-gray-900",
        change: "text-gray-500",
      },
      orange: {
        card: "bg-white border-gray-100",
        iconBg: "bg-[#E3E1D6] text-gray-900",
        title: "text-gray-600 font-light",
        value: "text-gray-900",
        change: "text-gray-500",
      },
      red: {
        card: "bg-white border-gray-100",
        iconBg: "bg-[#E3E1D6] text-gray-900",
        title: "text-gray-600 font-light",
        value: "text-gray-900",
        change: "text-gray-500",
      },
    };
    return colorMap[color];
  };

  const getChangeIcon = (type: "increase" | "decrease" | "neutral") => {
    switch (type) {
      case "increase":
        return <FaArrowUp className="text-green-300" />;
      case "decrease":
        return <FaArrowDown className="text-red-300" />;
      case "neutral":
        return <FaMinus className="text-gray-300" />;
      default:
        return null;
    }
  };

  const getChangeColor = (type: "increase" | "decrease" | "neutral") => {
    switch (type) {
      case "increase":
        return "text-green-300";
      case "decrease":
        return "text-red-300";
      case "neutral":
        return "text-gray-300";
      default:
        return "text-gray-300";
    }
  };

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}
    >
      {stats.map((stat) => {
        const colors = getColorClasses(stat.color);

        return (
          <div
            key={stat.id}
            className={`${colors.card} rounded-2xl p-6 shadow-md border hover:shadow-lg transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-full ${colors.iconBg}`}>
                {stat.icon}
              </div>
              {stat.change && (
                <div
                  className={`${getChangeColor(
                    stat.change.type,
                  )} flex items-center gap-1 text-xs font-light`}
                >
                  {getChangeIcon(stat.change.type)}
                  <span>{stat.change.value}%</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <h3
                className={`${colors.title} text-sm uppercase tracking-wider`}
              >
                {stat.title}
              </h3>
              <p className={`${colors.value} text-2xl font-medium`}>
                {stat.value}
              </p>
              {stat.change && (
                <p className={`${colors.change} text-xs font-light`}>
                  {stat.change.type === "increase" && "Aumento"}
                  {stat.change.type === "decrease" && "Diminuição"}
                  {stat.change.type === "neutral" && "Sem alteração"}{" "}
                  {stat.change.period}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Componente de exemplo com dados mockados para demonstração
export const UserStatsExample = () => {
  const exampleStats: StatCard[] = [
    {
      id: "orders",
      title: "Pedidos Totais",
      value: 12,
      icon: <FaShoppingBag />,
      change: {
        value: 15.2,
        type: "increase",
        period: "este mês",
      },
      color: "blue",
    },
    {
      id: "wishlist",
      title: "Lista de Desejos",
      value: 8,
      icon: <FaHeart />,
      change: {
        value: 5.1,
        type: "increase",
        period: "esta semana",
      },
      color: "red",
    },
    {
      id: "addresses",
      title: "Endereços",
      value: 3,
      icon: <FaMapMarkerAlt />,
      change: {
        value: 0,
        type: "neutral",
        period: "este mês",
      },
      color: "green",
    },
    {
      id: "reviews",
      title: "Avaliações",
      value: 5,
      icon: <FaStar />,
      change: {
        value: 2.3,
        type: "increase",
        period: "este mês",
      },
      color: "purple",
    },
  ];

  return <UserStats stats={exampleStats} />;
};

export default UserStats;
