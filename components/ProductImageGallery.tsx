"use client";

import { useEffect, useMemo, useState } from "react";
import { AddToWishlistBtn } from "@/components";
import { ProductPhotoFill, ProductPhotoFixed } from "@/components/ProductPhoto";
import { productMainImageUrl } from "@/lib/imageUtils";

interface ImageItem {
  imageID: string;
  productID: string;
  image: string;
}

interface ProductImageGalleryProps {
  mainImage?: string;
  images: ImageItem[];
  product: any;
  productSlug: string;
}

const ProductImageGallery = ({
  mainImage,
  images,
  product,
  productSlug,
}: ProductImageGalleryProps) => {
  const allImages = useMemo(() => {
    const galleryImages = images?.map((item) => item.image).filter(Boolean) || [];
    if (!mainImage) return galleryImages;
    return [mainImage, ...galleryImages];
  }, [mainImage, images]);

  const [selectedImage, setSelectedImage] = useState<string>(
    () => allImages[0] || "",
  );

  useEffect(() => {
    setSelectedImage(allImages[0] || "");
  }, [allImages]);

  const mainSrc = productMainImageUrl(selectedImage);

  return (
    <div className="flex flex-col md:flex-row gap-4 h-fit lg:sticky lg:top-4">
      {/* Thumbnails - Sidebar em Desktop, Horizontal em Mobile */}
      <div className="order-2 md:order-1 flex md:flex-col gap-3 md:w-24 overflow-x-auto md:overflow-y-auto pb-2 md:pb-0 scrollbar-hide">
        {allImages.map((imageName, index) => {
          const isSelected = selectedImage === imageName;
          const thumbSrc = productMainImageUrl(imageName);
          return (
            <button
              key={`${imageName}-${index}`}
              type="button"
              onClick={() => setSelectedImage(imageName)}
              className={`flex-shrink-0 w-20 md:w-full aspect-[4/5] overflow-hidden rounded-2xl border-2 cursor-pointer transition-colors ${
                isSelected
                  ? "border-black"
                  : "border-gray-200 hover:border-black"
              }`}
            >
              <ProductPhotoFixed
                src={thumbSrc}
                width={100}
                height={125}
                alt="thumbnail"
                className="h-full w-full object-cover"
              />
            </button>
          );
        })}
      </div>

      {/* Imagem Principal */}
      <div className="order-1 md:order-2 flex-1 bg-white relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] border-2 border-black">
        <ProductPhotoFill
          src={mainSrc}
          alt="main image"
          className="object-cover w-full h-full"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
        <div className="absolute top-4 right-4">
          <AddToWishlistBtn product={product} slug={productSlug} />
        </div>
      </div>
    </div>
  );
};

export default ProductImageGallery;
