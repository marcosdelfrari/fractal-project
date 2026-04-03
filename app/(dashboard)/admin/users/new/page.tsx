"use client";
import { DashboardSidebar } from "@/components";
import { isValidEmailAddressFormat } from "@/lib/utils";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { sanitizeFormData } from "@/lib/form-sanitize";
import apiClient from "@/lib/api";
import { FaUserPlus, FaChevronLeft, FaLock, FaShieldAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";

const DashboardCreateNewUser = () => {
  const [userInput, setUserInput] = useState<{
    email: string;
    password: string;
    role: string;
  }>({
    email: "",
    password: "",
    role: "user",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const addNewUser = async () => {
    if (userInput.email === "" || userInput.password === "") {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    if (!isValidEmailAddressFormat(userInput.email)) {
      toast.error("Formato de email inválido");
      return;
    }

    if (userInput.password.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres");
      return;
    }

    setIsSubmitting(true);
    const sanitizedUserInput = sanitizeFormData(userInput);

    apiClient
      .post(`/api/users`, {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitizedUserInput),
      })
      .then((response) => {
        if (response.status === 201) {
          toast.success("Usuário criado com sucesso");
          setUserInput({
            email: "",
            password: "",
            role: "user",
          });
          router.push("/admin/users");
        } else {
          throw Error("Erro ao criar usuário");
        }
      })
      .catch(() => toast.error("Erro ao criar usuário"))
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="bg-[#E3E1D6] flex min-h-screen max-w-screen-2xl mx-auto max-lg:flex-col animate-fade-in-up">
      <DashboardSidebar />
      <div className="flex-1 p-10 max-md:p-4">
        {/* Header Section */}
        <div className="flex items-center gap-3 border-b border-gray-100 pb-6 mb-10">
          <button
            onClick={() => router.push("/admin/users")}
            className="p-3 bg-[#E3E1D6] rounded-full text-gray-400 hover:text-gray-900 transition-colors"
          >
            <FaChevronLeft size={14} />
          </button>
          <div className="p-3 bg-[#E3E1D6] rounded-full text-gray-900">
            <FaUserPlus size={16} />
          </div>
          <h1 className="text-lg font-light tracking-widest text-gray-900 uppercase">
            Novo Usuário
          </h1>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 space-y-12 transition-all duration-300">
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-[#E3E1D6] rounded-full text-gray-400">
                <FaShieldAlt size={12} />
              </div>
              <h2 className="text-sm font-light tracking-widest text-gray-900 uppercase">
                Dados de Acesso
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1">
                  Email *
                </label>
                <input
                  type="email"
                  placeholder="email@exemplo.com"
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
                  <option value="user">Usuário Padrão</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                  <FaLock size={10} /> Senha *
                </label>
                <input
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  className="w-full bg-[#E3E1D6] border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-2xl py-4 px-6 transition-all duration-300 text-gray-900"
                  value={userInput.password}
                  onChange={(e) =>
                    setUserInput({ ...userInput, password: e.target.value })
                  }
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
              Cancelar
            </button>
            <button
              onClick={addNewUser}
              disabled={isSubmitting}
              className="px-12 py-3.5 rounded-full bg-black text-[11px] uppercase tracking-widest font-medium text-white hover:bg-zinc-800 transition-all duration-300 disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center gap-2 shadow-none"
            >
              {isSubmitting ? "Criando..." : "Criar Usuário"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCreateNewUser;
