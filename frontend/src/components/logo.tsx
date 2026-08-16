import Link from "next/link";

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-2.5"
      aria-label="Farmora home"
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
          dark
            ? "border-paper/20 bg-paper/10"
            : "border-ink/15 bg-sage-50"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className={`h-5 w-5 ${dark ? "text-paper" : "text-sage-2"}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
        >
          <path
            d="M12 21c-3.5-1.5-5.5-4.3-5.5-8V6.5c2.5 0 4.5 1.6 5.5 3.5 1-1.9 3-3.5 5.5-3.5V13c0 3.7-2 6.5-5.5 8Z"
            strokeLinejoin="round"
          />
          <path d="M9 12c2 .6 4 .6 6 0" strokeLinecap="round" />
        </svg>
      </span>
      <span
        className={`font-display text-xl tracking-tight ${
          dark ? "text-paper" : "text-ink"
        }`}
      >
        Farmora
      </span>
    </Link>
  );
}
