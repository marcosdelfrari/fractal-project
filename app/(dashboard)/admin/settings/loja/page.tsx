"use client";

import React, { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components";
import { FaFloppyDisk } from "react-icons/fa6";
import { getAdminSettingsApiBase } from "@/lib/adminSettingsApi";
import { parsePickupAddresses } from "@/lib/pickupAddresses";
import type { SiteSettings } from "../types";
import { SettingsBackHeader } from "../SettingsBackHeader";

export default function AdminSettingsLojaPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const iconInputRef = React.useRef<HTMLInputElement>(null);
  const logoInputRef = React.useRef<HTMLInputElement>(null);

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

  const handleSettingsChange = (
    field: Exclude<keyof SiteSettings, "pickupAddresses">,
    value: string,
  ) => {
    setSettings((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const uploadSiteFile = async (
    field: "storeIcon" | "storeLogo",
    file: File | null,
  ) => {
    if (!file) return;
    const setBusy = field === "storeIcon" ? setUploadingIcon : setUploadingLogo;
    setBusy(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", field);
      const res = await fetch(`${getAdminSettingsApiBase()}/site/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showMessage(
          "error",
          typeof data.error === "string"
            ? data.error
            : "Erro ao enviar arquivo",
        );
        return;
      }
      if (data.settings) {
        setSettings(data.settings);
      } else if (data.url) {
        setSettings((prev) => (prev ? { ...prev, [field]: data.url } : prev));
      }
      showMessage(
        "success",
        field === "storeIcon"
          ? "Ícone enviado e salvo."
          : "Logo enviada e salva.",
      );
    } catch (error) {
      console.error("Upload settings asset:", error);
      showMessage("error", "Erro ao enviar arquivo");
    } finally {
      setBusy(false);
    }
  };

  const saveSiteSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      const res = await fetch(`${getAdminSettingsApiBase()}/site`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: settings.storeName,
          email: settings.email,
          phone: settings.phone,
          whatsapp: settings.whatsapp,
          facebook: settings.facebook,
          instagram: settings.instagram,
          x: settings.x,
          pinterest: settings.pinterest,
          youtube: settings.youtube,
          linkedin: settings.linkedin,
          tiktok: settings.tiktok,
          address: settings.address,
        }),
      });

      if (res.ok) {
        showMessage("success", "Configurações salvas com sucesso!");
      } else {
        showMessage("error", "Erro ao salvar configurações");
      }
    } catch (error) {
      console.error("Erro ao salvar settings:", error);
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
          title="Informações da loja"
          description="Contato, endereço geral, pontos de retirada no checkout e identidade visual (ícone e logo)."
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Nome da Loja
              </label>
              <input
                type="text"
                value={settings?.storeName || ""}
                onChange={(e) =>
                  handleSettingsChange("storeName", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={settings?.email || ""}
                onChange={(e) => handleSettingsChange("email", e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Telefone
              </label>
              <input
                type="tel"
                value={settings?.phone || ""}
                onChange={(e) => handleSettingsChange("phone", e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                WhatsApp
              </label>
              <input
                type="tel"
                value={settings?.whatsapp || ""}
                onChange={(e) =>
                  handleSettingsChange("whatsapp", e.target.value)
                }
                placeholder="+55 11 99999-9999"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
              />
            </div>

            <div className="md:col-span-2 border-t border-gray-100 pt-8">
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                Redes sociais
              </h3>
              <p className="text-[11px] text-gray-500 mb-4 max-w-2xl">
                Cadastre apenas as redes que deseja exibir no site. Campos
                vazios não serão exibidos.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Instagram (URL)
                  </label>
                  <input
                    type="url"
                    value={settings?.instagram || ""}
                    onChange={(e) =>
                      handleSettingsChange("instagram", e.target.value)
                    }
                    placeholder="https://instagram.com/sualoja"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Facebook (URL)
                  </label>
                  <input
                    type="url"
                    value={settings?.facebook || ""}
                    onChange={(e) =>
                      handleSettingsChange("facebook", e.target.value)
                    }
                    placeholder="https://facebook.com/sualoja"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    X / Twitter (URL)
                  </label>
                  <input
                    type="url"
                    value={settings?.x || ""}
                    onChange={(e) => handleSettingsChange("x", e.target.value)}
                    placeholder="https://x.com/sualoja"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Pinterest (URL)
                  </label>
                  <input
                    type="url"
                    value={settings?.pinterest || ""}
                    onChange={(e) =>
                      handleSettingsChange("pinterest", e.target.value)
                    }
                    placeholder="https://pinterest.com/sualoja"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    YouTube (URL)
                  </label>
                  <input
                    type="url"
                    value={settings?.youtube || ""}
                    onChange={(e) =>
                      handleSettingsChange("youtube", e.target.value)
                    }
                    placeholder="https://youtube.com/@sualoja"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    LinkedIn (URL)
                  </label>
                  <input
                    type="url"
                    value={settings?.linkedin || ""}
                    onChange={(e) =>
                      handleSettingsChange("linkedin", e.target.value)
                    }
                    placeholder="https://linkedin.com/company/sualoja"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    TikTok (URL)
                  </label>
                  <input
                    type="url"
                    value={settings?.tiktok || ""}
                    onChange={(e) =>
                      handleSettingsChange("tiktok", e.target.value)
                    }
                    placeholder="https://tiktok.com/@sualoja"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Endereço (geral / correspondência)
              </label>
              <textarea
                value={settings?.address || ""}
                onChange={(e) =>
                  handleSettingsChange("address", e.target.value)
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Texto institucional; não é o mesmo que os pontos de retirada
                abaixo.
              </p>
            </div>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Ícone (favicon)
                </label>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 border border-gray-200 rounded-lg bg-[#E3E1D6] flex items-center justify-center overflow-hidden flex-shrink-0">
                    {settings?.storeIcon ? (
                      <img
                        src={settings.storeIcon}
                        alt="Ícone"
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <span className="text-[10px] text-gray-400 text-center px-1">
                        sem ícone
                      </span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      ref={iconInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon,image/vnd.microsoft.icon,.ico"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void uploadSiteFile("storeIcon", f);
                        e.target.value = "";
                      }}
                    />
                    <button
                      type="button"
                      disabled={uploadingIcon}
                      onClick={() => iconInputRef.current?.click()}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-[#E3E1D6] disabled:opacity-50"
                    >
                      {uploadingIcon ? "Enviando…" : "Enviar imagem"}
                    </button>
                    <p className="text-[11px] text-gray-500">
                      PNG, JPG, WebP, SVG ou ICO — apenas envio de arquivo.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Logo da loja
                </label>
                <div className="flex items-start gap-4">
                  <div className="w-32 h-16 border border-gray-200 rounded-lg bg-[#E3E1D6] flex items-center justify-center overflow-hidden flex-shrink-0">
                    {settings?.storeLogo ? (
                      <img
                        src={settings.storeLogo}
                        alt="Logo"
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <span className="text-[10px] text-gray-400 text-center px-1">
                        sem logo
                      </span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void uploadSiteFile("storeLogo", f);
                        e.target.value = "";
                      }}
                    />
                    <button
                      type="button"
                      disabled={uploadingLogo}
                      onClick={() => logoInputRef.current?.click()}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-[#E3E1D6] disabled:opacity-50"
                    >
                      {uploadingLogo ? "Enviando…" : "Enviar imagem"}
                    </button>
                    <p className="text-[11px] text-gray-500">
                      PNG ou SVG com fundo transparente — apenas envio de
                      arquivo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => void saveSiteSettings()}
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
