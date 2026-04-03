"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import Filters from "./Filters";
import ShopMobileFilters from "./ShopMobileFilters";

type ShopShellProps = {
  title: string;
  children: React.ReactNode;
};

const shellEase = [0.21, 0.45, 0.32, 0.9] as const;

const ShopShell = ({ title, children }: ShopShellProps) => {
  const isMdUp = useMediaQuery("(min-width: 768px)");
  const reduceMotion = useReducedMotion();

  return (
    <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-x-12 gap-y-5">
      {isMdUp === true ? (
        reduceMotion ? (
          <aside className="min-w-0 pr-4">
            <Filters />
          </aside>
        ) : (
          <motion.aside
            className="min-w-0 pr-4"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.4,
              ease: shellEase,
              delay: 0.06,
            }}
          >
            <Filters />
          </motion.aside>
        )
      ) : null}

      {reduceMotion ? (
        <div className="min-w-0">
          {isMdUp !== true ? (
            <ShopMobileFilters title={title} />
          ) : null}
          {children}
        </div>
      ) : (
        <motion.div
          className="min-w-0"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: shellEase, delay: 0.03 }}
        >
          {isMdUp !== true ? (
            <ShopMobileFilters title={title} />
          ) : null}
          {children}
        </motion.div>
      )}
    </div>
  );
};

export default ShopShell;
