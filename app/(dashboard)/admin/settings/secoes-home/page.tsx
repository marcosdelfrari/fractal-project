"use client";

import React, { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components";
import { FaGripVertical, FaEye, FaEyeSlash } from "react-icons/fa6";
import { getExpressApiBase } from "@/lib/expressApi";
import { SECTION_LABELS, type HomeSection } from "../types";
import { SettingsBackHeader } from "../SettingsBackHeader";

export default function AdminSettingsSecoesHomePage() {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
      const res = await fetch(`${getExpressApiBase()}/settings/home-sections`);
      if (res.ok) {
        setSections(await res.json());
      }
    } catch (error) {
      console.error("Erro ao carregar seções:", error);
      showMessage("error", "Erro ao carregar seções");
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = async (id: string) => {
    try {
      const res = await fetch(`${getExpressApiBase()}/settings/home-sections/${id}/toggle`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const updatedSection = await res.json();
        setSections((prev) =>
          prev.map((s) => (s.id === id ? updatedSection : s))
        );
      }
    } catch (error) {
      console.error("Erro ao toggle section:", error);
    }
  };

  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const saveOrder = async (updatedSections: HomeSection[]) => {
    try {
      await fetch(`${getExpressApiBase()}/settings/home-sections/order`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sections: updatedSections.map((s) => ({ id: s.id, order: s.order })),
        }),
      });
      showMessage("success", "Ordem das seções atualizada!");
    } catch (error) {
      console.error("Erro ao salvar ordem:", error);
      showMessage("error", "Erro ao salvar ordem");
    }
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

    void saveOrder(newSections);
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex justify-start max-w-screen-2xl mx-auto max-xl:flex-col">
        <DashboardSidebar />
        <div className="flex-1 p-10 flex items-center justify-center">
          <p className="text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex justify-start max-w-screen-2xl mx-auto max-xl:flex-col">
      <DashboardSidebar />
      <div className="flex-1 p-10 max-md:p-4 animate-fade-in-up">
        <SettingsBackHeader
          title="Seções da home"
          description="Arraste para reordenar. Use o ícone de olho para ativar ou desativar cada bloco na página inicial."
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
            Arraste para reordenar as seções. Clique no ícone de olho para ativar ou
            desativar.
          </p>

          <div className="space-y-3">
            {sections.length === 0 && (
              <p className="text-sm text-gray-500 py-6 text-center border border-dashed border-gray-200 rounded-lg">
                Nenhuma seção carregada. Recarregue a página ou verifique se a API
                está acessível.
              </p>
            )}
            {sections.map((section) => (
              <div
                key={section.id}
                draggable
                onDragStart={() => handleDragStart(section.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(section.id)}
                className={`flex items-center gap-4 p-4 border border-gray-200 rounded-lg cursor-move hover:bg-gray-50 transition-colors ${
                  draggedItem === section.id ? "opacity-50 bg-gray-50" : ""
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
                  <p className="text-xs text-gray-400 font-mono">{section.name}</p>
                  <p className="text-xs text-gray-500">
                    Ordem: {section.order + 1}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void toggleSection(section.id)}
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
