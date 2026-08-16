import Link from "next/link";
import { Sprout } from "lucide-react";

const footerLinks = [
  { href: "/marketplace", label: "Parcels" },
  { href: "/portfolio", label: "Cropfolio" },
  { href: "/stays", label: "Stays" },
  { href: "/add-tokens", label: "Add to Wallet" },
  { href: "/admin", label: "Farm Ops" },
];

export function Footer() {
  return (
    <footer className="border-t-2 border-ink-800 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-ink-800 bg-sage-600 text-sage-50 shadow-[3px_3px_0_0_oklch(0.2_0.05_152)]">
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
          <nav className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm sm:grid-cols-3">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-medium text-zinc-600 transition-colors hover:text-emerald-700"
              >
                {link.label}
              </Link>
            ))}
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
