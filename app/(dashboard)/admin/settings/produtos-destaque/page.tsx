"use client";

import React, { useState, useEffect, useRef } from "react";
import { DashboardSidebar } from "@/components";
import { FaFloppyDisk, FaPlus, FaTrash } from "react-icons/fa6";
import { getAdminSettingsApiBase, uploadSectionImage } from "@/lib/adminSettingsApi";
import {
  getFeaturedProductsFromContent,
  type FeaturedProductSlide,
} from "@/lib/sectionContent";
import type { HomeSection } from "../types";
import { SettingsBackHeader } from "../SettingsBackHeader";

export default function AdminSettingsProdutosDestaquePage() {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [featuredItems, setFeaturedItems] = useState<FeaturedProductSlide[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const lifestyleRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const productRefs = useRef<Record<number, HTMLInputElement | null>>({});

  useEffect(() => {
    void fetchSections();
  }, []);

  useEffect(() => {
    const feat = sections.find((s) => s.name === "featuredProducts");
    if (feat) {
      setFeaturedItems(getFeaturedProductsFromContent(feat.content));
    }
  }, [sections]);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const fetchSections = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${getAdminSettingsApiBase()}/home-sections`);
      if (res.ok) {
        setSections(await res.json());
      }
    } catch (error) {
      console.error("Erro ao carregar seções:", error);
      showMessage("error", "Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  };

  const saveFeaturedProductsContent = async () => {
    if (featuredItems.length === 0) {
      showMessage("error", "Adicione pelo menos um slide.");
      return;
    }
    for (const item of featuredItems) {
      if (!item.lifestyleImage?.trim() || !item.productImage?.trim()) {
        showMessage(
          "error",
          "Cada slide precisa das duas imagens (lifestyle e produto), enviadas por upload.",
        );
        return;
      }
    }
    try {
      setSaving(true);
      const res = await fetch(`${getAdminSettingsApiBase()}/home-sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "featuredProducts",
          content: { items: featuredItems },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showMessage(
          "error",
          typeof data.error === "string" ? data.error : "Erro ao salvar",
        );
        return;
      }
      setSections((prev) =>
        prev.map((s) => (s.name === "featuredProducts" ? data : s)),
      );
      showMessage("success", "Slides de produtos em destaque salvos.");
    } catch (error) {
      console.error(error);
      showMessage("error", "Erro ao salvar produtos em destaque");
    } finally {
      setSaving(false);
    }
  };

  const updateFeaturedItem = (
    index: number,
    field: "id" | "title" | "category",
    value: string,
  ) => {
    setFeaturedItems((prev) => {
      const next = [...prev];
      const row = { ...next[index] };
      if (field === "id") {
        const n = parseInt(value, 10);
        row.id = Number.isFinite(n) ? n : row.id;
      } else if (field === "title") {
        row.title = value;
      } else if (field === "category") {
        row.category = value;
      }
      next[index] = row;
      return next;
    });
  };

  const setSlideImage = async (
    index: number,
    field: "lifestyleImage" | "productImage",
    file: File | null,
  ) => {
    if (!file) return;
    const key = `${index}-${field}`;
    try {
      setUploadingKey(key);
      const url = await uploadSectionImage(file);
      setFeaturedItems((prev) => {
        const next = [...prev];
        const row = { ...next[index], [field]: url };
        next[index] = row;
        return next;
      });
      showMessage("success", "Imagem enviada.");
    } catch (e) {
      console.error(e);
      showMessage("error", e instanceof Error ? e.message : "Erro ao enviar imagem");
    } finally {
      setUploadingKey(null);
    }
  };

  const removeFeaturedItem = (index: number) => {
    setFeaturedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const addFeaturedItem = () => {
    setFeaturedItems((prev) => {
      const nextId =
        prev.length === 0
          ? 1
          : Math.max(...prev.map((i) => i.id)) + 1;
      return [
        ...prev,
        {
          id: nextId,
          lifestyleImage: "",
          productImage: "",
          title: "Novo produto",
          category: "CATEGORIA",
        },
      ];
    });
  };

  if (loading) {
    return (
      <div className="bg-[#E3E1D6] min-h-screen flex justify-start max-w-screen-2xl mx-auto max-lg:flex-col">
        <DashboardSidebar />
        <div className="flex-1 p-10 flex items-center justify-center">
          <p className="text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#E3E1D6] min-h-screen flex justify-start max-w-screen-2xl mx-auto max-lg:flex-col">
      <DashboardSidebar />
      <div className="flex-1 p-10 max-md:p-4 animate-fade-in-up">
        <SettingsBackHeader
          title="Produtos em destaque (home)"
          description="Imagens apenas por upload (lifestyle e produto por slide). Textos podem ser editados abaixo."
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
          <p className="text-xs text-gray-500 mb-6">
            Cada slide: duas imagens obrigatórias (envio de arquivo), título e rótulo de categoria.
          </p>

          <div className="space-y-6">
            {featuredItems.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="p-4 border border-gray-200 rounded-xl bg-[#E3E1D6]/50 space-y-3"
              >
                <div className="flex justify-between items-center gap-2">
                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Slide {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFeaturedItem(index)}
                    className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 text-sm flex items-center gap-1"
                    aria-label="Remover slide"
                  >
                    <FaTrash size={14} />
                    Remover
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] text-gray-600 mb-2">
                      Imagem lifestyle
                    </label>
                    <input
                      ref={(el) => {
                        lifestyleRefs.current[index] = el;
                      }}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        void setSlideImage(index, "lifestyleImage", f ?? null);
                        e.target.value = "";
                      }}
                    />
                    <div className="flex gap-3 items-start">
                      <div className="w-full max-w-[180px] h-28 border border-gray-200 rounded-lg bg-white overflow-hidden flex items-center justify-center">
                        {item.lifestyleImage ? (
                          <img
                            src={item.lifestyleImage}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[10px] text-gray-400 px-1 text-center">
                            sem imagem
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        disabled={uploadingKey === `${index}-lifestyleImage`}
                        onClick={() => lifestyleRefs.current[index]?.click()}
                        className="px-3 py-2 text-xs border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50"
                      >
                        {uploadingKey === `${index}-lifestyleImage`
                          ? "Enviando…"
                          : "Enviar"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-600 mb-2">
                      Imagem do produto
                    </label>
                    <input
                      ref={(el) => {
                        productRefs.current[index] = el;
                      }}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        void setSlideImage(index, "productImage", f ?? null);
                        e.target.value = "";
                      }}
                    />
                    <div className="flex gap-3 items-start">
                      <div className="w-full max-w-[180px] h-28 border border-gray-200 rounded-lg bg-white overflow-hidden flex items-center justify-center">
                        {item.productImage ? (
                          <img
                            src={item.productImage}
                            alt=""
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-[10px] text-gray-400 px-1 text-center">
                            sem imagem
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        disabled={uploadingKey === `${index}-productImage`}
                        onClick={() => productRefs.current[index]?.click()}
                        className="px-3 py-2 text-xs border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50"
                      >
                        {uploadingKey === `${index}-productImage`
                          ? "Enviando…"
                          : "Enviar"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 border-t border-gray-200">
                  <div>
                    <label className="block text-[11px] text-gray-600 mb-1">
                      ID (número)
                    </label>
                    <input
                      type="number"
                      value={item.id}
                      onChange={(e) =>
                        updateFeaturedItem(index, "id", e.target.value)
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-2">
                    <label className="block text-[11px] text-gray-600 mb-1">
                      Título do produto
                    </label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) =>
                        updateFeaturedItem(index, "title", e.target.value)
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="block text-[11px] text-gray-600 mb-1">
                      Categoria (rótulo)
                    </label>
                    <input
                      type="text"
                      value={item.category}
                      onChange={(e) =>
                        updateFeaturedItem(index, "category", e.target.value)
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addFeaturedItem}
            className="mt-4 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 hover:bg-[#E3E1D6] flex items-center gap-2"
          >
            <FaPlus size={14} />
            Adicionar slide
          </button>

          <button
            type="button"
            onClick={() => void saveFeaturedProductsContent()}
            disabled={saving || featuredItems.length === 0}
            className="mt-4 ml-0 sm:ml-3 px-5 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
          >
            <FaFloppyDisk size={14} />
            {saving ? "Salvando…" : "Salvar slides"}
          </button>
        </div>
      </div>
    </div>
  );
}
