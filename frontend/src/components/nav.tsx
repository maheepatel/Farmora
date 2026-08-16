"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Leaf } from "lucide-react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/marketplace", label: "Parcels" },
  { href: "/portfolio", label: "Cropfolio" },
  { href: "/stays", label: "Stays" },
  { href: "/admin", label: "Farm Ops" },
  { href: "/add-tokens", label: "Add to Wallet" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="relative z-50 border-b-2 border-ink-800 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2.5" aria-label="Farmora home">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-ink-800 bg-emerald-600 text-emerald-50 shadow-[3px_3px_0_0_var(--color-forest)] transition-transform group-hover:-translate-y-0.5">
            <Leaf size={20} strokeWidth={2.5} />
          </span>
          <span className="flex flex-col">
            <span className="font-heading text-2xl font-bold tracking-tight text-ink-900">
              Farmora
            </span>
            <span className="mt-0.5 hidden text-[10px] font-semibold tracking-wide text-zinc-500 min-[420px]:block">
              Real land. Real yield. No tractor required.
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex" aria-label="Primary">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all duration-150 border-2 ${
                  active
                    ? "border-ink-800 bg-white text-ink-900 shadow-[2px_2px_0_0_var(--color-forest)]"
                    : "border-transparent text-ink-600 hover:border-ink-800 hover:bg-white hover:text-ink-900 hover:shadow-[2px_2px_0_0_var(--color-forest)]"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ConnectButton showBalance={false} />
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink-800 bg-white text-ink-900 sm:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t-2 border-ink-800 bg-background sm:hidden">
          <nav className="flex flex-col gap-1 px-4 py-4" aria-label="Mobile">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-4 py-2.5 text-base font-semibold ${
                  pathname === l.href ? "bg-white text-emerald-700" : "text-ink-600 hover:bg-white"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
