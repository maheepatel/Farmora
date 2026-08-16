import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost";
  arrow?: boolean;
  className?: string;
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  arrow = false,
  className = "",
}: Props) {
  const base =
    "btn-spring inline-flex items-center justify-center gap-2.5 rounded-full px-6 py-3 text-sm font-medium";
  const styles =
    variant === "primary"
      ? "bg-sage-2 text-paper hover:bg-sage-3"
      : variant === "outline"
        ? "border border-ink/20 bg-transparent text-ink hover:border-ink/40 hover:bg-ink/[0.03]"
        : "text-sage-2 underline decoration-sage/40 underline-offset-4 hover:decoration-sage-2";
  return (
    <Link href={href} className={`${base} ${styles} ${className}`}>
      {children}
      {arrow && (
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-paper/20 text-paper transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
          <ArrowRight size={14} weight="bold" />
        </span>
      )}
    </Link>
  );
}
