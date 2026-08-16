"use client";

import Link from "next/link";
import { Sprout } from "lucide-react";
import { useAccount } from "wagmi";
import { isAdminAddress } from "@/lib/config";
import { ClientOnly } from "@/lib/client-only";

const footerLinks = [
  { href: "/marketplace", label: "Parcels" },
  { href: "/portfolio", label: "Cropfolio" },
  { href: "/stays", label: "Stays" },
];

function AdminFooterLink() {
  const { address } = useAccount();
  const isAdmin = isAdminAddress(address as `0x${string}` | undefined);

  if (!isAdmin) return null;

  return (
    <Link
      href="/admin"
      className="font-medium text-zinc-600 transition-colors hover:text-primary-600"
    >
      Farm Ops
    </Link>
  );
}

function WalletFooterLink() {
  const { isConnected } = useAccount();

  if (!isConnected) return null;

  return (
    <Link
      href="/add-tokens"
      className="font-medium text-zinc-600 transition-colors hover:text-primary-600"
    >
      Add to Wallet
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="border-t-2 border-ink-800 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-ink-800 bg-primary-600 text-primary-50 shadow-[3px_3px_0_0_oklch(0.2_0.05_152)]">
                <Sprout className="h-4 w-4" />
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-heading text-xl font-bold tracking-tight text-ink-900">
                  Farmora
                </span>
                <span className="mt-1 text-[10px] font-medium tracking-wide text-zinc-500">
                  Real land. Real yield. No tractor required.
                </span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-zinc-600">
              Fractional acres of premium farmland on Monad. Every figure on this site is read
              straight from the contract — nothing is drawn the chain has not said.
            </p>
          </div>
          <nav className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm sm:grid-cols-4">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-medium text-zinc-600 transition-colors hover:text-primary-600"
              >
                {link.label}
              </Link>
            ))}
            <ClientOnly>
              <AdminFooterLink />
            </ClientOnly>
            <ClientOnly>
              <WalletFooterLink />
            </ClientOnly>
          </nav>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t-2 border-ink-100 pt-6 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Farmora. Built on Monad Testnet.</p>
          <p className="tracking-wide">NOT FINANCIAL ADVICE · TOKENIZED LAND IS A SPECULATIVE EXPERIMENT</p>
        </div>
      </div>
    </footer>
  );
}
