"use client";
import { DashboardSidebar } from "@/components";
import React, { useEffect, useState, use } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { isValidEmailAddressFormat } from "@/lib/utils";
import apiClient from "@/lib/api";
import {
  FaRegUser,
  FaTrash,
  FaEdit,
  FaChevronLeft,
  FaLock,
  FaShieldAlt,
} from "react-icons/fa";

interface DashboardUserDetailsProps {
  params: Promise<{ id: string }>;
}

const DashboardSingleUserPage = ({ params }: DashboardUserDetailsProps) => {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [userInput, setUserInput] = useState<{
    email: string;
    newPassword: string;
    role: string;
  }>({
    email: "",
    newPassword: "",
    role: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const deleteUser = async () => {
    if (!window.confirm("Tem certeza que deseja excluir este usuário?")) return;

    setIsDeleting(true);
    apiClient
      .delete(`/api/users/${id}`)
      .then((response) => {
        if (response.status === 204) {
          toast.success("Usuário excluído com sucesso");
          router.push("/admin/users");
        } else {
          throw Error("Erro ao excluir usuário");
        }
      })
      .catch(() => toast.error("Erro ao excluir usuário"))
      .finally(() => setIsDeleting(false));
  };

  const updateUser = async () => {
    if (!userInput.email || !userInput.role) {
      toast.error("Por favor, preencha os campos obrigatórios");
      return;
    }

    if (!isValidEmailAddressFormat(userInput.email)) {
      toast.error("Formato de email inválido");
      return;
    }

    if (userInput.newPassword && userInput.newPassword.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres");
      return;
    }

    setIsUpdating(true);
    apiClient
      .put(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userInput.email,
          password: userInput.newPassword || undefined,
          role: userInput.role,
        }),
      })
      .then((response) => {
        if (response.status === 200) {
          toast.success("Usuário atualizado com sucesso");
          return response.json();
        } else {
          throw Error("Erro ao atualizar usuário");
        }
      })
      .catch(() => toast.error("Erro ao atualizar usuário"))
      .finally(() => setIsUpdating(false));
  };

  useEffect(() => {
    apiClient
      .get(`/api/users/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setUserInput({
          email: data?.email,
          newPassword: "",
          role: data?.role,
        });
      });
  }, [id]);

  return (
    <div className="bg-[#E3E1D6] flex min-h-screen max-w-screen-2xl mx-auto max-lg:flex-col animate-fade-in-up">
      <DashboardSidebar />
      <div className="flex-1 p-10 max-md:p-4">
        {/* Header Section */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/users")}
              className="p-3 bg-[#E3E1D6] rounded-full text-gray-400 hover:text-gray-900 transition-colors"
            >
              <FaChevronLeft size={14} />
            </button>
            <div className="p-3 bg-[#E3E1D6] rounded-full text-gray-900">
              <FaRegUser size={16} />
            </div>
            <h1 className="text-lg font-light tracking-widest text-gray-900 uppercase">
              Detalhes do Usuário
            </h1>
          </div>

          <button
            onClick={deleteUser}
            disabled={isDeleting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-red-100 text-[10px] uppercase tracking-widest font-medium text-red-400 hover:bg-red-50 hover:text-red-600 transition-all duration-300 disabled:opacity-50"
          >
            <FaTrash size={10} />
            {isDeleting ? "Excluindo..." : "Excluir Usuário"}
          </button>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 space-y-12 transition-all duration-300">
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-[#E3E1D6] rounded-full text-gray-400">
                <FaShieldAlt size={12} />
              </div>
              <h2 className="text-sm font-light tracking-widest text-gray-900 uppercase">
                Credenciais e Cargo
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full bg-[#E3E1D6] border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-2xl py-4 px-6 transition-all duration-300 text-gray-900"
                  value={userInput.email}
                  onChange={(e) =>
                    setUserInput({ ...userInput, email: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1">
                  Cargo
                </label>
                <select
                  className="w-full bg-[#E3E1D6] border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-2xl py-4 px-6 transition-all duration-300 text-gray-900 appearance-none cursor-pointer"
                  value={userInput.role}
                  onChange={(e) =>
                    setUserInput({ ...userInput, role: e.target.value })
                  }
                >
                  <option value="admin">Administrador</option>
                  <option value="user">Usuário Padrão</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                  <FaLock size={10} /> Nova Senha
                  <span className="text-[9px] text-gray-300 tracking-normal italic uppercase">
                    (Deixe em branco para manter a atual)
                  </span>
                </label>
                <input
                  type="password"
                  placeholder="Min. 8 caracteres"
                  className="w-full bg-[#E3E1D6] border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-2xl py-4 px-6 transition-all duration-300 text-gray-900"
                  onChange={(e) =>
                    setUserInput({ ...userInput, newPassword: e.target.value })
                  }
                  value={userInput.newPassword}
                />
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-x-4 pt-10 border-t border-gray-50">
            <button
              type="button"
              onClick={() => router.push("/admin/users")}
              className="px-8 py-3.5 rounded-full border border-gray-200 text-[11px] uppercase tracking-widest font-medium text-gray-400 hover:text-gray-900 hover:border-gray-900 transition-all duration-300"
            >
              Voltar
            </button>
            <button
              onClick={updateUser}
              disabled={isUpdating}
              className="px-12 py-3.5 rounded-full bg-black text-[11px] uppercase tracking-widest font-medium text-white hover:bg-zinc-800 transition-all duration-300 disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center gap-2 shadow-none"
            >
              {isUpdating ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSingleUserPage;
