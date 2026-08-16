import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function Arrow({
  className = "",
  down = false,
}: {
  className?: string;
  down?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={`h-8 w-8 shrink-0 text-ink ${down ? "rotate-90" : ""} ${className}`}
      aria-hidden
    >
      <path
        d="M6 24c9-6 19-5 30 1"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M30 12c5 5 9 9 12 13l-14 2"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
