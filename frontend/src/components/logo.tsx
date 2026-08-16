import Link from "next/link";

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-2.5"
      aria-label="Farmora home"
    >
      <span
        className={`sketch-xs flex h-10 w-10 items-center justify-center border-2 transition-transform group-hover:-rotate-6 ${
          dark ? "bg-sage2" : "bg-sage"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6 text-paper"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M12 21c-3.5-1.5-5.5-4.3-5.5-8V7.5" />
          <path d="M12 21c3.5-1.5 5.5-4.3 5.5-8V7.5" />
          <path d="M12 13.5c0-2.5 1.5-4.5 3.5-5.5" />
          <path d="M12 13.5c0-2.5-1.5-4.5-3.5-5.5" />
          <path d="M12 13.5V5" />
        </svg>
      </span>
      <span
        className={`font-display text-2xl tracking-wide ${
          dark ? "text-paper" : "text-ink"
        }`}
      >
        Farmora
      </span>
    </Link>
  );
}
