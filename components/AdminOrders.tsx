"use client";

// *********************
// Role of the component: Component that displays all orders on admin dashboard page
// Name of the component: AdminOrders.tsx
// Version: 1.0
// Component call: <AdminOrders />
// Input parameters: No input parameters
// Output: Table with all orders
// *********************

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fetchNextApi } from "@/lib/nextApiOrigin";
import { FaSearch } from "react-icons/fa";

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      const response = await fetchNextApi("/api/orders");
      const data = await response.json();

      setOrders(Array.isArray(data?.orders) ? data.orders : []);
    };
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) => {
      const id = (o.id || "").toLowerCase();
      const shortId = id.slice(0, 8);
      const name = `${o.name || ""} ${o.lastname || ""}`.toLowerCase().trim();
      const email = (o.email || "").toLowerCase();
      const country = (o.country || "").toLowerCase();
      const status = String(o.status || "").toLowerCase();
      const total = String(o.total ?? "");
      return (
        id.includes(q) ||
        shortId.includes(q) ||
        name.includes(q) ||
        email.includes(q) ||
        country.includes(q) ||
        status.includes(q) ||
        total.includes(q)
      );
    });
  }, [orders, searchQuery]);

  return (
    <div className="w-full">
      <div className="relative w-full max-w-lg mb-8">
        <FaSearch
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none"
          aria-hidden
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por ID, cliente, e-mail, país, status ou total..."
          className="w-full bg-[#E3E1D6] border border-transparent focus:border-gray-200 focus:bg-white focus:ring-0 rounded-full py-3 pl-10 pr-5 text-sm text-gray-900 placeholder:text-gray-400"
          autoComplete="off"
        />
      </div>

      <div className="overflow-x-auto bg-white rounded-3xl border border-gray-100">
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
                ID do Pedido
              </th>
              <th className="py-4 text-[11px] font-light tracking-widest text-gray-500 uppercase">
                Cliente e País
              </th>
              <th className="py-4 text-[11px] font-light tracking-widest text-gray-500 uppercase">
                Status
              </th>
              <th className="py-4 text-[11px] font-light tracking-widest text-gray-500 uppercase">
                Total
              </th>
              <th className="py-4 text-[11px] font-light tracking-widest text-gray-500 uppercase">
                Data
              </th>
              <th className="py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.length > 0 &&
            searchQuery.trim() &&
            filteredOrders.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-sm text-gray-400"
                >
                  Nenhum pedido encontrado para essa busca.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr
                  key={order?.id}
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
                    <span className="font-medium text-gray-900">
                      #{order?.id.slice(0, 8)}...
                    </span>
                  </td>

                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium text-gray-900">
                          {order?.name}
                        </div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider">
                          {order?.country}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4">
                    <span className="px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider bg-green-50 text-green-600 border border-green-100">
                      {order?.status}
                    </span>
                  </td>

                  <td className="py-4">
                    <span className="font-medium text-gray-900">
                      R$ {order?.total}
                    </span>
                  </td>

                  <td className="py-4 text-sm text-gray-500">
                    {new Date(Date.parse(order?.dateTime)).toLocaleDateString(
                      "pt-BR",
                    )}
                  </td>
                  <th className="py-4">
                    <Link
                      href={`/admin/orders/${order?.id}`}
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
  );
};

export default AdminOrders;
