"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { DashboardSidebar } from "@/components";
import {
  FaGear,
  FaChevronRight,
  FaStore,
  FaLayerGroup,
  FaTableList,
  FaStar,
  FaPanorama,
} from "react-icons/fa6";

type AreaItem = {
  href: string;
  title: string;
  description: string;
  icon: ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }>;
};

type SettingsGroup = {
  id: string;
  label: string;
  hint: string;
  items: AreaItem[];
};

const GROUPS: SettingsGroup[] = [
  {
    id: "loja",
    label: "Loja e identidade",
    hint: "Informações da empresa e arquivos que aparecem no cabeçalho e rodapé.",
    items: [
      {
        href: "/admin/settings/loja",
        title: "Informações da loja",
        description:
          "Nome, contatos, endereço, ícone e logo. Dados sensíveis e identidade visual.",
        icon: FaStore,
      },
    ],
  },
  {
    id: "home",
    label: "Página inicial",
    hint: "Conteúdo e ordem dos blocos exibidos na home — cada item abre uma tela separada.",
    items: [
      {
        href: "/admin/settings/hero",
        title: "Hero (banner principal)",
        description:
          "Imagem em tela cheia, título e botão da primeira dobra da página inicial.",
        icon: FaPanorama,
      },
      {
        href: "/admin/settings/menu-categorias",
        title: "Menu de categorias",
        description:
          "Cards próprios da home (título, link e imagem), independentes do cadastro de categorias de produto.",
        icon: FaTableList,
      },
      {
        href: "/admin/settings/produtos-destaque",
        title: "Produtos em destaque",
        description:
          "Slides com imagens e textos da vitrine em destaque na página inicial.",
        icon: FaStar,
      },
      {
        href: "/admin/settings/secoes-home",
        title: "Seções da home",
        description:
          "Ordem e visibilidade dos blocos (hero, categorias, produtos, destaque, etc.).",
        icon: FaLayerGroup,
      },
    ],
  },
];

const AdminSettingsPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen flex justify-start max-w-screen-2xl mx-auto max-xl:flex-col">
      <DashboardSidebar />
      <div className="flex-1 p-10 max-md:p-4 animate-fade-in-up">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-6 mb-10">
          <div className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-900 shadow-sm">
            <FaGear size={16} aria-hidden />
          </div>
          <div>
            <h1 className="text-lg font-light tracking-widest text-gray-900 uppercase">
              Configurações do site
            </h1>
            <p className="text-xs text-gray-500 mt-1 max-w-xl leading-relaxed">
              Organizado por tópico. Cada opção abre uma tela própria para reduzir alterações
              acidentais.
            </p>
          </div>
        </div>

        <div className="max-w-2xl space-y-10">
          {GROUPS.map((group) => (
            <section key={group.id} aria-labelledby={`settings-group-${group.id}`}>
              <div className="mb-4">
                <h2
                  id={`settings-group-${group.id}`}
                  className="text-[11px] font-semibold tracking-[0.22em] uppercase text-gray-500"
                >
                  {group.label}
                </h2>
                <p className="text-xs text-gray-400 mt-1.5 leading-relaxed max-w-lg">
                  {group.hint}
                </p>
              </div>

              <ul className="rounded-2xl border border-gray-200/80 bg-white shadow-sm overflow-hidden divide-y divide-gray-100">
                {group.items.map(({ href, title, description, icon: Icon }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="group flex items-center gap-4 px-4 py-4 sm:px-5 sm:py-[1.125rem] hover:bg-gray-50/90 transition-colors"
                    >
                      <div className="p-2.5 rounded-xl bg-gray-50 text-gray-700 border border-gray-100/80 group-hover:bg-white group-hover:border-gray-200 transition-colors">
                        <Icon size={18} aria-hidden />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                          {description}
                        </p>
                      </div>
                      <FaChevronRight
                        className="text-gray-300 group-hover:text-gray-500 flex-shrink-0 transition-colors"
                        size={13}
                        aria-hidden
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
