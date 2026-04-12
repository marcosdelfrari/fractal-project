"use client";

import Image from "next/image";
import { productImageUnoptimized } from "@/lib/imageUtils";

/**
 * Fotos de produto na API (Railway): `next/image` ainda pode pedir o otimizador em dev
 * ("upstream image response failed"). URLs `https?://` usam `<img>` nativo.
 */
export function ProductPhotoFill(props: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const { src, alt, className, sizes, priority } = props;
  if (productImageUnoptimized(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 h-full w-full ${className ?? ""}`}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        referrerPolicy="no-referrer"
      />
    );
  }
  return (
    <Image
      src={src}
      fill
      alt={alt}
      className={className}
      sizes={sizes}
      priority={priority}
    />
  );
}

export function ProductPhotoFixed(props: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}) {
  const { src, alt, width, height, className } = props;
  if (productImageUnoptimized(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
      />
    );
  }
  return (
    <Image
      src={src}
      width={width}
      height={height}
      alt={alt}
      className={className}
    />
  );
}
