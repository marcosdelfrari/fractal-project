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
        bg: "bg-zinc-900",
        text: "text-white",
        change: "text-blue-200",
        icon: "text-blue-200",
      },
      green: {
        bg: "bg-green-500",
        text: "text-white",
        change: "text-green-200",
        icon: "text-green-200",
      },
      purple: {
        bg: "bg-purple-500",
        text: "text-white",
        change: "text-purple-200",
        icon: "text-purple-200",
      },
      orange: {
        bg: "bg-orange-500",
        text: "text-white",
        change: "text-orange-200",
        icon: "text-orange-200",
      },
      red: {
        bg: "bg-red-500",
        text: "text-white",
        change: "text-red-200",
        icon: "text-red-200",
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
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}
    >
      {stats.map((stat) => {
        const colors = getColorClasses(stat.color);

        return (
          <div
            key={stat.id}
            className={`${colors.bg} ${colors.text} rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${colors.icon} text-2xl`}>{stat.icon}</div>
              {stat.change && (
                <div
                  className={`${getChangeColor(
                    stat.change.type
                  )} flex items-center gap-1 text-sm`}
                >
                  {getChangeIcon(stat.change.type)}
                  <span>{stat.change.value}%</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <h3 className={`${colors.text} text-lg font-medium`}>
                {stat.title}
              </h3>
              <p className={`${colors.text} text-3xl font-bold`}>
                {stat.value}
              </p>
              {stat.change && (
                <p className={`${colors.change} text-sm`}>
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
