import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="border-t hairline">
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-ink-2">
              Farmland, tokenised. Farmora turns verified agricultural land into
              shareable digital assets on the Monad network.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-3">
              Explore
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-2">
              <li><Link className="hover:text-ink" href="/parcels">Browse parcels</Link></li>
              <li><Link className="hover:text-ink" href="/dashboard">Your portfolio</Link></li>
              <li><Link className="hover:text-ink" href="/#how-it-works">How it works</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-3">
              Network
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-2">
              <li><a className="hover:text-ink" href="https://www.monad.xyz/" target="_blank" rel="noreferrer">Monad</a></li>
              <li><a className="hover:text-ink" href="https://docs.monad.xyz/" target="_blank" rel="noreferrer">Monad docs</a></li>
              <li><a className="hover:text-ink" href="https://monadscan.com/" target="_blank" rel="noreferrer">Monadscan</a></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-3">
              Project
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-2">
              <li><a className="hover:text-ink" href="https://blitz.devnads.com/events/monad-blitz-bangalore-v5" target="_blank" rel="noreferrer">Monad Blitz</a></li>
              <li><a className="hover:text-ink" href="#top">Built for a hackathon</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t hairline pt-6 text-xs text-ink-3 sm:flex-row sm:items-center">
          <p>Farmora. RWA farmland on Monad.</p>
          <p>Demo build, not investment advice.</p>
        </div>
      </div>
    </footer>
  );
}
