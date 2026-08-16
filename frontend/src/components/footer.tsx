import Link from "next/link";
import { Leaf } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t-2 border-ink-800">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-ink-800 bg-emerald-600 text-emerald-50 shadow-[3px_3px_0_0_var(--color-forest)]">
            <Leaf size={20} strokeWidth={2.5} />
          </span>
          <div>
            <p className="font-heading text-xl font-bold tracking-tight text-ink-900">Farmora</p>
            <p className="text-xs text-zinc-500">Real land. Real yield. No tractor required.</p>
          </div>
        </div>

        <div className="grid gap-6 text-sm sm:grid-cols-3">
          <div>
            <p className="font-heading font-bold text-ink-900">Explore</p>
            <ul className="mt-2 space-y-1.5 text-zinc-600">
              <li><Link className="hover:text-emerald-700" href="/marketplace">Parcels</Link></li>
              <li><Link className="hover:text-emerald-700" href="/portfolio">Cropfolio</Link></li>
              <li><Link className="hover:text-emerald-700" href="/stays">Stays</Link></li>
              <li><Link className="hover:text-emerald-700" href="/add-tokens">Add to Wallet</Link></li>
              <li><Link className="hover:text-emerald-700" href="/admin">Farm Ops</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-heading font-bold text-ink-900">Network</p>
            <ul className="mt-2 space-y-1.5 text-zinc-600">
              <li><a className="hover:text-emerald-700" href="https://www.monad.xyz/" target="_blank" rel="noreferrer">Monad</a></li>
              <li><a className="hover:text-emerald-700" href="https://docs.monad.xyz/" target="_blank" rel="noreferrer">Monad docs</a></li>
              <li><a className="hover:text-emerald-700" href="https://testnet.monadscan.com" target="_blank" rel="noreferrer">Monadscan</a></li>
              <li><a className="hover:text-emerald-700" href="https://faucet.monad.xyz" target="_blank" rel="noreferrer">Faucet</a></li>
            </ul>
          </div>
          <div>
            <p className="font-heading font-bold text-ink-900">Project</p>
            <ul className="mt-2 space-y-1.5 text-zinc-600">
              <li><a className="hover:text-emerald-700" href="https://blitz.devnads.com/events/monad-blitz-bangalore-v5" target="_blank" rel="noreferrer">Monad Blitz</a></li>
              <li><a className="hover:text-emerald-700" href="#top">Built for a hackathon</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t-2 border-ink-100">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-4 py-5 text-xs text-zinc-500 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <p>© 2026 Farmora. Built on Monad Testnet.</p>
          <p>NOT FINANCIAL ADVICE · TOKENIZED LAND IS A SPECULATIVE EXPERIMENT</p>
        </div>
      </div>
    </footer>
  );
}
