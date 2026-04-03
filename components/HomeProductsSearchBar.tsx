"use client";

import React, { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";

type HomeProductsSearchBarProps = {
  className?: string;
};

export default function HomeProductsSearchBar({
  className = "",
}: HomeProductsSearchBarProps) {
  const [q, setQ] = useState("");
  const router = useRouter();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) {
      router.push("/loja");
      return;
    }
    router.push(`/loja?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={onSubmit} className={className}>
      <div className="flex h-11 min-h-[2.75rem] items-stretch overflow-hidden rounded-full border-2 border-black bg-[#861201]">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar produtos..."
          className="min-w-0 flex-1 border-0 bg-[#861201] px-3.5 py-0 text-sm text-white outline-none placeholder:text-white/65"
          aria-label="Buscar produtos"
        />
        <button
          type="submit"
          className="flex shrink-0 items-center justify-center border-0 bg-[#861201] px-3.5 text-[#FFFF04] transition-opacity hover:opacity-90"
          aria-label="Buscar"
        >
          <FaSearch className="h-[1.05rem] w-[1.05rem]" />
        </button>
      </div>
    </form>
  );
}
