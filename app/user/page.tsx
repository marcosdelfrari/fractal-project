import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { apiClient } from "@/lib/api";
import UserStats, { UserStatsExample } from "@/components/UserStats";
import {
  FaShoppingBag,
  FaHeart,
  FaMapMarkerAlt,
  FaStar,
  FaDollarSign,
} from "react-icons/fa";
import Link from "next/link";

interface UserStatsData {
  addresses: {
    total: number;
    default: number;
  };
  reviews: {
    total: number;
    average: {
      _avg: {
        rating: number;
      };
    };
  };
  wishlist: {
    total: number;
  };
  orders: {
    total: number;
    totalSpent: number;
  };
}

async function getUserStats(userId: string): Promise<UserStatsData | null> {
  try {
    const response = await apiClient.get(`/api/users/${userId}/stats`);

    if (!response.ok) {
      throw new Error("Failed to fetch user stats");
    }

    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return null;
  }
}

export default async function UserDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Erro de Autenticação
          </h1>
          <p className="text-gray-600">
            Não foi possível carregar os dados do usuário.
          </p>
        </div>
      </div>
    );
  }

  const userStats = await getUserStats(session.user.id);

  // Dados mockados para demonstração caso a API falhe
  const mockStats = [
    {
      id: "orders",
      title: "Pedidos Totais",
      value: userStats?.orders.total || 0,
      icon: <FaShoppingBag />,
      change: {
        value: 15.2,
        type: "increase" as const,
        period: "este mês",
      },
      color: "blue" as const,
    },
    {
      id: "wishlist",
      title: "Lista de Desejos",
      value: userStats?.wishlist.total || 0,
      icon: <FaHeart />,
      change: {
        value: 5.1,
        type: "increase" as const,
        period: "esta semana",
      },
      color: "red" as const,
    },
    {
      id: "addresses",
      title: "Endereços",
      value: userStats?.addresses.total || 0,
      icon: <FaMapMarkerAlt />,
      change: {
        value: 0,
        type: "neutral" as const,
        period: "este mês",
      },
      color: "green" as const,
    },
    {
      id: "reviews",
      title: "Avaliações",
      value: userStats?.reviews.total || 0,
      icon: <FaStar />,
      change: {
        value: 2.3,
        type: "increase" as const,
        period: "este mês",
      },
      color: "purple" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Olá, {session.user.name || "Usuário"}!
          </h1>
          <p className="mt-2 text-gray-600">
            Bem-vindo ao seu painel de controle. Aqui você pode acompanhar suas
            atividades e gerenciar sua conta.
          </p>
        </div>

        {/* Estatísticas */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Suas Estatísticas
          </h2>
          <UserStats stats={mockStats} />
        </div>

        {/* Resumo Financeiro */}
        {userStats?.orders.totalSpent && userStats.orders.totalSpent > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Resumo Financeiro
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-3 rounded-full">
                    <FaDollarSign className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Gasto</p>
                    <p className="text-2xl font-bold text-gray-900">
                      R${" "}
                      {userStats.orders.totalSpent.toFixed(2).replace(".", ",")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Média por Pedido</p>
                  <p className="text-lg font-semibold text-gray-900">
                    R${" "}
                    {(userStats.orders.totalSpent / userStats.orders.total)
                      .toFixed(2)
                      .replace(".", ",")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ações Rápidas */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/user/perfil"
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="text-center">
                <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900">Meu Perfil</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Editar informações pessoais
                </p>
              </div>
            </Link>

            <Link
              href="/user/pedidos"
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="text-center">
                <div className="bg-green-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <FaShoppingBag className="text-green-600 text-xl" />
                </div>
                <h3 className="font-medium text-gray-900">Meus Pedidos</h3>
                <p className="text-sm text-gray-600 mt-1">Acompanhar pedidos</p>
              </div>
            </Link>

            <Link
              href="/user/enderecos"
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="text-center">
                <div className="bg-purple-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <FaMapMarkerAlt className="text-purple-600 text-xl" />
                </div>
                <h3 className="font-medium text-gray-900">Endereços</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Gerenciar endereços
                </p>
              </div>
            </Link>

            <Link
              href="/wishlist"
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="text-center">
                <div className="bg-red-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <FaHeart className="text-red-600 text-xl" />
                </div>
                <h3 className="font-medium text-gray-900">Lista de Desejos</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Ver produtos salvos
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Atividades Recentes */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Atividades Recentes
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <FaShoppingBag className="text-blue-600 text-sm" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    Você fez um novo pedido
                  </p>
                  <p className="text-xs text-gray-500">Há 2 dias</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-red-100 p-2 rounded-full">
                  <FaHeart className="text-red-600 text-sm" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    Adicionou um produto à lista de desejos
                  </p>
                  <p className="text-xs text-gray-500">Há 5 dias</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-2 rounded-full">
                  <FaStar className="text-purple-600 text-sm" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Avaliou um produto</p>
                  <p className="text-xs text-gray-500">Há 1 semana</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
