"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type Props = { children: ReactNode; delay?: number; className?: string };

/** Fades and lifts content in as it scrolls into view; a plain fade if motion is reduced. */
export function Reveal({ children, delay = 0, className }: Props) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ type: "spring", bounce: 0, duration: 0.7, delay }}
    >
      {children}
    </motion.div>
  );
}
