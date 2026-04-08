"use client";
import { DashboardSidebar } from "@/components";
import apiClient from "@/lib/api";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { FaRegUser } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";

const DashboardUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // sending API request for all users
    apiClient
      .get("/api/users")
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setUsers(data);
      });
  }, []);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const email = (u.email || "").toLowerCase();
      const role = (u.role || "").toLowerCase();
      const id = (u.id || "").toLowerCase();
      return email.includes(q) || role.includes(q) || id.includes(q);
    });
  }, [users, searchQuery]);

  return (
    <div className="bg-white flex min-h-screen max-w-screen-2xl mx-auto max-lg:flex-col animate-fade-in-up">
      <DashboardSidebar />
      <div className="flex-1 p-10 max-md:p-4 pb-admin-mobile-nav">
        {/* Header Section */}
        <div className="flex items-center gap-3 border-b border-gray-100 pb-6 mb-10">
          <div className="p-3 bg-[#E3E1D6] rounded-full text-gray-900">
            <FaRegUser size={16} />
          </div>
          <h1 className="text-lg font-light tracking-widest text-gray-900 uppercase">
            Gerenciar Usuários
          </h1>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="relative w-full sm:flex-1 sm:min-w-0 sm:max-w-lg">
            <FaSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none"
              aria-hidden
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por e-mail, cargo ou ID..."
              className="w-full bg-[#E3E1D6] border border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-full py-3 pl-10 pr-5 text-sm text-gray-900 placeholder:text-gray-400"
              autoComplete="off"
            />
          </div>
          <Link
            href="/admin/users/new"
            className="shrink-0 self-end sm:self-auto"
          >
            <button
              type="button"
              className="flex items-center justify-center rounded-full bg-black px-6 py-3 text-[11px] uppercase tracking-widest font-medium text-white hover:bg-zinc-800 transition-all duration-300"
            >
              Adicionar Usuário
            </button>
          </Link>
        </div>

        <div className="w-full overflow-auto h-[70vh] bg-white rounded-3xl border border-gray-100">
          <table className="table table-md table-pin-cols">
            {/* head */}
            <thead className="bg-[#E3E1D6]/50">
              <tr>
                <th className="py-4 px-6 text-[11px] font-light tracking-widest text-gray-500 uppercase">
                  <label>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm rounded-md"
                    />
                  </label>
                </th>
                <th className="py-4 text-[11px] font-light tracking-widest text-gray-500 uppercase">
                  Email
                </th>
                <th className="py-4 text-[11px] font-light tracking-widest text-gray-500 uppercase">
                  Cargo
                </th>
                <th className="py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.length > 0 &&
              searchQuery.trim() &&
              filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-12 text-center text-sm text-gray-400"
                  >
                    Nenhum usuário encontrado para essa busca.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-[#E3E1D6]/50 transition-colors"
                  >
                    <th className="px-6">
                      <label>
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm rounded-md"
                        />
                      </label>
                    </th>

                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <p className="font-medium text-gray-900">
                          {user?.email}
                        </p>
                      </div>
                    </td>
                    <td className="py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                          user?.role === "admin"
                            ? "bg-blue-50 text-blue-600 border border-blue-100"
                            : "bg-[#E3E1D6] text-gray-600 border border-gray-100"
                        }`}
                      >
                        {user?.role}
                      </span>
                    </td>
                    <th className="py-4 text-right pr-6">
                      <Link
                        href={`/admin/users/${user?.id}`}
                        className="text-[10px] font-medium uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                      >
                        Detalhes
                      </Link>
                    </th>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardUsers;
