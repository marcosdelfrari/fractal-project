"use client";

import React from "react";
import Link from "next/link";
import { HiArrowDownRight } from "react-icons/hi2";
import {
  getUpcomingEventsConfig,
  type UpcomingEventsSectionContent,
} from "@/lib/sectionContent";

type Props = {
  sectionContent?: unknown;
};

const ink = "#500000";
const yellow = "#FFFF00";

export default function HomeUpcomingEvents({ sectionContent }: Props) {
  const cfg: UpcomingEventsSectionContent =
    getUpcomingEventsConfig(sectionContent);

  return (
    <section
      className="relative w-full overflow-hidden border-0 bg-[#FFFF00] pb-12 pt-10 text-[#500000] outline-none sm:pb-16 sm:pt-12"
      aria-labelledby="upcoming-events-heading"
    >
      {/* Linha vertical pontilhada (guia visual, alinhada ao “P” do título) */}
      <div className="max-w-7xl mx-auto">
        <Link
          href={cfg.arrowHref || "/loja"}
          className="absolute left-4 top-6 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-[#500000] text-[#FFFF00] shadow-sm transition hover:brightness-110 sm:left-8 sm:top-8 sm:h-14 sm:w-14"
          style={{ backgroundColor: ink, color: yellow }}
          aria-label="Ver mais"
        >
          <HiArrowDownRight className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
        </Link>

        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-8">
          <h2
            id="upcoming-events-heading"
            className="mx-auto max-w-4xl pt-2 text-center font-playball text-5xl leading-[0.95] tracking-tight sm:text-6xl md:text-[96px] md:leading-[0.92]"
            style={{ transform: "skewX(-6deg)" }}
          >
            <span className="block">{cfg.line1}</span>
            <span className="mt-1 block pl-8 sm:pl-12 md:pl-16">
              {cfg.line2}
            </span>
          </h2>

          <div className="mt-8 sm:mt-12">
            {cfg.events.map((row, index) => (
              <div
                key={row.id}
                className={`relative grid grid-cols-1 gap-y-1 border-dotted px-1 py-4 font-economica text-sm uppercase tracking-wide sm:grid-cols-3 sm:gap-4 sm:px-0 sm:py-5 sm:text-sm md:text-base ${
                  index === 0
                    ? "border-b-2 border-dotted border-[#500000]"
                    : "border-b border-dotted border-[#500000]"
                }`}
              >
                <div className="text-center font-bold text-2xl leading-tight sm:text-left sm:text-sm md:text-base">
                  {row.title}
                </div>
                <div className="text-center font-normal opacity-90 leading-snug sm:text-center sm:opacity-100">
                  {row.date}
                </div>
                <div className="text-center font-normal opacity-90 leading-snug sm:text-right sm:opacity-100">
                  {row.location}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
