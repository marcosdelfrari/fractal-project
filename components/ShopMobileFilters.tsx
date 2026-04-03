"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import apiClient from "@/lib/api";
import Filters from "./Filters";
import SortBy from "./SortBy";

/** Sliders horizontais (estilo Lucide) — leitura clara de “ajustar filtros”. */
function FilterSlidersIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchFieldIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M20 20l-3.5-3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function countFilterBadge(sp: URLSearchParams): number {
  let n = 0;
  const price = Number(sp.get("price") ?? "3000");
  if (!Number.isNaN(price) && price < 3000) n++;
  return n;
}

type ShopMobileFiltersProps = {
  title: string;
};

const ShopMobileFilters = ({ title }: ShopMobileFiltersProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(
    () => searchParams.get("q") ?? "",
  );

  const badgeCount = useMemo(
    () => countFilterBadge(searchParams),
    [searchParams],
  );

  useEffect(() => {
    setSearchValue(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .get("/api/categories")
      .then((res) => {
        if (!res.ok || cancelled) return;
        return res.json();
      })
      .then((data: Category[] | undefined) => {
        if (!cancelled && Array.isArray(data)) setCategories(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      const sp = new URLSearchParams(window.location.search);
      const current = sp.get("q") ?? "";
      const next = searchValue.trim();
      if (next === current) return;
      if (next) sp.set("q", next);
      else sp.delete("q");
      sp.set("page", "1");
      const qs = sp.toString();
      const href = qs ? `${pathname}?${qs}` : pathname;
      router.replace(href, { scroll: false });
      router.refresh();
    }, 350);
    return () => window.clearTimeout(t);
  }, [searchValue, pathname, router]);

  const currentCategorySlug = useMemo(() => {
    const parts = pathname.replace(/^\/+|\/+$/g, "").split("/");
    if (parts[0] === "loja" && parts[1]) return decodeURIComponent(parts[1]);
    return null;
  }, [pathname]);

  const pathWithCurrentQuery = useMemo(() => {
    const qs = searchParams.toString();
    return (path: string) => (qs ? `${path}?${qs}` : path);
  }, [searchParams]);

  return (
    <div className="mb-4 md:hidden space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold leading-tight tracking-tight text-zinc-900">
          {title}
        </h1>
      </div>

      <div className="group flex min-h-[46px] items-stretch overflow-hidden rounded-full border border-zinc-200 bg-white transition-all focus-within:border-zinc-300 focus-within:ring-2 focus-within:ring-zinc-100">
        <label className="flex min-w-0 flex-1 cursor-text items-center gap-2.5 px-4 py-2 outline-none focus-within:outline-none">
          <SearchFieldIcon className="pointer-events-none shrink-0 text-zinc-400 transition-colors group-focus-within:text-zinc-600" />
          <input
            type="text"
            inputMode="search"
            name="shop-search"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="search"
            placeholder="Buscar produtos…"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[15px] leading-snug text-zinc-900 shadow-none placeholder:text-zinc-400 outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 appearance-none [-webkit-appearance:none] [-webkit-tap-highlight-color:transparent]"
            aria-label="Buscar produtos"
          />
        </label>
        <span
          className="my-2 w-px shrink-0 self-stretch bg-zinc-200"
          aria-hidden
        />
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="relative flex min-h-[46px] min-w-[48px] shrink-0 items-center justify-center text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
          aria-label="Abrir filtros"
        >
          <FilterSlidersIcon className="block" />
          {badgeCount > 0 ? (
            <span className="absolute right-2 top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#861201] px-1 text-[10px] font-bold leading-none text-white">
              {badgeCount > 9 ? "9+" : badgeCount}
            </span>
          ) : null}
        </button>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link
          href={pathWithCurrentQuery("/loja")}
          scroll={false}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors border ${
            !currentCategorySlug
              ? "bg-[#861201] border-black text-white"
              : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"
          }`}
        >
          Todos
        </Link>
        {categories.map((cat) => {
          const active = currentCategorySlug === cat.name;
          return (
            <Link
              key={cat.id}
              href={pathWithCurrentQuery(
                `/loja/${encodeURIComponent(cat.name)}`,
              )}
              scroll={false}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors border ${
                active
                  ? "bg-[#861201] border-black text-white"
                  : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"
              }`}
            >
              {cat.name.replace(/-/g, " ")}
            </Link>
          );
        })}
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Fechar"
            onClick={() => setModalOpen(false)}
          />
          <div
            className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-3xl bg-white shadow-xl sm:rounded-3xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="shop-filters-title"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
              <h2
                id="shop-filters-title"
                className="text-lg font-semibold text-black"
              >
                Filtros
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 hover:text-black"
                aria-label="Fechar filtros"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-4">
              <div className="mb-6">
                <SortBy />
              </div>
              <Filters hideHeading />
            </div>
            <div className="border-t border-zinc-100 p-4 bg-white">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-full rounded-full bg-[#861201] py-3.5 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
              >
                Ver resultados
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ShopMobileFilters;
