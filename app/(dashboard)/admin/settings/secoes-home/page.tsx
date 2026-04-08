"use client";

import React, { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components";
import { FaGripVertical, FaEye, FaEyeSlash } from "react-icons/fa6";
import { getAdminSettingsApiBase } from "@/lib/adminSettingsApi";
import { SECTION_LABELS, type HomeSection } from "../types";
import { SettingsBackHeader } from "../SettingsBackHeader";

export default function AdminSettingsSecoesHomePage() {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    void fetchSections();
  }, []);

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
        setDirty(false);
      }
    } catch (error) {
      console.error("Erro ao carregar seções:", error);
      showMessage("error", "Erro ao carregar seções");
    } finally {
      setLoading(false);
    }
  };

  const toggleSectionLocal = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
    );
    setDirty(true);
  };

  const saveSections = async () => {
    try {
      setSaving(true);
      const res = await fetch(
        `${getAdminSettingsApiBase()}/home-sections/order`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sections: sections.map((s) => ({
              id: s.id,
              order: s.order,
              enabled: s.enabled,
            })),
          }),
        },
      );

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(
          typeof err.message === "string"
            ? err.message
            : `Erro HTTP ${res.status}`,
        );
      }

      const updated = (await res.json()) as HomeSection[];
      setSections(updated);
      setDirty(false);
      showMessage(
        "success",
        "Alterações salvas. A home já reflete visibilidade e ordem.",
      );
    } catch (error) {
      console.error("Erro ao salvar seções:", error);
      showMessage(
        "error",
        error instanceof Error ? error.message : "Erro ao salvar alterações",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: string) => {
    if (!draggedItem || draggedItem === targetId) return;

    const draggedIndex = sections.findIndex((s) => s.id === draggedItem);
    const targetIndex = sections.findIndex((s) => s.id === targetId);

    const newSections = [...sections];
    [newSections[draggedIndex], newSections[targetIndex]] = [
      newSections[targetIndex],
      newSections[draggedIndex],
    ];

    newSections.forEach((s, idx) => {
      s.order = idx;
    });

    setSections(newSections);
    setDraggedItem(null);
    setDirty(true);
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-2">
          <SettingsBackHeader
            title="Seções da home"
            description="Arraste para reordenar. Use o ícone de olho para definir visibilidade. Clique em Salvar alterações para aplicar na loja — até salvar, as mudanças ficam só nesta tela. O conteúdo de cada bloco é editado nas telas correspondentes em Configurações. “Próximos eventos” fica em Configurações → Próximos eventos (acima do rodapé)."
            className="flex-1 mb-0"
          />
          <button
            type="button"
            disabled={!dirty || saving}
            onClick={() => void saveSections()}
            className="shrink-0 rounded-xl bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Salvando…" : "Salvar alterações"}
          </button>
        </div>

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
            Arraste para reordenar (inclui o slide promocional abaixo do hero).
            Ajuste os olhos e use{" "}
            <strong className="font-medium text-gray-700">
              Salvar alterações
            </strong>{" "}
            para gravar ordem e visibilidade no banco.
          </p>

          <div className="space-y-3">
            {sections.length === 0 && (
              <p className="text-sm text-gray-500 py-6 text-center border border-dashed border-gray-200 rounded-lg">
                Nenhuma seção carregada. Recarregue a página ou verifique se a
                API está acessível.
              </p>
            )}
            {sections.map((section) => (
              <div
                key={section.id}
                draggable
                onDragStart={() => handleDragStart(section.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(section.id)}
                className={`flex items-center gap-4 p-4 border border-gray-200 rounded-lg cursor-move hover:bg-[#E3E1D6] transition-colors ${
                  draggedItem === section.id ? "opacity-50 bg-[#E3E1D6]" : ""
                }`}
              >
                <FaGripVertical
                  size={16}
                  className="text-gray-400 flex-shrink-0"
                />

                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {SECTION_LABELS[section.name] ?? section.name}
                  </p>
                  <p className="text-xs text-gray-400 font-mono">
                    {section.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Ordem: {section.order + 1}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleSectionLocal(section.id)}
                  className={`p-2 rounded-lg flex items-center justify-center transition-colors ${
                    section.enabled
                      ? "bg-green-50 text-green-600 hover:bg-green-100"
                      : "bg-red-50 text-red-600 hover:bg-red-100"
                  }`}
                >
                  {section.enabled ? (
                    <FaEye size={16} />
                  ) : (
                    <FaEyeSlash size={16} />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
