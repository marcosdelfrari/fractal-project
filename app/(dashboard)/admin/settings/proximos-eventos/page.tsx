"use client";

import React, { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components";
import { FaFloppyDisk, FaPlus, FaTrash } from "react-icons/fa6";
import { getAdminSettingsApiBase } from "@/lib/adminSettingsApi";
import {
  getUpcomingEventsConfig,
  type UpcomingEventRow,
} from "@/lib/sectionContent";
import type { SiteSettings } from "../types";
import { SettingsBackHeader } from "../SettingsBackHeader";

function newEventRow(partial?: Partial<UpcomingEventRow>): UpcomingEventRow {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `ue-${Date.now()}`,
    title: partial?.title ?? "",
    date: partial?.date ?? "",
    location: partial?.location ?? "",
  };
}

export default function AdminSettingsProximosEventosPage() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [line1, setLine1] = useState("Próximos");
  const [line2, setLine2] = useState("Eventos");
  const [arrowHref, setArrowHref] = useState("/loja");
  const [events, setEvents] = useState<UpcomingEventRow[]>(() => {
    const initial = getUpcomingEventsConfig(undefined).events;
    return initial.length ? initial : [newEventRow()];
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void fetchSettings();
  }, []);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${getAdminSettingsApiBase()}/site`);
      if (res.ok) {
        const data = (await res.json()) as SiteSettings;
        const cfg = getUpcomingEventsConfig(data.upcomingEvents);
        setEnabled(cfg.enabled);
        setLine1(cfg.line1);
        setLine2(cfg.line2);
        setArrowHref(cfg.arrowHref);
        setEvents(cfg.events.length ? cfg.events : [newEventRow()]);
      }
    } catch (error) {
      console.error("Erro ao carregar settings:", error);
      showMessage("error", "Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    const cleaned = events
      .map((e) => ({
        ...e,
        title: e.title.trim(),
        date: e.date.trim(),
        location: e.location.trim(),
      }))
      .filter((e) => e.title || e.date || e.location);

    if (cleaned.length === 0) {
      showMessage(
        "error",
        "Inclua pelo menos um evento com algum campo preenchido.",
      );
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`${getAdminSettingsApiBase()}/site`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          upcomingEvents: {
            enabled,
            line1: line1.trim() || "Próximos",
            line2: line2.trim() || "Eventos",
            arrowHref: arrowHref.trim() || "/loja",
            events: cleaned,
          },
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showMessage(
          "error",
          typeof (data as { error?: string }).error === "string"
            ? (data as { error: string }).error
            : "Erro ao salvar",
        );
        return;
      }
      showMessage("success", "Próximos eventos salvos.");
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
          title="Próximos eventos"
          description="Faixa amarela fixa na home, acima do rodapé (fora da moldura preta). Os dados ficam aqui; a ordem das outras seções em “Seções da home” não afeta este bloco."
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
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm text-gray-900">
              Exibir faixa na página inicial
            </span>
          </label>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
            <p className="text-sm font-medium text-gray-900">
              Título (duas linhas)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Linha 1
                </label>
                <input
                  type="text"
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Linha 2
                </label>
                <input
                  type="text"
                  value={line2}
                  onChange={(e) => setLine2(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Link do botão circular (seta)
              </label>
              <input
                type="text"
                value={arrowHref}
                onChange={(e) => setArrowHref(e.target.value)}
                placeholder="/loja"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 font-mono text-sm"
              />
            </div>
          </div>

          {events.map((ev, index) => (
            <div
              key={ev.id}
              className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-gray-900">
                  Evento {index + 1}
                </p>
                <button
                  type="button"
                  disabled={events.length <= 1}
                  onClick={() =>
                    setEvents((prev) => prev.filter((_, i) => i !== index))
                  }
                  className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 disabled:opacity-30 disabled:pointer-events-none"
                >
                  <FaTrash size={12} />
                  Remover
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Nome do evento
                  </label>
                  <input
                    type="text"
                    value={ev.title}
                    onChange={(e) =>
                      setEvents((prev) =>
                        prev.map((row, i) =>
                          i === index ? { ...row, title: e.target.value } : row,
                        ),
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Data
                  </label>
                  <input
                    type="text"
                    value={ev.date}
                    onChange={(e) =>
                      setEvents((prev) =>
                        prev.map((row, i) =>
                          i === index ? { ...row, date: e.target.value } : row,
                        ),
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Local
                  </label>
                  <input
                    type="text"
                    value={ev.location}
                    onChange={(e) =>
                      setEvents((prev) =>
                        prev.map((row, i) =>
                          i === index
                            ? { ...row, location: e.target.value }
                            : row,
                        ),
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setEvents((prev) => [...prev, newEventRow()])}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-dashed border-gray-300 rounded-xl text-gray-700 hover:bg-[#E3E1D6] w-full justify-center"
          >
            <FaPlus size={14} />
            Adicionar evento
          </button>

          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="px-5 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
          >
            <FaFloppyDisk size={14} />
            {saving ? "Salvando…" : "Salvar próximos eventos"}
          </button>
        </div>
      </div>
    </div>
  );
}
