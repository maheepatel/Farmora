import Link from "next/link";
import { SiteSection } from "@/components/site/section";
import { Reveal } from "@/components/site/reveal";
import { TokenRow } from "@/components/tokens/token-row";
import { TOKEN_REGISTRY, CHAIN_INFO } from "@/lib/tokens";

export default function AddTokensPage() {
  const mUsdc = TOKEN_REGISTRY.find((t) => t.kind === "mUSDC");
  const landCount = TOKEN_REGISTRY.filter((t) => t.kind === "LAND").length;

  return (
    <main className="flex-1">
      <SiteSection
        title="The token registry."
        subtitle="Add the tokens to your wallet in one tap. The parcel tokens, the settlement currency, and the factory that issues new land — all on Monad Testnet, chain 10143."
      >
        <Reveal>
          <div className="sticker-card border-2 border-ink-800 bg-white">
            <div className="grid gap-x-8 gap-y-3 px-4 py-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
              <div>
                <div className="text-xs font-bold text-zinc-500">Network</div>
                <div className="mt-1 text-base font-bold text-ink-900">{CHAIN_INFO.name}</div>
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-500">Chain id</div>
                <div className="mt-1 font-mono text-base font-bold text-ink-900 tabular">{CHAIN_INFO.id}</div>
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-500">Settlement</div>
                <div className="mt-1 text-base font-bold text-emerald-700">mUSDC · 18 decimals</div>
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-500">Explorer</div>
                <Link
                  href={CHAIN_INFO.explorer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-base font-bold text-ink-900 underline decoration-zinc-300 underline-offset-4 transition-colors hover:text-emerald-700"
                >
                  testnet.monadscan.com ↗
                </Link>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-10">
          <div className="sticker-card overflow-hidden bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink-800 bg-ink-100 px-4 py-3 sm:px-6">
              <p className="text-sm font-bold text-ink-800">
                {TOKEN_REGISTRY.length} entries · one chain
              </p>
              <p className="text-sm font-bold text-ink-800 tabular">
                {landCount} LAND parcels · {mUsdc ? "1" : "0"} mUSDC · 1 factory
              </p>
            </div>
            <div>
              {TOKEN_REGISTRY.map((token) => (
                <TokenRow key={`${token.kind}-${token.batchId ?? "main"}`} token={token} />
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-10 max-w-2xl">
          <div className="sticker-card border-2 border-ink-800 bg-amber-50 p-6">
            <p className="font-heading text-xl font-bold text-ink-900">How it works</p>
            <ol className="mt-4 space-y-3 text-base leading-relaxed text-zinc-600">
              <li>
                <span className="font-bold text-amber-700 tabular">01</span>{" "}
                <span className="font-semibold">Add mUSDC</span> — the test
                currency the farm mints for liquidity.
              </li>
              <li>
                <span className="font-bold text-amber-700 tabular">02</span>{" "}
                <span className="font-semibold">Add the LAND parcel tokens</span> for the batches you want to track — each batch is its own token.
              </li>
              <li>
                <span className="font-bold text-amber-700 tabular">03</span> The factory address is
                for reference; it is a contract, not a token.
              </li>
            </ol>
          </div>
        </Reveal>

        <Reveal className="mt-10">
          <div className="sticker-card flex flex-wrap items-center justify-between gap-4 border-2 border-ink-800 bg-white px-4 py-6 sm:px-6">
            <p className="text-sm font-bold text-zinc-500">
              Then check the books
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/marketplace"
                className="sticker-btn sticker-btn-outline !px-5 !py-2.5 text-sm"
              >
                Marketplace
              </Link>
              <Link
                href="/portfolio"
                className="sticker-btn sticker-btn-outline !px-5 !py-2.5 text-sm"
              >
                Cropfolio
              </Link>
              <Link
                href="/stays"
                className="sticker-btn sticker-btn-amber !px-5 !py-2.5 text-sm"
              >
                Book a stay
              </Link>
            </div>
          </div>
        </Reveal>
      </SiteSection>
    </main>
  );
}
