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
      <CategoryMenu />
      <ProductsSection />
      <FeaturedProductSection />
    </>
  );
}
