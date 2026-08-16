import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="relative mt-16 border-t-2 border-ink bg-paper-2">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-2">
            Real land. Real yield. No tractor required. Every figure on the
            site is read straight from the contracts on Monad Testnet.
          </p>
        </div>

        <div>
          <p className="font-display text-xl text-ink">Explore</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-2">
            <li><Link className="hover:text-sage-2 hover:underline" href="/marketplace">Parcels</Link></li>
            <li><Link className="hover:text-sage-2 hover:underline" href="/portfolio">Cropfolio</Link></li>
            <li><Link className="hover:text-sage-2 hover:underline" href="/stays">Stays</Link></li>
            <li><Link className="hover:text-sage-2 hover:underline" href="/add-tokens">Add to Wallet</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-display text-xl text-ink">Network</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-2">
            <li><a className="hover:text-sage-2 hover:underline" href="https://www.monad.xyz/" target="_blank" rel="noreferrer">Monad</a></li>
            <li><a className="hover:text-sage-2 hover:underline" href="https://docs.monad.xyz/" target="_blank" rel="noreferrer">Monad docs</a></li>
            <li><a className="hover:text-sage-2 hover:underline" href="https://testnet.monadscan.com" target="_blank" rel="noreferrer">Monadscan</a></li>
            <li><a className="hover:text-sage-2 hover:underline" href="https://faucet.monad.xyz" target="_blank" rel="noreferrer">Faucet</a></li>
          </ul>
        </div>

        <div>
          <p className="font-display text-xl text-ink">Project</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-2">
            <li><a className="hover:text-sage-2 hover:underline" href="https://blitz.devnads.com/events/monad-blitz-bangalore-v5" target="_blank" rel="noreferrer">Monad Blitz</a></li>
            <li><a className="hover:text-sage-2 hover:underline" href="https://testnet.monadscan.com" target="_blank" rel="noreferrer">Contract explorer</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t-2 border-ink/20">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-4 py-5 text-xs text-ink-3 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <p>© 2026 Farmora. Built on Monad Testnet.</p>
          <p>NOT FINANCIAL ADVICE · TOKENIZED LAND IS A SPECULATIVE EXPERIMENT</p>
        </div>
      </div>
    </footer>
  );
}
