// *********************
// Role of the component: Filters on shop page
// Name of the component: Filters.tsx
// Component call: <Filters />
// Output: category + price filters (desktop sidebar)
// *********************

"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSortStore } from "@/app/_zustand/sortStore";
import { usePaginationStore } from "@/app/_zustand/paginationStore";
import apiClient from "@/lib/api";

interface InputCategory {
  priceFilter: { text: string; value: number };
}

const PRICE_MAX = 3000;

function parseFiltersFromSearch(sp: URLSearchParams): InputCategory {
  const price = Number(sp.get("price") ?? String(PRICE_MAX));
  return {
    priceFilter: {
      text: "price",
      value: Number.isNaN(price)
        ? PRICE_MAX
        : Math.min(PRICE_MAX, Math.max(0, price)),
    },
  };
}

function formatPriceBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

type FiltersProps = {
  hideHeading?: boolean;
};

const Filters = ({ hideHeading }: FiltersProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const { page } = usePaginationStore();
  const { sortBy } = useSortStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [inputCategory, setInputCategory] = useState<InputCategory>({
    priceFilter: { text: "price", value: PRICE_MAX },
  });
  const [urlReady, setUrlReady] = useState(false);

  const currentCategorySlug = useMemo(() => {
    const parts = pathname.replace(/^\/+|\/+$/g, "").split("/");
    if (parts[0] === "loja" && parts[1]) return decodeURIComponent(parts[1]);
    return null;
  }, [pathname]);

  const pathWithCurrentQuery = useMemo(() => {
    const qs = searchParams.toString();
    return (path: string) => (qs ? `${path}?${qs}` : path);
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
    const sp = new URLSearchParams(window.location.search);
    setInputCategory(parseFiltersFromSearch(sp));
    const sort = sp.get("sort");
    if (
      sort &&
      [
        "defaultSort",
        "titleAsc",
        "titleDesc",
        "lowPrice",
        "highPrice",
      ].includes(sort)
    ) {
      useSortStore.getState().changeSortBy(sort);
    }
    setUrlReady(true);
  }, []);

  useEffect(() => {
    if (!urlReady) return;
    const params = new URLSearchParams(window.location.search);
    const qKeep = params.get("q");
    params.delete("outOfStock");
    params.delete("inStock");
    params.delete("sizes");
    params.set("price", inputCategory.priceFilter.value.toString());
    params.set("sort", sortBy);
    params.set("page", page.toString());
    if (qKeep) params.set("q", qKeep);
    replace(`${pathname}?${params.toString()}`);
  }, [inputCategory, sortBy, page, urlReady, pathname, replace]);

  const priceValue = inputCategory.priceFilter.value;
  const priceFillPercent = (priceValue / PRICE_MAX) * 100;

  const rangeThumbClass =
    "relative z-10 h-9 w-full cursor-pointer appearance-none bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/25 focus-visible:ring-offset-2 rounded-lg " +
    "[&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-transparent " +
    "[&::-webkit-slider-thumb]:-mt-[5px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[#861201] [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(0,0,0,0.18)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-105 [&::-webkit-slider-thumb]:active:scale-95 " +
    "[&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-transparent " +
    "[&::-moz-range-thumb]:h-[18px] [&::-moz-range-thumb]:w-[18px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-[#861201] [&::-moz-range-thumb]:shadow-[0_2px_8px_rgba(0,0,0,0.18)]";

  return (
    <div className="flex flex-col gap-y-8 pb-8">
      {!hideHeading ? (
        <h3 className="text-xl font-medium tracking-tight text-zinc-900">
          Filtros
        </h3>
      ) : null}

      {!hideHeading ? (
        <div className="flex flex-col gap-y-3">
          <h3 className="flex items-center justify-between text-sm font-semibold uppercase tracking-wider text-zinc-900">
            Categoria
          </h3>
          <nav
            className="flex flex-col gap-1"
            aria-label="Filtrar por categoria"
          >
            <Link
              href={pathWithCurrentQuery("/loja")}
              scroll={false}
              className={`rounded-lg px-2 py-1.5 text-sm transition-colors ${
                !currentCategorySlug
                  ? "bg-[#861201] font-medium text-white"
                  : "text-zinc-600 hover:bg-[#861201]/5 hover:text-zinc-900"
              }`}
            >
              Todos os produtos
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
                  className={`rounded-lg px-2 py-1.5 text-sm capitalize transition-colors ${
                    active
                      ? "bg-[#861201] font-medium text-white"
                      : "text-zinc-600 hover:bg-[#861201]/5 hover:text-zinc-900"
                  }`}
                >
                  {cat.name.replace(/-/g, " ")}
                </Link>
              );
            })}
          </nav>
        </div>
      ) : null}

      <div className="rounded-2xl border border-zinc-200/90 bg-white/70 p-4 shadow-sm shadow-zinc-900/5 backdrop-blur-sm">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
              Preço máximo
            </p>
            <p className="mt-1 font-economica text-3xl font-semibold tabular-nums tracking-tight text-zinc-900">
              {formatPriceBRL(priceValue)}
            </p>
          </div>
          {priceValue < PRICE_MAX ? (
            <button
              type="button"
              onClick={() =>
                setInputCategory({
                  ...inputCategory,
                  priceFilter: { text: "price", value: PRICE_MAX },
                })
              }
              className="shrink-0 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-white hover:text-zinc-900"
            >
              Limpar
            </button>
          ) : null}
        </div>

        <div className="relative flex h-9 w-full items-center">
          <div
            className="pointer-events-none absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 overflow-hidden rounded-full bg-zinc-200/90 ring-1 ring-inset ring-zinc-300/50"
            aria-hidden
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-zinc-800 to-zinc-900 transition-[width] duration-100 ease-out"
              style={{ width: `${priceFillPercent}%` }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={PRICE_MAX}
            step={10}
            value={priceValue}
            className={rangeThumbClass}
            aria-label={`Preço máximo: ${formatPriceBRL(priceValue)}`}
            aria-valuemin={0}
            aria-valuemax={PRICE_MAX}
            aria-valuenow={priceValue}
            onChange={(e) =>
              setInputCategory({
                ...inputCategory,
                priceFilter: {
                  text: "price",
                  value: Number(e.target.value),
                },
              })
            }
          />
        </div>

        <div className="mt-2.5 flex items-center justify-between text-[11px] font-medium tabular-nums text-zinc-500">
          <span>{formatPriceBRL(0)}</span>
          <span className="text-zinc-400">—</span>
          <span>{formatPriceBRL(PRICE_MAX)}</span>
        </div>
      </div>
    </div>
  );
};

export default Filters;
