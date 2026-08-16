"use client";

import type { LiveStats } from "@/lib/live-batch";
import { CountUp } from "./count-up";

function fmtUnits(value: bigint | undefined, digits = 0): string {
  if (value === undefined) return "—";
  const n = Number(value);
  return n.toLocaleString(undefined, { maximumFractionDigits: digits });
}

export function LiveStatsStrip({ stats }: { stats: (LiveStats | undefined)[] }) {
  const live = stats.filter((s): s is LiveStats => s?.state === "live");
  const weighted = live.reduce(
    (acc, s) => {
      const supply = s.totalSupply ?? BigInt(0);
      const share = s.investorShareBps ?? BigInt(0);
      return {
        shareNumerator: acc.shareNumerator + share * supply,
        supply: acc.supply + supply,
        acres: acc.acres + (s.totalAcres ?? BigInt(0)),
      };
    },
    { shareNumerator: BigInt(0), supply: BigInt(0), acres: BigInt(0) }
  );
  const sharePct =
    weighted.supply > BigInt(0) ? (Number(weighted.shareNumerator) / Number(weighted.supply)) / 100 : null;
  const totalAcres = weighted.acres > BigInt(0) ? fmtUnits(weighted.acres, 0) : null;
  const count = live.length;

  const cells = [
    {
      value: sharePct !== null ? `${sharePct.toLocaleString(undefined, { maximumFractionDigits: 1 })}%` : "—",
      num: sharePct ?? 0,
      decimals: 1,
      label: "Investor share",
      note: "supply-weighted across live parcels",
      accent: "text-emerald-700",
      bg: "bg-emerald-50",
    },
    {
      value: totalAcres ?? "—",
      num: totalAcres ? Number(totalAcres.replace(/,/g, "")) : 0,
      decimals: 0,
      label: "Acres on-chain",
      note: "read from contract storage",
      accent: "text-ink-900",
      bg: "bg-white",
    },
    {
      value: count > 0 ? String(count) : "—",
      num: count,
      decimals: 0,
      label: count === 1 ? "Live parcel" : "Live parcels",
      note: "verified on Monad Testnet",
      accent: "text-ink-900",
      bg: "bg-white",
    },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-3">
      {cells.map((cell, i) => (
        <div
          key={cell.label}
          className={`sticker-card animate-pop-in ${cell.bg} px-6 py-6`}
          style={{ animationDelay: `${i * 90}ms` }}
        >
          <div className={`font-heading text-4xl font-bold tabular ${cell.accent}`}>
            {cell.value === "—" ? (
              "—"
            ) : (
              <CountUp value={cell.num} decimals={cell.decimals} suffix={cell.value.includes("%") ? "%" : ""} />
            )}
          </div>
          <div className="mt-2 text-sm font-bold text-ink-800">{cell.label}</div>
          <div className="mt-0.5 text-xs text-zinc-500">{cell.note}</div>
        </div>
      ))}
    </div>
  );
}
