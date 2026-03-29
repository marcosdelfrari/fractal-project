"use client";

// *********************
// Role of the component: Component that displays all orders on admin dashboard page
// Name of the component: AdminOrders.tsx
// Version: 1.0
// Component call: <AdminOrders />
// Input parameters: No input parameters
// Output: Table with all orders
// *********************

import React, { useEffect, useState } from "react";
import Link from "next/link";
import apiClient from "@/lib/api";

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const response = await apiClient.get("/api/orders");
      const data = await response.json();

      setOrders(data?.orders);
    };
    fetchOrders();
  }, []);

  return (
    <div className="w-full">
      <div className="overflow-x-auto bg-white rounded-3xl border border-gray-100">
        <table className="table table-md table-pin-cols">
          {/* head */}
          <thead className="bg-gray-50/50">
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
            {/* row 1 */}
            {orders &&
              orders.length > 0 &&
              orders.map((order) => (
                <tr
                  key={order?.id}
                  className="hover:bg-gray-50/50 transition-colors"
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
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
