import Image from "next/image";

const SEGMENTS = 18;
const LABEL = "VAGABUNDO ILUMINADO";

function TiragemSegments({ idPrefix }: { idPrefix: string }) {
  return (
    <>
      {Array.from({ length: SEGMENTS }, (_, i) => (
        <span
          key={`${idPrefix}-${i}`}
          className="inline-flex items-center gap-2 sm:gap-3 md:gap-4 shrink-0 px-2 sm:px-3"
        >
          <Image
            src="/LOGO2.png"
            alt=""
            width={36}
            height={36}
            className="h-5 w-5 sm:h-6 sm:w-6 object-contain"
          />
          <span className="text-black font-light uppercase text-sm md:text-base tracking-wide whitespace-nowrap leading-none">
            {LABEL}
          </span>
        </span>
      ))}
    </>
  );
}

/**
 * Faixa full-bleed (100vw), acima do conteúdo, com texto indo para o lado (marquee).
 */
export default function BrandTiragem() {
  return (
    <div
      className="relative z-30 flex h-[65px] w-screen max-w-[100vw] items-center left-1/2 -translate-x-1/2 border-y-2 border-black bg-[#FFFF04] overflow-hidden select-none pointer-events-none"
      aria-hidden
    >
      <div className="flex h-full w-max min-h-0 items-center animate-brand-tiragem will-change-transform">
        <div className="flex h-full shrink-0 items-center">
          <TiragemSegments idPrefix="a" />
        </div>
        <div className="flex h-full shrink-0 items-center" aria-hidden>
          <TiragemSegments idPrefix="b" />
        </div>
      </div>
    </div>
  );
}
