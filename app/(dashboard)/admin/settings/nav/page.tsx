"use client";

import React, { useEffect, useState } from "react";
import { DashboardSidebar } from "@/components";
import { FaFloppyDisk, FaPlus, FaTrash } from "react-icons/fa6";
import { getAdminSettingsApiBase } from "@/lib/adminSettingsApi";
import { SettingsBackHeader } from "../SettingsBackHeader";

type NavLinkItem = {
  id: string;
  name: string;
  href: string;
  hasMegaMenu: boolean;
};

const FALLBACK_LINKS: NavLinkItem[] = [
  { id: "woodcut", name: "Woodcut", href: "/", hasMegaMenu: false },
  { id: "linocut", name: "Linocut", href: "/", hasMegaMenu: false },
  {
    id: "paintings",
    name: "Paintings",
    href: "/",
    hasMegaMenu: false,
  },
  { id: "about", name: "About", href: "/", hasMegaMenu: false },
];

function toId(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminSettingsNavPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hideStoreNameUntilLoaded, setHideStoreNameUntilLoaded] =
    useState(true);
  const [navBrandDesktopMode, setNavBrandDesktopMode] = useState<
    "name" | "logo"
  >("name");
  const [navBrandMobileMode, setNavBrandMobileMode] = useState<"name" | "logo">(
    "name",
  );
  const [navLinks, setNavLinks] = useState<NavLinkItem[]>(FALLBACK_LINKS);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(`${getAdminSettingsApiBase()}/site`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as Record<string, unknown>;
        setHideStoreNameUntilLoaded(data.hideStoreNameUntilLoaded !== false);
        setNavBrandDesktopMode(
          data.navBrandDesktopMode === "logo" ? "logo" : "name",
        );
        setNavBrandMobileMode(
          data.navBrandMobileMode === "logo" ? "logo" : "name",
        );

        if (Array.isArray(data.navLinks) && data.navLinks.length > 0) {
          const normalized = data.navLinks
            .map((raw) => {
              const link = raw as Record<string, unknown>;
              const name = String(link.name || "").trim();
              const href = String(link.href || "").trim();
              if (!name || !href) return null;
              return {
                id: String(link.id || toId(name) || crypto.randomUUID()),
                name,
                href,
                hasMegaMenu: Boolean(link.hasMegaMenu),
              } as NavLinkItem;
            })
            .filter(Boolean) as NavLinkItem[];
          if (normalized.length > 0) setNavLinks(normalized);
        }
      } catch (error) {
        console.error("Erro ao carregar nav settings:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateLink = (index: number, patch: Partial<NavLinkItem>) => {
    setNavLinks((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              ...patch,
              id:
                patch.name !== undefined && !item.id
                  ? toId(patch.name) || crypto.randomUUID()
                  : item.id,
            }
          : item,
      ),
    );
  };

  const addLink = () => {
    setNavLinks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: "",
        href: "/",
        hasMegaMenu: false,
      },
    ]);
  };

  const removeLink = (index: number) => {
    setNavLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const save = async () => {
    const cleanedLinks = navLinks
      .map((item) => ({
        id: item.id || toId(item.name) || crypto.randomUUID(),
        name: item.name.trim(),
        href: item.href.trim(),
        hasMegaMenu: Boolean(item.hasMegaMenu),
      }))
      .filter((item) => item.name.length > 0 && item.href.length > 0);

    if (cleanedLinks.length === 0) {
      showMessage("error", "Adicione pelo menos 1 link válido.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`${getAdminSettingsApiBase()}/site`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hideStoreNameUntilLoaded,
          navBrandDesktopMode,
          navBrandMobileMode,
          navLinks: cleanedLinks,
        }),
      });
      if (!res.ok) {
        showMessage("error", "Erro ao salvar nav.");
        return;
      }
      setNavLinks(cleanedLinks);
      showMessage("success", "Configuração de navegação salva.");
    } catch (error) {
      console.error("Erro ao salvar nav settings:", error);
      showMessage("error", "Erro ao salvar nav.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex justify-start max-w-screen-2xl mx-auto max-lg:flex-col">
        <DashboardSidebar />
        <div className="flex-1 p-10 pb-admin-mobile-nav flex items-center justify-center text-gray-500">
          Carregando...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex justify-start max-w-screen-2xl mx-auto max-lg:flex-col">
      <DashboardSidebar />
      <div className="flex-1 p-10 max-md:p-4 pb-admin-mobile-nav animate-fade-in-up">
        <SettingsBackHeader
          title="Navegação (Nav)"
          description="Controle os links principais da navbar, ocultação de nome até carregar e modo de marca por dispositivo."
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

        <div className="bg-white border border-gray-100 rounded-2xl p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Exibição da marca no Desktop
              </label>
              <select
                value={navBrandDesktopMode}
                onChange={(e) =>
                  setNavBrandDesktopMode(
                    e.target.value === "logo" ? "logo" : "name",
                  )
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 bg-white"
              >
                <option value="name">Nome da loja</option>
                <option value="logo">Logo da loja</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Exibição da marca no Mobile
              </label>
              <select
                value={navBrandMobileMode}
                onChange={(e) =>
                  setNavBrandMobileMode(
                    e.target.value === "logo" ? "logo" : "name",
                  )
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 bg-white"
              >
                <option value="name">Nome da loja</option>
                <option value="logo">Logo da loja</option>
              </select>
            </div>
          </div>

          <label className="inline-flex items-center gap-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={hideStoreNameUntilLoaded}
              onChange={(e) => setHideStoreNameUntilLoaded(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-400"
            />
            Ocultar nome da loja até carregar as configurações
          </label>

          <div className="border-t border-gray-100 pt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900">
                Links da navbar
              </h3>
              <button
                type="button"
                onClick={addLink}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-[#E3E1D6]"
              >
                <FaPlus size={12} /> Adicionar link
              </button>
            </div>

            <div className="space-y-3">
              {navLinks.map((item, index) => (
                <div
                  key={item.id || `item-${index}`}
                  className="grid grid-cols-1 md:grid-cols-[1.2fr_1.8fr_auto_auto] gap-3 border border-gray-100 rounded-xl p-3"
                >
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) =>
                      updateLink(index, { name: e.target.value })
                    }
                    placeholder="Nome"
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  />
                  <input
                    type="text"
                    value={item.href}
                    onChange={(e) =>
                      updateLink(index, { href: e.target.value })
                    }
                    placeholder="/rota"
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  />
                  <label className="inline-flex items-center gap-2 px-2 text-xs text-gray-600">
                    <input
                      type="checkbox"
                      checked={item.hasMegaMenu}
                      onChange={(e) =>
                        updateLink(index, { hasMegaMenu: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-400"
                    />
                    Mega menu
                  </label>
                  <button
                    type="button"
                    onClick={() => removeLink(index)}
                    className="inline-flex items-center justify-center gap-1 px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    aria-label="Remover link"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => void save()}
            disabled={saving}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            <FaFloppyDisk size={14} />
            {saving ? "Salvando..." : "Salvar configurações"}
          </button>
        </div>
      </div>
    </div>
  );
}
