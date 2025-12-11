import {
  CategoryMenu,
  Hero,
  Incentives,
  IntroducingSection,
  Newsletter,
  ProductsSection,
  FeaturedProductSection,
} from "@/components";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedProductSection />
      <CategoryMenu />
      <ProductsSection />
    </>
  );
}
