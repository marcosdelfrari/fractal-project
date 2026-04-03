"use client";

import React, { useState, useEffect, useRef } from "react";
import { DashboardSidebar } from "@/components";
import { FaFloppyDisk, FaPlus, FaTrash } from "react-icons/fa6";
import {
  getAdminSettingsApiBase,
  uploadSectionImage,
} from "@/lib/adminSettingsApi";
import {
  getPromoSliderConfig,
  type PromoSliderSlide,
} from "@/lib/sectionContent";
import type { HomeSection } from "../types";
import { SettingsBackHeader } from "../SettingsBackHeader";

function newSlide(partial?: Partial<PromoSliderSlide>): PromoSliderSlide {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `slide-${Date.now()}`,
    line1: partial?.line1 ?? "Linha 1",
    line2: partial?.line2 ?? "Linha 2",
    buttonLabel: partial?.buttonLabel ?? "Ver loja",
    buttonHref: partial?.buttonHref ?? "/loja",
    centerImage: partial?.centerImage ?? "",
  };
}

export default function AdminSettingsPromoSliderPage() {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [slides, setSlides] = useState<PromoSliderSlide[]>(() => {
    const initial = getPromoSliderConfig(undefined).slides;
    return initial.length ? initial : [newSlide()];
  });
  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    void fetchSections();
  }, []);

  useEffect(() => {
    const row = sections.find((s) => s.name === "promoSlider");
    if (row) {
      const cfg = getPromoSliderConfig(row.content);
      setSlides(cfg.slides.length ? cfg.slides : [newSlide()]);
    }
  }, [sections]);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
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

  const onCenterImageSelected = async (index: number, file: File | null) => {
    if (!file) return;
    try {
      setUploadingIndex(index);
      const url = await uploadSectionImage(file);
      setSlides((prev) =>
        prev.map((s, i) => (i === index ? { ...s, centerImage: url } : s)),
      );
      showMessage("success", "Imagem enviada. Salve para persistir no banco.");
    } catch (e) {
      console.error(e);
      showMessage(
        "error",
        e instanceof Error ? e.message : "Erro ao enviar imagem",
      );
    } finally {
      setUploadingIndex(null);
    }
  };

  const save = async () => {
    const cleaned = slides
      .map((s) => ({
        ...s,
        line1: s.line1.trim(),
        line2: s.line2.trim(),
        buttonLabel: s.buttonLabel.trim(),
        buttonHref: s.buttonHref.trim() || "/loja",
        centerImage: s.centerImage.trim(),
      }))
      .filter((s) => s.line1 || s.line2);

    if (cleaned.length === 0) {
      showMessage(
        "error",
        "Informe pelo menos texto na linha 1 ou 2 em um slide.",
      );
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`${getAdminSettingsApiBase()}/home-sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "promoSlider",
          content: { slides: cleaned },
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
        prev.map((s) => (s.name === "promoSlider" ? data : s)),
      );
      showMessage("success", "Slide promocional salvo.");
    } catch (error) {
      console.error(error);
      showMessage("error", "Erro ao salvar");
    } finally {
      setSaving(false);
    }
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
          title="Slide promocional"
          description="Faixa vinho e amarelo (abaixo do hero). Cada slide tem duas linhas de texto, botão com link e imagem no quadro central cinza. A ordem na home é definida em Seções da home."
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

        <div className="space-y-8 max-w-3xl">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-gray-900">
                  Slide {index + 1}
                </p>
                <button
                  type="button"
                  disabled={slides.length <= 1}
                  onClick={() =>
                    setSlides((prev) => prev.filter((_, i) => i !== index))
                  }
                  className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 disabled:opacity-30 disabled:pointer-events-none"
                >
                  <FaTrash size={12} />
                  Remover
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Texto — linha 1
                  </label>
                  <input
                    type="text"
                    value={slide.line1}
                    onChange={(e) =>
                      setSlides((prev) =>
                        prev.map((s, i) =>
                          i === index ? { ...s, line1: e.target.value } : s,
                        ),
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Texto — linha 2
                  </label>
                  <input
                    type="text"
                    value={slide.line2}
                    onChange={(e) =>
                      setSlides((prev) =>
                        prev.map((s, i) =>
                          i === index ? { ...s, line2: e.target.value } : s,
                        ),
                      )
                    }
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
                    value={slide.buttonLabel}
                    onChange={(e) =>
                      setSlides((prev) =>
                        prev.map((s, i) =>
                          i === index
                            ? { ...s, buttonLabel: e.target.value }
                            : s,
                        ),
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Link do botão
                  </label>
                  <input
                    type="text"
                    value={slide.buttonHref}
                    onChange={(e) =>
                      setSlides((prev) =>
                        prev.map((s, i) =>
                          i === index
                            ? { ...s, buttonHref: e.target.value }
                            : s,
                        ),
                      )
                    }
                    placeholder="/loja"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Imagem do quadro central (cinza)
                </label>
                <input
                  ref={(el) => {
                    fileRefs.current[slide.id] = el;
                  }}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    void onCenterImageSelected(index, f ?? null);
                    e.target.value = "";
                  }}
                />
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="w-full max-w-[200px] aspect-square border border-gray-200 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center">
                    {slide.centerImage ? (
                      <img
                        src={slide.centerImage}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[11px] text-gray-400 px-2 text-center">
                        Sem imagem
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={uploadingIndex === index}
                    onClick={() => fileRefs.current[slide.id]?.click()}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-[#E3E1D6] disabled:opacity-50"
                  >
                    {uploadingIndex === index ? "Enviando…" : "Enviar imagem"}
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setSlides((prev) => [...prev, newSlide()])}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-dashed border-gray-300 rounded-xl text-gray-700 hover:bg-[#E3E1D6] w-full justify-center"
          >
            <FaPlus size={14} />
            Adicionar slide
          </button>

          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="px-5 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
          >
            <FaFloppyDisk size={14} />
            {saving ? "Salvando…" : "Salvar slide promocional"}
          </button>
        </div>
      </div>
    </div>
  );
}
