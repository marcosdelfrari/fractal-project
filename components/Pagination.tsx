// *********************
// Role of the component: Pagination for navigating the shop page
// Name of the component: Pagination.tsx
// Version: 1.1
// Component call: <Pagination /> or <Pagination currentPage={1} totalPages={10} onPageChange={(page) => {}} />
// Input parameters: optional - currentPage, totalPages, onPageChange
// Output: Component with the current page and buttons for incrementing and decrementing page
// *********************

"use client";
import { usePaginationStore } from "@/app/_zustand/paginationStore";
import React from "react";

interface PaginationProps {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  // getting from Zustand store current page and methods for incrementing and decrementing current page
  const {
    page: zustandPage,
    incrementPage,
    decrementPage,
  } = usePaginationStore();

  // Use props if provided, otherwise use Zustand store
  const isControlled = currentPage !== undefined && onPageChange !== undefined;
  const page = isControlled ? currentPage : zustandPage;

  const handlePrevious = () => {
    if (isControlled) {
      if (currentPage > 1) {
        onPageChange(currentPage - 1);
      }
    } else {
      decrementPage();
    }
  };

  const handleNext = () => {
    if (isControlled) {
      if (totalPages === undefined || currentPage < totalPages) {
        onPageChange(currentPage + 1);
      }
    } else {
      incrementPage();
    }
  };

  return (
    <div className="flex justify-center items-center gap-2 py-8">
      <button
        className="flex items-center justify-center w-10 h-10 rounded-full border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 hover:border-zinc-300 disabled:opacity-30 disabled:hover:bg-white disabled:hover:border-zinc-200 disabled:cursor-not-allowed transition-all"
        onClick={handlePrevious}
        disabled={page <= 1}
        aria-label="Página anterior"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      
      <span className="text-sm font-medium text-zinc-600 px-4">
        Página <span className="text-zinc-900">{page}</span>
        {totalPages ? ` de ${totalPages}` : ""}
      </span>

      <button
        className="flex items-center justify-center w-10 h-10 rounded-full border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 hover:border-zinc-300 disabled:opacity-30 disabled:hover:bg-white disabled:hover:border-zinc-200 disabled:cursor-not-allowed transition-all"
        onClick={handleNext}
        disabled={totalPages !== undefined && page >= totalPages}
        aria-label="Próxima página"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
    </div>
  );
};

export default Pagination;
