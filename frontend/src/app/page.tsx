import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { HeroLedger } from "@/components/site/hero-ledger";
import { LiveSection } from "@/components/site/live-section";
import { ModelFlow } from "@/components/site/model-flow";
import { SiteSection } from "@/components/site/section";
import { Reveal } from "@/components/site/reveal";
import { TokenLine } from "@/components/tokens/token-line";
import { TOKEN_REGISTRY, type RegistryToken } from "@/lib/tokens";
import { WaitlistForm } from "@/components/waitlist/waitlist-form";

const stayLines = [
  "Weekend · 2 nights",
  "Guided farm tour",
  "Produce picked that morning",
  "Booked on-chain, one slot per night",
];

const stripTokens: RegistryToken[] = [
  TOKEN_REGISTRY.find((t) => t.kind === "mUSDC"),
  TOKEN_REGISTRY.find((t) => t.kind === "LAND"),
  TOKEN_REGISTRY.find((t) => t.kind === "factory"),
].filter((t): t is RegistryToken => t !== undefined);

export default function Home() {
  return (
    <main className="flex-1">
      <HeroLedger />

      <SiteSection
        id="harvests"
        title="The harvests, as they stand now."
        subtitle="These figures are not screenshots of a spreadsheet — each one is read from the deployed contracts the moment you load this page."
      >
        <Reveal>
          <LiveSection />
        </Reveal>
      </SiteSection>

      <SiteSection
        id="model"
        title="Hold to the harvest. Exit early and the points move."
        subtitle="Your split is 70 / 30 the moment you buy and it stays yours at the harvest. Sell before it and a new buyer takes your stake: 5 points of the split move to the farmer for each year you held, while your money comes back after a 90-day cooldown — plus 1% a year of appreciation once a year has passed."
      >
        <Reveal>
          <ModelFlow />
        </Reveal>
      </SiteSection>

      <SiteSection id="stay">
        <Reveal>
          <div className="sticker-card grid items-center gap-12 p-8 sm:p-12 lg:grid-cols-2">
            <div>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl sm:leading-[1.1]">
                Own the land.
                <br />
                <span className="text-amber-600">Sleep on it.</span>
              </h2>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-zinc-600">
                A weekend at the farmhouse — farm tours, guided walks through your crop, and produce
                picked hours before you eat it. Bookings are transactions on-chain, so a night can
                only ever be reserved once.
              </p>
              <Link href="/stays" className="sticker-btn sticker-btn-amber mt-8">
                Book a stay
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="rounded-3xl border-2 border-ink-800 bg-zinc-50 p-6">
              {stayLines.map((line) => (
                <div
                  key={line}
                  className="flex items-center gap-3 border-b-2 border-ink-100 py-3.5 last:border-b-0"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-ink-800 bg-emerald-500 text-white shadow-[2px_2px_0_0_oklch(0.2_0.05_152)]">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  <span className="text-sm font-medium text-zinc-700">{line}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </SiteSection>

      <SiteSection
        id="wallet"
        title="Add the tokens to your wallet."
        subtitle="The settlement currency, the parcel tokens, and the factory that issues new land — one tap each. Full registry with every LAND address lives on the wallet page."
      >
        <Reveal>
          <div className="sticker-card overflow-hidden bg-white">
            <div className="flex items-center justify-between border-b-2 border-ink-800 bg-ink-100 px-4 py-3 sm:px-6">
              <span className="text-xs font-bold text-ink-800">Token</span>
              <span className="text-xs font-bold text-ink-800">Action</span>
            </div>
            {stripTokens.map((token) => (
              <TokenLine key={`${token.kind}-${token.batchId ?? "main"}`} token={token} />
            ))}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-ink-100 px-4 py-4 sm:px-6">
              <span className="text-sm text-zinc-600">
                LAND — {TOKEN_REGISTRY.filter((t) => t.kind === "LAND").length} parcel tokens, one per batch
              </span>
              <Link
                href="/add-tokens"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 transition-colors hover:text-emerald-600"
              >
                Open the full registry
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </SiteSection>

      <SiteSection id="waitlist" className="py-20">
        <Reveal>
          <div className="sticker-card bg-gradient-to-b from-amber-50 to-white p-8 sm:p-12 text-center">
            <div className="mx-auto max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink-800 bg-amber-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-ink-900 mb-6">
                Early Access
              </span>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
                Be first to the field.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-zinc-600">
                We're opening parcels in limited batches. Join the waitlist to get priority access
                when the next drop goes live — plus early-bird pricing on your first stay.
              </p>
              <WaitlistForm />
            </div>
          </div>
        </Reveal>
      </SiteSection>

      <section className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <Reveal>
          <div className="sticker-card relative overflow-hidden bg-emerald-900 px-8 py-16 text-center sm:px-16">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-600/40 blur-[80px]" />
            <div className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-amber-500/20 blur-[80px]" />
            <h2 className="mx-auto max-w-2xl font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Ready to open a position?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-emerald-200">
              The next harvest is on-chain. Choose a parcel, or come stay on the land first.
            </p>
            <div className="mx-auto mt-10 flex max-w-xl flex-wrap justify-center gap-4">
              <Link href="/marketplace" className="sticker-btn sticker-btn-amber">
                Invest in a parcel
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/stays"
                className="sticker-btn sticker-btn-outline !border-white !bg-white !text-emerald-900"
              >
                Stay the weekend
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
