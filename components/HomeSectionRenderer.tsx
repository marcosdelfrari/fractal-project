import React from "react";
import {
  Hero,
  CategoryMenu,
  ProductsSection,
  FeaturedProductSection,
} from "@/components";

interface HomeSection {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
  content?: unknown;
}

const SECTION_COMPONENTS: Record<string, React.ComponentType<any>> = {
  hero: Hero,
  categoryMenu: CategoryMenu,
  productsSection: ProductsSection,
  featuredProducts: FeaturedProductSection,
};

async function getHomeSections(): Promise<HomeSection[]> {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
  try {
    const response = await fetch(`${apiBase}/api/settings/home-sections`, {
      cache: "no-store",
    });
    if (response.ok) {
      const data = (await response.json()) as HomeSection[];
      return data
        .filter((s) => s.enabled)
        .sort((a, b) => a.order - b.order);
    }
  } catch (error) {
    console.error("Erro ao carregar seções:", error);
  }

  return [
    { id: "1", name: "hero", enabled: true, order: 0 },
    { id: "2", name: "categoryMenu", enabled: true, order: 1 },
    { id: "3", name: "productsSection", enabled: true, order: 2 },
    { id: "4", name: "featuredProducts", enabled: true, order: 3 },
  ];
}

export default async function HomeSectionRenderer() {
  const sections = await getHomeSections();

  return (
    <>
      {sections.map((section) => {
        const Component = SECTION_COMPONENTS[section.name];
        if (!Component) {
          console.warn(`Componente não encontrado para seção: ${section.name}`);
          return null;
        }
        const sectionContentProps =
          section.name === "featuredProducts" ||
          section.name === "categoryMenu" ||
          section.name === "hero"
            ? { sectionContent: section.content }
            : {};
        return <Component key={section.id} {...sectionContentProps} />;
      })}
    </>
  );
}
