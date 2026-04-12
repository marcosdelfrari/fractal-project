"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Barlow_Condensed } from "next/font/google";
import {
  getPromoSliderConfig,
  type PromoSliderSlide,
} from "@/lib/sectionContent";
import { publicAssetUrl } from "@/lib/imageUtils";
import { FaArrowRight } from "react-icons/fa";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

const MAROON = "#861201";
const BANNER_YELLOW = "#FFFF04";

interface HomePromoSliderProps {
  sectionContent?: unknown;
}

/** Ilustração estilo cartum: folha, círculo preto com “estrelas”. */
function PromoSliderMascot({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Image
        src="/LOGO2.png"
        alt="Promo Slider Mascot"
        width={300}
        height={300}
        className="object-cover"
      />
    </div>
  );
}

function SlideCta({
  href,
  className,
  style,
  children,
}: {
  href: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const h = href.trim() || "/";
  const external = /^https?:\/\//i.test(h);
  if (external) {
    return (
      <a
        href={h}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        style={style}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={h} className={className} style={style}>
      {children}
    </Link>
  );
}

const motionEase = [0.22, 1, 0.36, 1] as const;

const springCarousel = {
  type: "spring" as const,
  stiffness: 280,
  damping: 34,
  mass: 0.72,
};

const springIntro = {
  type: "spring" as const,
  stiffness: 340,
  damping: 30,
  mass: 0.65,
};

const springSoft = {
  type: "spring" as const,
  stiffness: 220,
  damping: 26,
  mass: 0.85,
};

function SlidePanel({
  slide,
  isActive,
  replayKey,
}: {
  slide: PromoSliderSlide;
  isActive: boolean;
  replayKey: number;
}) {
  const reduceMotion = useReducedMotion();
  const runEnter = isActive && !reduceMotion;

  /** Remonta só o slide ativo para repetir entrada ao trocar. */
  const mountKey = isActive ? `${slide.id}-${replayKey}` : `${slide.id}-idle`;

  const lineMotion = (delay: number) =>
    runEnter
      ? {
          initial: { opacity: 0, x: -28, rotate: -2 },
          animate: { opacity: 1, x: 0, rotate: 0 },
          transition: { ...springIntro, delay },
        }
      : {
          initial: false,
          animate: { opacity: 1 },
          transition: { duration: 0 },
        };

  const ctaMotion = runEnter
    ? {
        initial: { opacity: 0, y: 12, scale: 0.94 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { ...springIntro, delay: 0.2 },
      }
    : {
        initial: false,
        animate: { opacity: 1 },
        transition: { duration: 0 },
      };

  const mascotMotion = runEnter
    ? {
        initial: { opacity: 0, scale: 0.88, rotate: -6 },
        animate: { opacity: 1, scale: 1, rotate: 0 },
        transition: { ...springSoft, delay: 0.12 },
      }
    : {
        initial: false,
        animate: { opacity: 1, scale: 1, rotate: 0 },
        transition: { duration: 0 },
      };

  const imageMotion = runEnter
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { ...springSoft, delay: 0.42 },
      }
    : {
        initial: false,
        animate: { opacity: 1 },
        transition: { duration: 0 },
      };

  return (
    <div className="relative mt-10 w-full shrink-0 rounded-[28px] bg-black p-[2px] md:min-h-[520px]  md:rounded-[40px]">
      <div
        className="flex min-h-0 w-full  flex-col overflow-hidden rounded-[26px]  pb-1.5 md:min-h-[516px] md:flex-row md:rounded-[38px] md:pb-0"
        style={{ background: BANNER_YELLOW }}
      >
        <div
          className="relative z-[1] flex w-full flex-[0_0_46%] flex-col justify-center rounded-t-[26px] rounded-b-none px-5 py-5 text-center md:items-start md:rounded-[38px_34px_34px_38px] md:px-8 md:py-10 md:text-left"
          style={{ background: MAROON }}
        >
          <div
            key={mountKey}
            className={`${barlowCondensed.className}  leading-[0.95] tracking-tight text-white text-6xl md:text-[96px]`}
          >
            <motion.span className="block uppercase" {...lineMotion(0)}>
              {slide.line1}
            </motion.span>
            <motion.span className="block uppercase" {...lineMotion(0.07)}>
              {slide.line2}
            </motion.span>
          </div>
          <motion.div {...ctaMotion}>
            <SlideCta
              href={slide.buttonHref}
              className="mt-4 inline-flex h-9 max-w-[150px] items-center justify-between gap-2 self-center rounded-full border-2 border-black px-5 text-base md:text-lg font-semibold uppercase text-black sm:h-10 sm:text-sm md:mt-5 md:self-start"
              style={{ background: BANNER_YELLOW }}
            >
              {slide.buttonLabel.trim() || "\u00A0"} <FaArrowRight />
            </SlideCta>
          </motion.div>
        </div>

        <motion.div
          key={`mascot-${mountKey}`}
          className="relative z-[1] hidden flex-1 items-center justify-center pb-6 pt-2 md:flex md:px-6 md:pb-8 md:pt-8"
          {...mascotMotion}
        >
          <div className="flex w-full max-w-[min(100%,320px)] items-center justify-center will-change-transform md:max-w-[340px]">
            <PromoSliderMascot className="mx-auto h-auto w-full max-w-[280px] drop-shadow-sm md:max-w-[300px]" />
          </div>
        </motion.div>

        <div
          className="pointer-events-none relative z-[2] mx-auto mb-5 mt-3 w-[calc(100%-2rem)] max-w-[288px] shrink-0 md:absolute md:left-1/2 md:top-1/2 md:mb-0 md:mt-0 md:h-[450px] md:w-[300px] md:max-w-none md:-translate-x-1/2 md:-translate-y-1/2 md:rotate-[-6deg]"
          aria-hidden
        >
          <motion.div
            key={`img-${mountKey}`}
            className="h-full w-full"
            {...imageMotion}
          >
            {/* Mobile: moldura preta só no wrapper interno; aspect-ratio fica na área da foto (evita vazar sobre o anel). */}
            <div className="rounded-2xl bg-black p-[2px] shadow-sm md:h-full md:w-full md:rounded-none md:bg-transparent md:p-0 md:shadow-none">
              <div className="relative isolate w-full overflow-hidden rounded-[14px] bg-[#e8e6e0] aspect-[4/5] md:aspect-auto md:h-full md:w-full md:rounded-2xl md:border-2 md:border-black">
                {slide.centerImage ? (
                  <div className="absolute inset-0 overflow-hidden rounded-[14px] md:rounded-2xl">
                    <Image
                      src={publicAssetUrl(slide.centerImage)}
                      alt=""
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 768px) 42vw, 220px"
                      unoptimized
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function HomePromoSlider({
  sectionContent,
}: HomePromoSliderProps) {
  const { slides } = getPromoSliderConfig(sectionContent);
  const [active, setActive] = useState(0);
  const [replayKey, setReplayKey] = useState(0);
  const count = slides.length;
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const prevActiveRef = useRef(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (prevActiveRef.current !== active) {
      setReplayKey((k) => k + 1);
      prevActiveRef.current = active;
    }
  }, [active]);

  const go = useCallback(
    (index: number) => {
      if (count === 0) return;
      setActive(((index % count) + count) % count);
    },
    [count],
  );

  const onTouchStart = (e: React.TouchEvent) => {
    if (count <= 1) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (count <= 1) return;
    if (touchStartX.current == null || touchStartY.current == null) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const dx = endX - touchStartX.current;
    const dy = endY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    const thresholdPx = 48;
    if (Math.abs(dx) < thresholdPx) return;
    if (Math.abs(dx) < Math.abs(dy) * 1.15) return;
    setActive((prev) => {
      const next = dx < 0 ? prev + 1 : prev - 1;
      return ((next % count) + count) % count;
    });
  };

  const onTouchCancel = () => {
    touchStartX.current = null;
    touchStartY.current = null;
  };

  if (count === 0) {
    return null;
  }

  return (
    <section className="w-full pb-8 pt-2 px-0 md:pb-10 md:pt-4">
      <div className="mx-auto max-w-7xl">
        <div
          className="touch-pan-y overflow-hidden shadow-sm"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchCancel}
        >
          <motion.div
            className="flex will-change-transform "
            style={{ width: `${slides.length * 100}%` }}
            initial={false}
            animate={{
              x: `-${(100 / slides.length) * active}%`,
            }}
            transition={
              reduceMotion
                ? { duration: 0.38, ease: motionEase }
                : springCarousel
            }
          >
            {slides.map((slide, i) => (
              <div
                key={slide.id}
                className="shrink-0 px-5 md:px-8"
                style={{ width: `${100 / slides.length}%` }}
              >
                <SlidePanel
                  slide={slide}
                  isActive={i === active}
                  replayKey={replayKey}
                />
              </div>
            ))}
          </motion.div>
        </div>

        {count > 1 ? (
          <div className="mt-4 flex justify-center gap-3 md:mt-5">
            {slides.map((s, i) => (
              <motion.button
                key={s.id}
                type="button"
                onClick={() => go(i)}
                className="h-3 w-3 rounded-full border-2 border-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40 md:h-3.5 md:w-3.5"
                style={{ background: BANNER_YELLOW }}
                aria-label={`Slide ${i + 1}`}
                aria-current={i === active}
                animate={{
                  scale: i === active ? 1.22 : 1,
                  opacity: i === active ? 1 : 0.5,
                }}
                transition={
                  reduceMotion
                    ? { duration: 0.2 }
                    : { type: "spring", stiffness: 400, damping: 28 }
                }
                whileHover={
                  reduceMotion
                    ? undefined
                    : { scale: i === active ? 1.28 : 1.12 }
                }
                whileTap={reduceMotion ? undefined : { scale: 0.9 }}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
