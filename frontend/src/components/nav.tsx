"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAccount } from "wagmi";
import { isAdminAddress } from "@/lib/config";
import { Logo } from "./logo";

export function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const isAdmin = isConnected && isAdminAddress(address);

  const links = [
    { href: "/marketplace", label: "Parcels" },
    { href: "/portfolio", label: "Cropfolio" },
    { href: "/stays", label: "Stays" },
    ...(isAdmin ? [{ href: "/admin", label: "Farm Ops" }] : []),
    { href: "/add-tokens", label: "Add to Wallet" },
  ];

  return (
    <header className="relative z-50 border-b-2 border-ink bg-paper">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-2 sm:flex" aria-label="Primary">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`chip transition-transform duration-150 hover:-translate-y-0.5 ${
                  active ? "bg-ink text-paper shadow-[3px_3px_0_rgba(43,38,29,0.25)]" : "bg-white hover:bg-paper-2"
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
            className="btn btn-sketch !px-3 !py-2 sm:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t-2 border-ink bg-paper sm:hidden">
          <nav className="flex flex-col gap-2 px-4 py-4" aria-label="Mobile">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`chip w-full justify-center ${
                  pathname === l.href ? "bg-ink text-paper" : "bg-white"
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
