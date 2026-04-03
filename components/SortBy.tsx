// *********************
// Role of the component: SortBy
// Name of the component: SortBy.tsx
// Version: 1.0
// Component call: <SortBy />
// Input parameters: no input parameters
// Output: select input with options for sorting by a-z, z-a, price low, price high
// *********************

"use client";
import React from "react";
import { useSortStore } from "@/app/_zustand/sortStore";

const SortBy = () => {
  // getting values from Zustand sort store
  const { sortBy, changeSortBy } = useSortStore();

  return (
    <div className="flex items-center gap-x-3 w-full md:w-auto">
      <span className="text-sm font-medium text-zinc-500 whitespace-nowrap">Ordenar por:</span>
      <div className="relative w-full md:w-48">
        <select
          defaultValue={sortBy}
          onChange={(e) => changeSortBy(e.target.value)}
          className="w-full appearance-none bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-xl py-2.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all cursor-pointer"
          name="sort"
        >
          <option value="defaultSort">Padrão</option>
          <option value="titleAsc">Nome: A a Z</option>
          <option value="titleDesc">Nome: Z a A</option>
          <option value="lowPrice">Menor Preço</option>
          <option value="highPrice">Maior Preço</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
    </div>
  );
};

export default SortBy;
