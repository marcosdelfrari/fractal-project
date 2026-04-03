"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import UserOrders from "@/components/UserOrders";
import UserAddresses from "@/components/UserAddresses";
import UserProfileForm from "@/components/UserProfileForm";
import { apiClient } from "@/lib/api";
import {
  FaShoppingBag,
  FaHeart,
  FaMapMarkerAlt,
  FaUser,
  FaSignOutAlt,
  FaSpinner,
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

interface UserDashboardClientProps {
  initialStats: UserStatsData | null;
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

type TabType = "orders" | "addresses" | "profile" | "wishlist";

export default function UserDashboardClient({
  initialStats,
  user,
}: UserDashboardClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");
  const allowedTabs: TabType[] = ["orders", "addresses", "profile", "wishlist"];
  const initialTab: TabType = allowedTabs.includes(tabParam as TabType)
    ? (tabParam as TabType)
    : "orders";

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileUser, setProfileUser] = useState<any>(null); // To store full user profile data
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Update active tab when URL changes
  useEffect(() => {
    const tab = searchParams.get("tab") as TabType;
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Fetch profile if initial tab is profile
  useEffect(() => {
    if (activeTab === "profile" && !profileUser) {
      fetchUserProfile();
    }
  }, [activeTab]);

  const menuItems = [
    { id: "orders", label: "Meus Pedidos", icon: <FaShoppingBag /> },
    { id: "addresses", label: "Endereços", icon: <FaMapMarkerAlt /> },
    { id: "wishlist", label: "Lista de Desejos", icon: <FaHeart /> },
    { id: "profile", label: "Meu Perfil", icon: <FaUser /> },
  ];

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
    // Update URL sem recarregar a página inteira
    const newUrl = tab === "orders" ? "/usuario" : `/usuario?tab=${tab}`;
    router.push(newUrl, { scroll: false });

    if (tab === "profile" && !profileUser) {
      fetchUserProfile();
    }
  };

  const fetchUserProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const response = await apiClient.get(`/api/users/${user.id}/profile`);
      if (response.ok) {
        const data = await response.json();
        setProfileUser(data.data ?? data);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleProfileUpdate = async (formData: any) => {
    try {
      setIsLoadingProfile(true);
      const payload = {
        name: formData.name?.trim() ?? "",
        phone: formData.phone?.trim() ?? "",
        cpf: (formData.cpf && String(formData.cpf).replace(/\D/g, "")) || "",
        photo: formData.photo?.trim() ?? "",
      };
      const response = await apiClient.put(
        `/api/users/${user.id}/profile`,
        payload,
      );

      if (response.ok) {
        fetchUserProfile();
        alert("Perfil atualizado com sucesso!");
      } else {
        throw new Error("Falha ao atualizar perfil");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Erro ao atualizar perfil. Tente novamente.");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "orders":
        return <UserOrders />;
      case "addresses":
        return <UserAddresses />;
      case "wishlist":
        return (
          <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-12 text-center">
            <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-[#E3E1D6] text-gray-400 mb-6">
              <FaHeart className="text-3xl" />
            </div>
            <h3 className="text-xl font-light text-gray-900 tracking-tight mb-2">
              Sua Lista de Desejos
            </h3>
            <p className="text-gray-500 font-light mb-8">
              Veja os produtos que você salvou para comprar mais tarde.
            </p>
            <Link
              href="/wishlist"
              className="inline-flex items-center justify-center rounded-full border border-transparent bg-black px-8 py-3 text-sm uppercase tracking-wider font-medium text-white shadow-lg hover:bg-zinc-800 transition-all duration-300"
            >
              Ir para Lista de Desejos
            </Link>
          </div>
        );
      case "profile":
        return profileUser ? (
          <UserProfileForm
            user={profileUser}
            onSubmit={handleProfileUpdate}
            isLoading={isLoadingProfile}
          />
        ) : (
          <div className="flex justify-center py-12">
            <FaSpinner className="animate-spin text-4xl text-blue-600" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#E3E1D6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside
            className={`md:w-72 flex-shrink-0 ${isMobileMenuOpen ? "block" : "hidden"} md:block`}
          >
            <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden sticky top-24">
              <div className="p-8 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#E3E1D6] rounded-full text-gray-900">
                    <FaUser size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 font-light uppercase tracking-widest">
                      Bem-vindo
                    </p>
                    <p className="font-medium text-gray-900 truncate">
                      {user.name || "Usuário"}
                    </p>
                  </div>
                </div>
              </div>

              <nav className="p-4">
                <ul className="space-y-1">
                  {menuItems.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => handleTabChange(item.id as TabType)}
                        className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 ${
                          activeTab === item.id
                            ? "bg-[#E3E1D6] text-gray-900 border border-gray-200 shadow-sm"
                            : "text-gray-600 hover:bg-[#E3E1D6] hover:text-gray-900 border border-transparent"
                        }`}
                      >
                        <span
                          className={`flex items-center justify-center w-8 h-8 rounded-full ${activeTab === item.id ? "bg-black text-white" : "bg-gray-100 text-gray-500"}`}
                        >
                          {item.icon}
                        </span>
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-sm font-medium text-gray-600 hover:bg-[#E3E1D6] hover:text-gray-900 border border-transparent hover:border-gray-200 transition-all duration-300"
                  >
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500">
                      <FaSignOutAlt />
                    </span>
                    Sair
                  </button>
                </div>
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 pb-24 md:pb-0">
            {renderContent()}
          </main>
        </div>
      </div>

      {/* User Mobile Bottom Navigation (Pill Style) */}
      <div className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-md rounded-[2rem] border border-zinc-200/80 bg-white/95 backdrop-blur-sm shadow-[0_12px_30px_rgba(0,0,0,0.08)] px-2 py-2.5 flex justify-between items-center overflow-x-auto gap-2">
        <Link
          href="/"
          className="relative flex flex-col items-center justify-center flex-shrink-0 w-12 h-12 rounded-2xl text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 transition-all duration-200"
        >
          <span className="transition-colors duration-200">
            <svg
              stroke="currentColor"
              fill="none"
              strokeWidth="2"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
              height="22"
              width="22"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </span>
        </Link>
        {[
          { id: "orders", icon: <FaShoppingBag size={22} />, tab: "orders" },
          {
            id: "addresses",
            icon: <FaMapMarkerAlt size={22} />,
            tab: "addresses",
          },
          { id: "wishlist", icon: <FaHeart size={22} />, tab: "wishlist" },
          { id: "profile", icon: <FaUser size={22} />, tab: "profile" },
        ].map((item) => {
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.tab as TabType)}
              className={`relative flex flex-col items-center justify-center flex-shrink-0 w-12 h-12 rounded-2xl transition-all duration-200 ${
                isActive
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
              }`}
            >
              <span className="transition-colors duration-200">
                {item.icon}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
