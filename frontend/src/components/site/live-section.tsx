"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatUnits } from "viem";
import { LAND_BATCHES } from "@/lib/config";
import type { LandBatch } from "@/lib/config";
import type { LiveStats } from "@/lib/live-batch";
import { useAllLiveStats } from "./use-all-live-stats";
import { LiveStatsStrip } from "./stats-strip";

const cropAccent: Record<string, string> = {
  Saffron: "text-purple-700",
  Cordyceps: "text-orange-700",
  Mushroom: "text-stone-600",
  "Dragon Fruit": "text-pink-600",
  Pomegranate: "text-rose-700",
  Grapes: "text-violet-700",
  Turmeric: "text-yellow-700",
  Ginger: "text-amber-700",
};

function fmtUnits(value: bigint | undefined, digits = 0): string {
  if (value === undefined) return "—";
  const n = Number(formatUnits(value, 18));
  return n.toLocaleString(undefined, { maximumFractionDigits: digits });
}

function fmtAcres(value: bigint | undefined, fallback: number): string {
  if (value === undefined) return String(fallback);
  const n = Number(value);
  return n > 0 ? n.toLocaleString() : String(fallback);
}

function fmtPct(bps: bigint | undefined): string {
  if (bps === undefined) return "—";
  return `${(Number(bps) / 100).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`;
}

function StateTag({ state }: { state: LiveStats["state"] }) {
  if (state === "noAddress") {
    return (
      <span className="sticker-badge whitespace-nowrap bg-zinc-200 text-zinc-600">
        Not yet on-chain
      </span>
    );
  }
  if (state === "unavailable") {
    return (
      <span className="sticker-badge whitespace-nowrap bg-zinc-200 text-zinc-600">
        Awaiting verification
      </span>
    );
  }
  return (
    <span className="sticker-badge whitespace-nowrap bg-emerald-100 text-emerald-700">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-600" />
      </span>
      Live
    </span>
  );
}

function LedgerRow({
  batch,
  stats,
}: {
  batch: LandBatch;
  stats: LiveStats | undefined;
}) {
  const accent = cropAccent[batch.cropType] || "text-zinc-900";
  const effective = stats?.state === "live" ? stats : undefined;
  const isGhost = stats === undefined || stats.state !== "live";
  const state = stats?.state ?? "noAddress";

  const acres = fmtAcres(effective?.totalAcres, batch.acres);
  const price =
    effective?.pricePerToken !== undefined ? `$${fmtUnits(effective.pricePerToken, 2)}` : `$${batch.pricePerToken}`;
  const fixedReturn = effective?.fixedReturnBps !== undefined ? fmtPct(effective.fixedReturnBps) : "—";
  const remaining =
    effective?.availableTokens !== undefined
      ? fmtUnits(effective.availableTokens, 0)
      : Number(batch.totalSupply).toLocaleString();

  const cells = (
    <div className="grid w-full grid-cols-[1fr_auto] items-center gap-x-4 px-6 py-5 transition-colors duration-150 group-hover:bg-emerald-50/70 md:grid-cols-[2.4fr_1fr_1fr_1fr_1fr_3rem]">
      <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
        <span className="font-heading text-lg font-semibold text-ink-900 transition-colors duration-150 group-hover:text-emerald-700">{batch.cropType}</span>
        <span className="hidden text-sm text-zinc-500 sm:inline">{batch.firstHarvest}</span>
      </div>
      <span className="hidden text-right md:block">
        <span className={`font-heading text-base font-bold tabular ${accent}`}>{acres}</span>
        <span className="ml-1 text-sm text-zinc-500">acres</span>
      </span>
      <span className="hidden text-right text-sm tabular font-medium text-zinc-700 md:block">{price}</span>
      <span className="hidden text-right text-sm tabular font-medium text-zinc-700 md:block">{fixedReturn}</span>
      <span className="hidden text-right text-sm tabular font-medium text-zinc-700 md:block">{remaining}</span>
      <span className="hidden justify-end md:flex">
        {isGhost ? (
          <StateTag state={state} />
        ) : (
          <span className="flex items-center gap-1 font-bold text-emerald-700 transition-transform duration-150 group-hover:translate-x-1">
            View <ArrowRight className="h-4 w-4" />
          </span>
        )}
      </span>
      <span className="flex items-center gap-3 md:hidden">
        <span className="font-heading text-base font-bold text-emerald-700 tabular">{price}</span>
        <StateTag state={state} />
      </span>
    </div>
  );

  if (isGhost) {
    return <div className="opacity-60">{cells}</div>;
  }

  return (
    <Link href={`/batch/${batch.id}`} className="group block">
      {cells}
    </Link>
  );
}

function SkeletonRow() {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-4 px-6 py-5 md:grid-cols-[2.4fr_1fr_1fr_1fr_1fr_3rem]">
      <span className="animate-shimmer h-5 w-36 rounded-md" />
      <span className="hidden h-5 w-16 rounded-md bg-zinc-200 md:block" />
      <span className="hidden h-5 w-16 rounded-md bg-zinc-200 md:block" />
      <span className="hidden h-5 w-16 rounded-md bg-zinc-200 md:block" />
      <span className="hidden h-5 w-16 rounded-md bg-zinc-200 md:block" />
      <span className="hidden md:block" />
    </div>
  );
}

export function LiveSection() {
  const results = useAllLiveStats();
  const pending = results.some((r) => r.isPending);

  return (
    <>
      <LiveStatsStrip stats={results.map((r) => r.data)} />

      <div className="sticker-card mt-6 overflow-hidden bg-white">
        <div className="hidden grid-cols-[2.4fr_1fr_1fr_1fr_1fr_3rem] gap-4 border-b-2 border-ink-800 bg-ink-100 px-6 py-3 text-xs font-bold text-ink-800 md:grid">
          <span>Parcel</span>
          <span className="text-right">Acres</span>
          <span className="text-right">Price / token</span>
          <span className="text-right">Fixed / yr</span>
          <span className="text-right">Tokens left</span>
          <span />
        </div>
        <div className="divide-y-2 divide-ink-100">
          {pending
            ? LAND_BATCHES.map((_, i) => <SkeletonRow key={i} />)
            : LAND_BATCHES.map((batch, i) => (
                <LedgerRow key={batch.id} batch={batch} stats={results[i]?.data} />
              ))}
        </div>
      </div>

      <p className="mt-4 text-right text-xs text-zinc-500">
        Refreshes every 30s · read directly from contract storage
      </p>
    </>
  );
}
