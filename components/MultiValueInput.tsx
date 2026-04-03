"use client";

import { useState } from "react";

interface MultiValueInputProps {
  label: string;
  placeholder: string;
  values: string[];
  onChange: (nextValues: string[]) => void;
}

const MultiValueInput = ({
  label,
  placeholder,
  values,
  onChange,
}: MultiValueInputProps) => {
  const [draft, setDraft] = useState("");

  const addValue = (rawValue: string) => {
    const next = rawValue.trim();
    if (!next) return;

    const alreadyExists = values.some(
      (item) => item.toLowerCase() === next.toLowerCase()
    );
    if (alreadyExists) return;

    onChange([...values, next]);
  };

  const removeValue = (valueToRemove: string) => {
    onChange(values.filter((value) => value !== valueToRemove));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addValue(draft);
      setDraft("");
    }

    if (event.key === "Backspace" && !draft.trim() && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest px-1">
        {label}
      </label>

      <div className="w-full bg-[#E3E1D6] border border-transparent focus-within:border-gray-200 focus-within:bg-white rounded-2xl min-h-[56px] py-2.5 px-4 transition-all duration-300 flex items-center">
        <div className="flex flex-wrap items-center gap-2 w-full">
          {values.map((value) => (
            <span
              key={value}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-medium text-gray-700 shadow-sm transition-all hover:border-gray-300"
            >
              {value}
              <button
                type="button"
                onClick={() => removeValue(value)}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md w-4 h-4 flex items-center justify-center transition-colors"
                aria-label={`Remover ${value}`}
              >
                <svg width="8" height="8" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </span>
          ))}

          <input
            type="text"
            value={draft}
            placeholder={values.length === 0 ? placeholder : "Adicionar..."}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (draft.trim()) {
                addValue(draft);
                setDraft("");
              }
            }}
            className="min-w-[120px] flex-1 bg-transparent border-none outline-none focus:ring-0 text-sm text-gray-900 placeholder:text-gray-300 py-1.5 px-2"
          />
        </div>
      </div>
    </div>
  );
};

export default MultiValueInput;
