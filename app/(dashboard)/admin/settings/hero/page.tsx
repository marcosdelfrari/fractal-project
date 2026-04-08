"use client";

import React, { useState, useEffect, useRef } from "react";
import { DashboardSidebar } from "@/components";
import { FaFloppyDisk } from "react-icons/fa6";
import {
  getAdminSettingsApiBase,
  uploadSectionImage,
} from "@/lib/adminSettingsApi";
import { getHeroConfig, type HeroSectionContent } from "@/lib/sectionContent";
import type { HomeSection } from "../types";
import { SettingsBackHeader } from "../SettingsBackHeader";

export default function AdminSettingsHeroPage() {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [form, setForm] = useState<HeroSectionContent>(() =>
    getHeroConfig(undefined),
  );
  const [saving, setSaving] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const bgFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void fetchSections();
  }, []);

  useEffect(() => {
    const row = sections.find((s) => s.name === "hero");
    if (row) {
      setForm(getHeroConfig(row.content));
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

  const onBackgroundSelected = async (file: File | null) => {
    if (!file) return;
    try {
      setUploadingBg(true);
      const url = await uploadSectionImage(file);
      setForm((f) => ({ ...f, backgroundImage: url }));
      showMessage(
        "success",
        "Imagem de fundo enviada. Salve para persistir no banco.",
      );
    } catch (e) {
      console.error(e);
      showMessage(
        "error",
        e instanceof Error ? e.message : "Erro ao enviar imagem",
      );
    } finally {
      setUploadingBg(false);
    }
  };

  const saveHero = async () => {
    if (!form.backgroundImage.trim()) {
      showMessage("error", "Envie uma imagem de fundo para o banner.");
      return;
    }
    const content: HeroSectionContent = {
      backgroundImage: form.backgroundImage.trim(),
      titlePrefix: form.titlePrefix.trim(),
      titleSuffix: form.titleSuffix.trim(),
      ctaLabel: form.ctaLabel.trim(),
      ctaHref: form.ctaHref.trim() || "/",
    };

    try {
      setSaving(true);
      const res = await fetch(`${getAdminSettingsApiBase()}/home-sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "hero",
          content,
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
      setSections((prev) => prev.map((s) => (s.name === "hero" ? data : s)));
      showMessage("success", "Hero da home salvo.");
    } catch (error) {
      console.error(error);
      showMessage("error", "Erro ao salvar hero");
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
          title="Hero (banner principal)"
          description="Imagem em tela cheia, título em duas partes (prefixo visível em telas grandes) e botão com link. Imagem apenas por upload."
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

        <div className="bg-white border border-gray-100 rounded-2xl p-8 max-w-3xl space-y-8">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Imagem de fundo (banner)
            </label>
            <input
              ref={bgFileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                void onBackgroundSelected(f ?? null);
                e.target.value = "";
              }}
            />
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="w-full max-w-md aspect-[21/9] border border-gray-200 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
                {form.backgroundImage ? (
                  <img
                    src={form.backgroundImage}
                    alt="Prévia do hero"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[11px] text-gray-400 px-2 text-center">
                    Nenhuma imagem
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={uploadingBg}
                  onClick={() => bgFileRef.current?.click()}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-[#E3E1D6] disabled:opacity-50"
                >
                  {uploadingBg ? "Enviando…" : "Enviar imagem"}
                </button>
                <p className="text-[11px] text-gray-500 max-w-sm">
                  Recomendado: imagem larga (ex.: 1920×1080 ou similar), WebP ou
                  JPG.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Título — parte 1 (só em telas grandes)
              </label>
              <input
                type="text"
                value={form.titlePrefix}
                onChange={(e) =>
                  setForm((f) => ({ ...f, titlePrefix: e.target.value }))
                }
                placeholder="Art That"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Título — parte 2 (sempre visível)
              </label>
              <input
                type="text"
                value={form.titleSuffix}
                onChange={(e) =>
                  setForm((f) => ({ ...f, titleSuffix: e.target.value }))
                }
                placeholder="Inspires"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Texto do botão
              </label>
              <input
                type="text"
                value={form.ctaLabel}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ctaLabel: e.target.value }))
                }
                placeholder="View Collection"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Link do botão (caminho ou URL)
              </label>
              <input
                type="text"
                value={form.ctaHref}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ctaHref: e.target.value }))
                }
                placeholder="/categories"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 font-mono text-sm"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => void saveHero()}
            disabled={saving}
            className="px-5 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
          >
            <FaFloppyDisk size={14} />
            {saving ? "Salvando…" : "Salvar hero"}
          </button>
        </div>
      </div>
    </div>
  );
}
