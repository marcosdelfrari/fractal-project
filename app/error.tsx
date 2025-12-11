"use client";

import { AiOutlineWarning } from "react-icons/ai";
import { useEffect } from "react";

const GlobalError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    // Log error to console for debugging (only in development)
    if (process.env.NODE_ENV === "development") {
      console.error("Global error:", error);
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 rounded-2xl bg-red-50 border border-red-200 shadow-sm mx-auto max-w-2xl my-10">
      <AiOutlineWarning className="w-12 h-12 text-red-500 mb-4" />
      <h3 className="text-2xl font-semibold text-red-700 mb-2">
        Algo deu errado
      </h3>
      <p className="text-red-500 mt-3 max-w-md mb-6">
        {process.env.NODE_ENV === "development"
          ? error.message
          : "Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde."}
      </p>
      {error.digest && (
        <p className="text-xs text-gray-400 mb-4">
          Código de erro: {error.digest}
        </p>
      )}
      <button
        onClick={reset}
        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Tentar novamente
      </button>
    </div>
  );
};

export default GlobalError;
