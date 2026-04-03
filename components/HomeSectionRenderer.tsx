import React from "react";
import Hero from "@/components/Hero";
import HomePromoSlider from "@/components/HomePromoSlider";
import CategoryMenu from "@/components/CategoryMenu";
import ProductsSection from "@/components/ProductsSection";
import FeaturedProductSection from "@/components/FeaturedProductSection";
interface HomeSection {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
  content?: unknown;
}

const SECTION_COMPONENTS: Record<string, React.ComponentType<any>> = {
  hero: Hero,
  promoSlider: HomePromoSlider,
  categoryMenu: CategoryMenu,
  productsSection: ProductsSection,
  featuredProducts: FeaturedProductSection,
};

async function getHomeSections(): Promise<HomeSection[]> {
  const apiBase = (
    process.env.NEXTAUTH_URL || "http://localhost:3000"
  ).replace(/\/$/, "");
  try {
    const response = await fetch(`${apiBase}/api/settings/home-sections`, {
      cache: "no-store",
    });
    if (response.ok) {
      const data = (await response.json()) as HomeSection[];
      return data
        .filter((s) => s.enabled && s.name !== "upcomingEvents")
        .sort((a, b) => a.order - b.order);
    }
  } catch (error) {
    console.error("Erro ao carregar seções:", error);
  }

  // Sem fallback “tudo ativo”: evita mostrar blocos que o admin desativou se a API falhar.
  return [];
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
          section.name === "hero" ||
          section.name === "promoSlider"
            ? { sectionContent: section.content }
            : {};
        return <Component key={section.id} {...sectionContentProps} />;
      })}
    </>
  );
}
