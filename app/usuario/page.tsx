import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { apiClient } from "@/lib/api";
import UserDashboardClient from "@/components/UserDashboardClient";

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
      // If the API call fails, we can return null or mock data
      // For now, let's log the error and return null
      console.error("Failed to fetch user stats", await response.text());
      return null;
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
      <div className="min-h-screen bg-[#E3E1D6] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-12 text-center max-w-md">
          <h1 className="text-2xl font-light text-gray-900 tracking-tight mb-4">
            Erro de Autenticação
          </h1>
          <p className="text-gray-500 font-light">
            Não foi possível carregar os dados do usuário.
          </p>
        </div>
      </div>
    );
  }

  const userStats = await getUserStats(session.user.id);

  return (
    <UserDashboardClient
      initialStats={userStats}
      user={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
    />
  );
}
