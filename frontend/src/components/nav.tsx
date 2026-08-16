"use client";

import { List, X, Wallet } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useWallet } from "@/lib/store";
import { Logo } from "./logo";

const links = [
  { href: "/", label: "Home" },
  { href: "/parcels", label: "Parcels" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Nav() {
  const { state, connect } = useWallet();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const shortAddress = state.address
    ? `${state.address.slice(0, 6)}...${state.address.slice(-4)}`
    : null;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled || open
          ? "bg-paper/85 backdrop-blur-md shadow-[0_1px_0_var(--color-hairline)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-4 py-2 text-sm transition-colors ${
                pathname === l.href
                  ? "bg-sage-50 text-sage-2"
                  : "text-ink-2 hover:text-ink"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {state.address ? (
            <Link
              href="/dashboard"
              className="btn-spring hidden items-center gap-2 rounded-full border border-ink/15 bg-sage-50 px-4 py-2 text-sm font-medium text-sage-2 md:inline-flex"
            >
              <Wallet size={15} weight="regular" />
              {shortAddress}
            </Link>
          ) : (
            <button
              type="button"
              onClick={connect}
              className="btn-spring hidden items-center gap-2 rounded-full bg-sage-2 px-5 py-2 text-sm font-medium text-paper hover:bg-sage-3 md:inline-flex"
            >
              <Wallet size={15} weight="regular" />
              Connect wallet
            </button>
          )}

          <button
            type="button"
            className="btn-spring inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={18} /> : <List size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t hairline bg-paper md:hidden">
          <nav className="flex flex-col gap-1 px-4 py-4" aria-label="Mobile">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-4 py-3 text-base ${
                  pathname === l.href
                    ? "bg-sage-50 text-sage-2"
                    : "text-ink hover:bg-paper-2"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => {
                connect();
                setOpen(false);
              }}
              className="mt-2 rounded-full bg-sage-2 px-5 py-3 text-sm font-medium text-paper"
            >
              {state.address ? shortAddress : "Connect wallet"}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
