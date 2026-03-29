"use client";

import React, { useState, useEffect, useRef } from "react";
import { DashboardSidebar } from "@/components";
import { FaFloppyDisk, FaPlus, FaTrash } from "react-icons/fa6";
import { getExpressApiBase, uploadSectionImage } from "@/lib/expressApi";
import {
  getCategoryMenuFullConfig,
  type CategoryMenuItem,
} from "@/lib/sectionContent";
import { SettingsBackHeader } from "../SettingsBackHeader";

type Row = CategoryMenuItem;

export default function AdminSettingsMenuCategoriasPage() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [title, setTitle] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const load = async () => {
    try {
      setLoading(true);
      const secRes = await fetch(`${getExpressApiBase()}/settings/home-sections`);
      const sectionsData: { name: string; content?: unknown }[] = secRes.ok
        ? await secRes.json()
        : [];

      const catSec = sectionsData.find((s) => s.name === "categoryMenu");
      if (catSec) {
        const full = getCategoryMenuFullConfig(catSec.content);
        setTitle(full.title);
        setRows(full.items);
      } else {
        setTitle("Categorias");
        setRows([]);
      }
    } catch (error) {
      console.error(error);
      showMessage("error", "Erro ao carregar configuração");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const updateRow = (id: string, patch: Partial<Row>) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    );
  };

  const moveRow = (index: number, delta: -1 | 1) => {
    setRows((prev) => {
      const j = index + delta;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  };

  const addRow = () => {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `menu-${Date.now()}`;
    setRows((prev) => [
      ...prev,
      {
        id,
        label: "",
        href: "/shop/",
        enabled: true,
        image: "",
      },
    ]);
  };

  const removeRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const onImageSelected = async (id: string, file: File | null) => {
    if (!file) return;
    try {
      setUploadingId(id);
      const url = await uploadSectionImage(file);
      updateRow(id, { image: url });
      showMessage("success", "Imagem enviada. Salve para aplicar na home.");
    } catch (e) {
      console.error(e);
      showMessage("error", e instanceof Error ? e.message : "Erro ao enviar");
    } finally {
      setUploadingId(null);
    }
  };

  const saveCategoryMenuContent = async () => {
    try {
      setSaving(true);
      const res = await fetch(`${getExpressApiBase()}/settings/home-sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "categoryMenu",
          content: {
            title: title.trim() || "Categorias",
            items: rows.map((r) => ({
              id: r.id,
              label: r.label.trim(),
              href: r.href.trim(),
              enabled: r.enabled,
              image: r.image.trim(),
            })),
          },
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
      showMessage("success", "Menu salvo.");
    } catch (error) {
      console.error(error);
      showMessage("error", "Erro ao salvar");
    } finally {
      setSaving(false);
    }
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
          title="Menu de categorias (home)"
          description="Cards independentes do cadastro de categorias de produto. Cada linha: título no card, link (ex.: /shop/smart-phones ou só smart-phones), imagem e se aparece na home."
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

        <div className="bg-white border border-gray-100 rounded-2xl p-8 max-w-4xl space-y-8">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Título do bloco
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-sm font-medium text-gray-900">Cards do carrossel</h3>
            <button
              type="button"
              onClick={addRow}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FaPlus size={14} />
              Adicionar card
            </button>
          </div>

          {rows.length === 0 ? (
            <p className="text-sm text-gray-600 border border-dashed border-gray-200 rounded-lg px-4 py-6 text-center">
              Nenhum card ainda. Use &quot;Adicionar card&quot; para criar entradas só para esta seção.
            </p>
          ) : (
            <div className="space-y-6">
              {rows.map((row, index) => (
                <div
                  key={row.id}
                  className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-400 w-6">{index + 1}.</span>
                      <span className="flex gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveRow(index, -1)}
                          className="text-[11px] px-2 py-1 border border-gray-200 rounded disabled:opacity-40 hover:bg-white"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          disabled={index === rows.length - 1}
                          onClick={() => moveRow(index, 1)}
                          className="text-[11px] px-2 py-1 border border-gray-200 rounded disabled:opacity-40 hover:bg-white"
                        >
                          ↓
                        </button>
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={row.enabled}
                          onChange={(e) =>
                            updateRow(row.id, { enabled: e.target.checked })
                          }
                          className="rounded border-gray-300"
                        />
                        Exibir na home
                      </label>
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        aria-label="Remover card"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Título no card
                      </label>
                      <input
                        type="text"
                        value={row.label}
                        onChange={(e) =>
                          updateRow(row.id, { label: e.target.value })
                        }
                        placeholder="Ex.: Smartphones"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Link
                      </label>
                      <input
                        type="text"
                        value={row.href}
                        onChange={(e) =>
                          updateRow(row.id, { href: e.target.value })
                        }
                        placeholder="/shop/smart-phones ou smart-phones"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white font-mono"
                      />
                      <p className="text-[10px] text-gray-500 mt-1">
                        Caminho completo ou slug (vira /shop/slug). URLs http(s) abrem em nova aba.
                      </p>
                    </div>
                  </div>

                  <input
                    ref={(el) => {
                      fileRefs.current[row.id] = el;
                    }}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      void onImageSelected(row.id, f ?? null);
                      e.target.value = "";
                    }}
                  />
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <div className="w-full max-w-[160px] aspect-[3/4] border border-gray-200 rounded-lg bg-white overflow-hidden flex items-center justify-center">
                      {row.image ? (
                        <img
                          src={row.image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] text-gray-400 px-2 text-center">
                          Sem imagem
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={uploadingId === row.id}
                      onClick={() => fileRefs.current[row.id]?.click()}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50"
                    >
                      {uploadingId === row.id ? "Enviando…" : "Enviar imagem"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => void saveCategoryMenuContent()}
            disabled={saving}
            className="px-5 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
          >
            <FaFloppyDisk size={14} />
            {saving ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
