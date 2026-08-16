"use client";

import Link from "next/link";
import { ArrowRight, ArrowDown } from "lucide-react";
import { useAllLiveStats } from "./use-all-live-stats";

export function HeroLedger() {
  const results = useAllLiveStats();
  const live = results.filter((r) => r.data?.state === "live");
  const pending = results.some((r) => r.isPending);
  const liveCount = live.length;
  const acres = live.reduce((acc, r) => acc + (r.data?.totalAcres ?? BigInt(0)), BigInt(0));
  const acresNum = acres > BigInt(0) ? Number(acres).toLocaleString() : null;

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 right-[-8%] h-[420px] w-[560px] rounded-full bg-amber-200/50 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-44 left-[-10%] h-[400px] w-[500px] rounded-full bg-emerald-200/50 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center">
          <div className="animate-pop-in min-w-0">
            <span className="sticker-badge bg-white text-emerald-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
              </span>
              Live on-chain · Monad Testnet
            </span>

            <h1 className="mt-5 font-heading text-5xl font-bold leading-[1.02] tracking-tight text-ink-900 sm:text-7xl">
              The farm is real.
              <br />
              <span className="text-emerald-700">The ledger is on-chain.</span>
            </h1>

            <p className="mt-5 max-w-lg text-lg leading-relaxed text-zinc-600">
              Invest in a parcel and earn from the harvest — or book a weekend on the land you own.
              Every figure on this page is read straight from the contract.
            </p>

            <div className="mt-7 flex flex-wrap gap-4">
              <Link href="/marketplace" className="sticker-btn">
                Invest in a parcel
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/stays" className="sticker-btn sticker-btn-amber">
                Stay the weekend
                <ArrowDown className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-zinc-600">
              {pending ? (
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Reading contract storage…
                </span>
              ) : (
                <>
                  <span className="sticker-badge bg-white text-ink-800">
                    <span className="font-bold text-emerald-700 tabular">{liveCount}/{results.length}</span> parcels live
                  </span>
                  <span className="sticker-badge bg-white text-ink-800">
                    <span className="font-bold tabular">{acresNum ?? "—"}</span> acres on-chain
                  </span>
                  <span className="sticker-badge bg-amber-100 text-amber-800">Verified on Monad</span>
                </>
              )}
            </div>
          </div>

          <div className="animate-pop-in delay-100 min-w-0">
            <div className="relative sticker-card overflow-hidden p-0">
              <video
                className="aspect-video max-h-44 w-full object-cover sm:max-h-56 md:max-h-64 lg:max-h-72"
                src="/videos/hero.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
              />
              <span className="absolute right-3 top-3 sticker-badge bg-amber-400 text-amber-950">
                your slice of it
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
