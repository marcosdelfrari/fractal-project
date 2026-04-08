"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import UserOrders from "@/components/UserOrders";
import UserAddresses from "@/components/UserAddresses";
import UserProfileForm from "@/components/UserProfileForm";
import UserAccountShell, { type UserAccountTab } from "@/components/UserAccountShell";
import { apiClient } from "@/lib/api";
import { FaHeart, FaSpinner } from "react-icons/fa";
import Link from "next/link";
import toast from "react-hot-toast";

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

type TabType = UserAccountTab;

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
  const [profileUser, setProfileUser] = useState<any>(null); // To store full user profile data
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileLoadError, setProfileLoadError] = useState<string | null>(null);

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

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    const newUrl = tab === "orders" ? "/usuario" : `/usuario?tab=${tab}`;
    router.push(newUrl, { scroll: false });

    if (tab === "profile" && !profileUser) {
      fetchUserProfile();
    }
  };

  const fetchUserProfile = async () => {
    try {
      setProfileLoadError(null);
      setIsLoadingProfile(true);
      const response = await apiClient.get(`/api/users/${user.id}/profile`);
      if (response.ok) {
        const data = await response.json();
        setProfileUser(data.data ?? data);
      } else {
        setProfileLoadError("Não foi possível carregar seus dados.");
        toast.error("Não foi possível carregar o perfil.");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setProfileLoadError("Não foi possível carregar seus dados.");
      toast.error("Não foi possível carregar o perfil.");
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
        instagram: formData.instagram?.trim() ?? "",
      };
      const response = await apiClient.put(
        `/api/users/${user.id}/profile`,
        payload,
      );

      if (response.ok) {
        fetchUserProfile();
        toast.success("Perfil atualizado com sucesso!");
      } else {
        throw new Error("Falha ao atualizar perfil");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Erro ao atualizar perfil. Tente novamente.");
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
          <div className="bg-white rounded-3xl border-2 border-black p-12 text-center">
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
              className="inline-flex items-center justify-center rounded-full border border-transparent bg-black px-8 py-3 text-sm uppercase tracking-wider font-medium text-white  hover:bg-zinc-800 transition-all duration-300"
            >
              Ir para Lista de Desejos
            </Link>
          </div>
        );
      case "profile":
        if (profileLoadError) {
          return (
            <div className="bg-white rounded-3xl border-2 border-black p-10 text-center max-w-lg mx-auto">
              <p className="text-gray-700 font-light mb-6">{profileLoadError}</p>
              <button
                type="button"
                onClick={() => void fetchUserProfile()}
                className="inline-flex items-center justify-center rounded-full border border-transparent bg-black px-8 py-3 text-sm uppercase tracking-wider font-medium text-white hover:bg-zinc-800 transition-all duration-300"
              >
                Tentar novamente
              </button>
            </div>
          );
        }
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
    <UserAccountShell
      user={user}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      {renderContent()}
    </UserAccountShell>
  );
}
