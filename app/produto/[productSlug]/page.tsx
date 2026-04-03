import {
  StockAvailabillity,
  SingleProductRating,
  SingleProductDynamicFields,
  ProductTabs,
} from "@/components";
import apiClient from "@/lib/api";
import { notFound } from "next/navigation";
import React from "react";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaPinterest,
  FaTiktok,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import type { IconType } from "react-icons";
import { sanitize } from "@/lib/sanitize";
import Link from "next/link";
import ProductImageGallery from "@/components/ProductImageGallery";
import ProductPageMotion from "@/components/ProductPageMotion";
import BrandTiragem from "@/components/BrandTiragem";
import { getSiteSettings } from "@/lib/getSiteSettings";

interface ImageItem {
  imageID: string;
  productID: string;
  image: string;
}

interface SingleProductPageProps {
  params: Promise<{ productSlug: string; id: string }>;
}

const SingleProductPage = async ({ params }: SingleProductPageProps) => {
  const paramsAwaited = await params;
  let product: any = null;
  let images: ImageItem[] = [];

  try {
    const data = await apiClient.get(
      `/api/slugs/${paramsAwaited?.productSlug}`,
      { cache: "no-store" },
    );

    if (!data.ok) {
      console.error(`API Error: ${data.status} ${data.statusText}`);
      notFound();
    }

    product = await data.json();

    if (!product || product.error) {
      notFound();
    }

    try {
      const imagesData = await apiClient.get(
        `/api/images/${paramsAwaited?.id || product?.id}`,
        { cache: "no-store" },
      );

      if (imagesData.ok) {
        images = await imagesData.json();
        if (!Array.isArray(images)) {
          images = [];
        }
      }
    } catch (imageError) {
      console.error("Error fetching images:", imageError);
      images = [];
    }
  } catch (error) {
    console.error("Error fetching product:", error);
    notFound();
  }

  // Calculate installments (mock logic)
  const installmentPrice = (product?.price / 7).toFixed(2).replace(".", ",");
  const formattedPrice = product?.price?.toFixed(2).replace(".", ",");
  const settings = await getSiteSettings();
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ).replace(/\/$/, "");
  const productUrl = `${siteUrl}/produto/${paramsAwaited.productSlug}`;
  const shareText = `Confira este produto: ${sanitize(product?.title || "")}`;

  type SocialLink = { key: string; href: string; icon: IconType };

  const socialLinks = [
    settings.facebook
      ? {
          key: "facebook",
          href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
          icon: FaFacebook,
        }
      : null,
    settings.instagram
      ? {
          key: "instagram",
          href: settings.instagram,
          icon: FaInstagram,
        }
      : null,
    settings.x
      ? {
          key: "x",
          href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(shareText)}`,
          icon: FaXTwitter,
        }
      : null,
    settings.pinterest
      ? {
          key: "pinterest",
          href: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(productUrl)}&description=${encodeURIComponent(shareText)}`,
          icon: FaPinterest,
        }
      : null,
    settings.youtube
      ? {
          key: "youtube",
          href: settings.youtube,
          icon: FaYoutube,
        }
      : null,
    settings.linkedin
      ? {
          key: "linkedin",
          href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(productUrl)}`,
          icon: FaLinkedin,
        }
      : null,
    settings.tiktok
      ? {
          key: "tiktok",
          href: settings.tiktok,
          icon: FaTiktok,
        }
      : null,
  ].filter((item): item is SocialLink => item !== null);

  return (
    <div className="bg-[#E3E1D6] text-gray-800 ">
      <div className="max-w-screen-2xl mx-auto px-5 py-10">
        {/* Breadcrumbs */}
        <ProductPageMotion delay={0.05}>
          <div className="text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-black transition-colors">
              Início
            </Link>
            <span className="mx-2">/</span>
            <span className="capitalize">
              {product?.category?.name || "Categoria"}
            </span>
            <span className="mx-2">/</span>
            <span className="text-black">{sanitize(product?.title)}</span>
          </div>
        </ProductPageMotion>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <ProductPageMotion delay={0.1} y={28} className="lg:col-span-7">
            <ProductImageGallery
              mainImage={product?.mainImage}
              images={images}
              product={product}
              productSlug={paramsAwaited.productSlug}
            />
          </ProductPageMotion>

          {/* Right Column: Product Details */}
          <ProductPageMotion
            delay={0.15}
            y={28}
            className="lg:col-span-5 flex flex-col gap-6"
          >
            <div className="flex flex-col gap-6">
              {/* Title & Reviews */}
              <div>
                <h1 className="text-3xl lg:text-4xl font-light tracking-tight mb-2 text-gray-900">
                  {sanitize(product?.title)}
                </h1>
              </div>

              {/* Price */}
              <div>
                <p className="text-3xl font-medium text-gray-900">
                  R$ {formattedPrice}
                </p>
                <p className="text-gray-500 text-sm font-light">
                  ou 7x de R$ {installmentPrice}
                </p>
              </div>

              {/* Table of Measures Link */}
              {product?.measureTable && (
                <div>
                  <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 12h20"></path>
                      <path d="M2 12v3a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-3"></path>
                      <path d="M22 16h-2"></path>
                      <path d="M4 16H2"></path>
                      <path d="M18 16h-2"></path>
                      <path d="M8 16H6"></path>
                      <path d="M14 16h-2"></path>
                    </svg>
                    Tabela de medidas
                  </button>
                </div>
              )}

              {/* Dynamic Fields (Colors, Sizes, Add to Cart) */}
              <SingleProductDynamicFields product={product} />

              {/* Share */}
              {socialLinks.length > 0 && (
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-2">
                  <span>Compartilhe:</span>
                  <div className="flex items-center gap-3 text-lg">
                    {socialLinks.map(({ key, href, icon: Icon }) => (
                      <a
                        key={key}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-black"
                        aria-label={`Compartilhar em ${key}`}
                      >
                        <Icon />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ProductPageMotion>
        </div>

        {/* Detailed Tabs (Description, Reviews) */}
        <ProductPageMotion delay={0.2} y={24}>
          <div
            id="description"
            className="mt-10 lg:mt-16 border-t border-gray-200 pt-8"
          >
            <ProductTabs product={product} />
          </div>
        </ProductPageMotion>
      </div>
    </div>
  );
};

export default SingleProductPage;
