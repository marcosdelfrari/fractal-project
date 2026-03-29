"use client";
import { DashboardSidebar } from "@/components";
import apiClient from "@/lib/api";
import { nanoid } from "nanoid";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FaRegUser } from "react-icons/fa6";

const DashboardUsers = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // sending API request for all users
    apiClient.get("/api/users")
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setUsers(data);
      });
  }, []);

  return (
    <div className="bg-gray-50 flex min-h-screen max-w-screen-2xl mx-auto max-xl:flex-col animate-fade-in-up">
      <DashboardSidebar />
      <div className="flex-1 p-10 max-md:p-4">
        {/* Header Section */}
        <div className="flex items-center gap-3 border-b border-gray-100 pb-6 mb-10">
          <div className="p-3 bg-gray-50 rounded-full text-gray-900">
            <FaRegUser size={16} />
          </div>
          <h1 className="text-lg font-light tracking-widest text-gray-900 uppercase">
            Gerenciar Usuários
          </h1>
        </div>

        <div className="flex justify-end mb-8">
          <Link href="/admin/users/new">
            <button className="flex items-center justify-center rounded-full bg-black px-6 py-3 text-[11px] uppercase tracking-widest font-medium text-white hover:bg-zinc-800 transition-all duration-300">
              Adicionar Usuário
            </button>
          </Link>
        </div>

        <div className="w-full overflow-auto h-[70vh] bg-white rounded-3xl border border-gray-100">
          <table className="table table-md table-pin-cols">
            {/* head */}
            <thead className="bg-gray-50/50">
              <tr>
                <th className="py-4 px-6 text-[11px] font-light tracking-widest text-gray-500 uppercase">
                  <label>
                    <input type="checkbox" className="checkbox checkbox-sm rounded-md" />
                  </label>
                </th>
                <th className="py-4 text-[11px] font-light tracking-widest text-gray-500 uppercase">Email</th>
                <th className="py-4 text-[11px] font-light tracking-widest text-gray-500 uppercase">Cargo</th>
                <th className="py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {/* row 1 */}
              {users &&
                users.map((user) => (
                  <tr key={nanoid()} className="hover:bg-gray-50/50 transition-colors">
                    <th className="px-6">
                      <label>
                        <input type="checkbox" className="checkbox checkbox-sm rounded-md" />
                      </label>
                    </th>

                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <p className="font-medium text-gray-900">{user?.email}</p>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                        user?.role === 'admin' 
                          ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                          : 'bg-gray-50 text-gray-600 border border-gray-100'
                      }`}>
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
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardUsers;