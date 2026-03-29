"use client";

import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";

type Props = {
  title: string;
  description?: string;
};

export function SettingsBackHeader({ title, description }: Props) {
  return (
    <div className="border-b border-gray-100 pb-6 mb-8">
      <Link
        href="/admin/settings"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-5 transition-colors"
      >
        <FaArrowLeft size={14} aria-hidden />
        <span>Voltar às configurações</span>
      </Link>
      <h1 className="text-lg font-light tracking-widest text-gray-900 uppercase">
        {title}
      </h1>
      {description ? (
        <p className="text-xs text-gray-500 mt-2 max-w-2xl">{description}</p>
      ) : null}
    </div>
  );
}
