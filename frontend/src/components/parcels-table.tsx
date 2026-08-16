"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getBatchMeta } from "@/lib/config";
import { useBatch } from "@/lib/contracts";
import { fmtTokens, fmtUSDC } from "@/lib/format";

export function ParcelsTable({ limit }: { limit?: number }) {
  const ids = limit ? Array.from({ length: limit }, (_, i) => i) : Array.from({ length: 8 }, (_, i) => i);

  return (
    <div className="sketch overflow-hidden bg-white">
      <div className="hidden grid-cols-[2.4fr_1fr_1fr_1fr_1fr_3rem] gap-4 border-b-2 border-ink/20 bg-paper-2 px-6 py-3 text-xs font-bold uppercase tracking-wide text-ink-2 md:grid">
        <span>Parcel</span>
        <span className="text-right">Acres</span>
        <span className="text-right">Price / token</span>
        <span className="text-right">Fixed / yr</span>
        <span className="text-right">Tokens left</span>
        <span />
      </div>
      <div className="divide-y-2 divide-ink/10">
        {ids.map((id) => (
          <ParcelRow key={id} id={id} />
        ))}
      </div>
    </div>
  );
}

function ParcelRow({ id }: { id: number }) {
  const meta = getBatchMeta(id);
  const batch = useBatch(id);
  const live = batch.state === "live";
  const d = batch.data;

  const cells: [string, boolean][] = [
    [
      `${meta.emoji} ${meta.cropType} · ${meta.tokenSymbol}`,
      false,
    ],
    [live ? String(meta.acres) : "…", true],
    [live ? `${fmtUSDC(d.pricePerToken)} mUSDC` : "…", true],
    [live ? `${(Number(d.fixedReturnBps) / 100).toFixed(0)}%` : "…", true],
    [live ? fmtTokens(d.availableTokens) : "…", true],
  ];

  return (
    <Link
      href={`/batch/${id}`}
      className="group grid grid-cols-[1fr_auto] items-center gap-4 px-6 py-5 transition-colors hover:bg-paper-2/70 md:grid-cols-[2.4fr_1fr_1fr_1fr_1fr_3rem]"
    >
      <span className="min-w-0 truncate font-display text-lg text-ink">
        {cells[0][0]}
      </span>
      <span className="hidden text-right text-sm text-ink-2 md:block">{cells[1][0]}</span>
      <span className="hidden text-right text-sm text-ink-2 md:block">{cells[2][0]}</span>
      <span className="hidden text-right text-sm text-ink-2 md:block">{cells[3][0]}</span>
      <span className="hidden text-right text-sm font-bold text-sage-2 md:block">
        {cells[4][0]}
      </span>
      <span className="justify-self-end text-ink-3 transition-colors group-hover:text-sage-2">
        <ArrowRight size={18} />
      </span>
    </Link>
  );
}
