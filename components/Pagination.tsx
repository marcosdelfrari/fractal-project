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
    <div className="join flex justify-center py-16">
      <button
        className="join-item btn btn-lg bg-zinc-900 text-white hover:bg-white hover:text-blue-500 disabled:opacity-50"
        onClick={handlePrevious}
        disabled={page <= 1}
      >
        «
      </button>
      <button className="join-item btn btn-lg bg-zinc-900 text-white hover:bg-white hover:text-blue-500">
        Página {page}
        {totalPages ? ` de ${totalPages}` : ""}
      </button>
      <button
        className="join-item btn btn-lg bg-zinc-900 text-white hover:bg-white hover:text-blue-500 disabled:opacity-50"
        onClick={handleNext}
        disabled={totalPages !== undefined && page >= totalPages}
      >
        »
      </button>
    </div>
  );
};

export default Pagination;
