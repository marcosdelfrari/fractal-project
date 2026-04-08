"use client";

import React, { useEffect, useState } from "react";
import { DashboardSidebar } from "@/components";
import { getAdminSettingsApiBase } from "@/lib/adminSettingsApi";
import { parsePickupAddresses } from "@/lib/pickupAddresses";
import { FaFloppyDisk, FaPlus, FaTrash } from "react-icons/fa6";
import type { SiteSettings } from "../types";
import { SettingsBackHeader } from "../SettingsBackHeader";

export default function AdminSettingsCheckoutRetiradaPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    void fetchSettings();
  }, []);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${getAdminSettingsApiBase()}/site`);
      if (res.ok) {
        const data = (await res.json()) as Record<string, unknown>;
        setSettings({
          ...(data as unknown as SiteSettings),
          pickupAddresses: parsePickupAddresses(data.pickupAddresses),
          checkoutMode:
            data.checkoutMode === "delivery_only" ||
            data.checkoutMode === "pickup_only"
              ? (data.checkoutMode as "delivery_only" | "pickup_only")
              : data.deliveryEnabled === false
                ? "pickup_only"
                : "delivery_and_pickup",
          deliveryEnabled:
            (data as { deliveryEnabled?: boolean }).deliveryEnabled !== false,
        });
      }
    } catch (error) {
      console.error("Erro ao carregar settings:", error);
      showMessage("error", "Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  };

  const addPickupLocation = () => {
    setSettings((prev) => {
      if (!prev) return prev;
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `pickup-${Date.now()}`;
      return {
        ...prev,
        pickupAddresses: [
          ...prev.pickupAddresses,
          { id, name: "", address: "" },
        ],
      };
    });
  };

  const removePickupLocation = (id: string) => {
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            pickupAddresses: prev.pickupAddresses.filter((p) => p.id !== id),
          }
        : null,
    );
  };

  const updatePickupLocation = (
    id: string,
    field: "name" | "address",
    value: string,
  ) => {
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            pickupAddresses: prev.pickupAddresses.map((p) =>
              p.id === id ? { ...p, [field]: value } : p,
            ),
          }
        : null,
    );
  };

  const saveCheckoutSettings = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      const res = await fetch(`${getAdminSettingsApiBase()}/site`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkoutMode: settings.checkoutMode,
          deliveryEnabled: settings.deliveryEnabled,
          pickupAddresses: settings.pickupAddresses
            .map((p) => ({
              id: p.id,
              name: p.name.trim(),
              address: p.address.trim(),
            }))
            .filter((p) => p.name && p.address),
        }),
      });

      if (res.ok) {
        showMessage("success", "Checkout e retirada salvos com sucesso!");
      } else {
        showMessage("error", "Erro ao salvar configurações");
      }
    } catch (error) {
      console.error("Erro ao salvar checkout/retirada:", error);
      showMessage("error", "Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex justify-start max-w-screen-2xl mx-auto max-lg:flex-col">
        <DashboardSidebar />
        <div className="flex-1 p-10 pb-admin-mobile-nav flex items-center justify-center">
          <p className="text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex justify-start max-w-screen-2xl mx-auto max-lg:flex-col">
      <DashboardSidebar />
      <div className="flex-1 p-10 max-md:p-4 pb-admin-mobile-nav animate-fade-in-up">
        <SettingsBackHeader
          title="Checkout e retirada"
          description="Configure se o checkout oferece entrega e gerencie os pontos de retirada."
        />

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-white border border-gray-100 rounded-2xl p-8">
          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                Modo do checkout
              </h3>
              <p className="text-[11px] text-gray-500 mb-4 max-w-2xl">
                Escolha entre: entrega e retirada, somente entrega ou somente
                retirada.
              </p>
              <div className="flex flex-col gap-3">
                <label
                  className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer hover:bg-[#E3E1D6]/80 ${
                    settings?.checkoutMode === "delivery_and_pickup"
                      ? "border-gray-900 bg-[#E3E1D6]"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery-mode"
                    className="mt-1"
                    checked={settings?.checkoutMode === "delivery_and_pickup"}
                    onChange={() =>
                      setSettings((prev) =>
                        prev
                          ? {
                              ...prev,
                              checkoutMode: "delivery_and_pickup",
                              deliveryEnabled: true,
                            }
                          : prev,
                      )
                    }
                  />
                  <span>
                    <span className="block text-sm font-medium text-gray-900">
                      Entrega e retirada
                    </span>
                    <span className="block text-[11px] text-gray-500 mt-0.5">
                      O cliente escolhe entre receber em casa ou buscar na loja.
                    </span>
                  </span>
                </label>
                <label
                  className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer hover:bg-[#E3E1D6]/80 ${
                    settings?.checkoutMode === "delivery_only"
                      ? "border-gray-900 bg-[#E3E1D6]"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery-mode"
                    className="mt-1"
                    checked={settings?.checkoutMode === "delivery_only"}
                    onChange={() =>
                      setSettings((prev) =>
                        prev
                          ? {
                              ...prev,
                              checkoutMode: "delivery_only",
                              deliveryEnabled: true,
                            }
                          : prev,
                      )
                    }
                  />
                  <span>
                    <span className="block text-sm font-medium text-gray-900">
                      Somente entrega
                    </span>
                    <span className="block text-[11px] text-gray-500 mt-0.5">
                      O cliente não vê opção de retirada no checkout.
                    </span>
                  </span>
                </label>
                <label
                  className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer hover:bg-[#E3E1D6]/80 ${
                    settings?.checkoutMode === "pickup_only"
                      ? "border-gray-900 bg-[#E3E1D6]"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery-mode"
                    className="mt-1"
                    checked={settings?.checkoutMode === "pickup_only"}
                    onChange={() =>
                      setSettings((prev) =>
                        prev
                          ? {
                              ...prev,
                              checkoutMode: "pickup_only",
                              deliveryEnabled: false,
                            }
                          : prev,
                      )
                    }
                  />
                  <span>
                    <span className="block text-sm font-medium text-gray-900">
                      Somente retirada na loja
                    </span>
                    <span className="block text-[11px] text-gray-500 mt-0.5">
                      Sem opção de entrega; fluxo direto para retirada.
                    </span>
                  </span>
                </label>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Pontos de retirada
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-1 max-w-xl">
                    O cliente escolhe um deles ao finalizar com &quot;retirada
                    na loja&quot;.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addPickupLocation}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-[#E3E1D6] shrink-0"
                >
                  <FaPlus size={14} />
                  Adicionar ponto
                </button>
              </div>

              <div className="space-y-4">
                {settings?.pickupAddresses?.length === 0 && (
                  <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
                    Nenhum ponto cadastrado. Quem escolher retirada no checkout
                    verá um aviso até você incluir ao menos um ponto com nome e
                    endereço.
                  </p>
                )}
                {settings?.pickupAddresses?.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 border border-gray-200 rounded-xl bg-[#E3E1D6]/50 space-y-3"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <label className="block text-xs font-medium text-gray-700 flex-1">
                        Nome do ponto (ex.: filial, bairro)
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) =>
                            updatePickupLocation(p.id, "name", e.target.value)
                          }
                          placeholder="Loja Centro"
                          className="mt-1.5 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-gray-400"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => removePickupLocation(p.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg shrink-0"
                        aria-label="Remover ponto"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                    <label className="block text-xs font-medium text-gray-700">
                      Endereço e observações (horário, andar, etc.)
                      <textarea
                        value={p.address}
                        onChange={(e) =>
                          updatePickupLocation(p.id, "address", e.target.value)
                        }
                        rows={3}
                        placeholder="Rua, número, CEP, horário de retirada..."
                        className="mt-1.5 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-gray-400 font-mono"
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => void saveCheckoutSettings()}
            disabled={saving}
            className="mt-8 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            <FaFloppyDisk size={14} />
            {saving ? "Salvando..." : "Salvar configurações"}
          </button>
        </div>
      </div>
    </div>
  );
}
