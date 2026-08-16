"use client";

import { TrendUp } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import type { Parcel } from "@/lib/parcels";
import { useWallet } from "@/lib/store";
import { formatINR } from "@/lib/format";

export function YieldSimulator({ parcel }: { parcel: Parcel }) {
  const { state, stakeAll } = useWallet();
  const [months, setMonths] = useState(12);
  const [staked, setStaked] = useState(false);

  const principal = 10000;
  const monthlyRate = parcel.annualYieldPct / 100 / 12;
  const projected = Math.round(principal * monthlyRate * months);
  const projectedCompounded = Math.round(
    principal * Math.pow(1 + monthlyRate, months) - principal,
  );

  return (
    <div className="rounded-[1.5rem] bg-paper-2 p-6 ring-1 ring-ink/10 md:p-8">
      <div className="flex items-center gap-2">
        <TrendUp size={18} className="text-sage-2" />
        <h3 className="font-display text-2xl text-ink">Yield simulator</h3>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-ink-2">
        See what a {formatINR(principal)} stake in this parcel could earn at
        the current {parcel.annualYieldPct.toFixed(1)}% annual yield.
      </p>

      <div className="mt-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-2">Holding period</span>
          <span className="font-semibold text-ink">
            {months} {months === 1 ? "month" : "months"}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={36}
          value={months}
          onChange={(e) => setMonths(Number(e.target.value))}
          aria-label="Holding period in months"
          className="mt-3 w-full accent-sage-2"
        />
        <div className="mt-1 flex justify-between text-xs text-ink-3">
          <span>1</span>
          <span>36</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-paper p-4 ring-1 ring-ink/10">
          <p className="text-[11px] uppercase tracking-[0.12em] text-ink-3">
            Simple return
          </p>
          <p className="mt-1 font-display text-2xl text-ink">
            {formatINR(projected)}
          </p>
        </div>
        <div className="rounded-2xl bg-paper p-4 ring-1 ring-ink/10">
          <p className="text-[11px] uppercase tracking-[0.12em] text-ink-3">
            Compounded
          </p>
          <p className="mt-1 font-display text-2xl text-sage-2">
            {formatINR(projectedCompounded)}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          if (!state.address) return;
          stakeAll();
          setStaked(true);
        }}
        disabled={!state.address || staked}
        className="btn-spring mt-6 w-full rounded-full bg-sage-2 px-6 py-3.5 text-sm font-medium text-paper hover:bg-sage-3 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {!state.address
          ? "Connect wallet to stake"
          : staked
            ? "Yield accruing in your dashboard"
            : "Stake my shares"}
      </button>
      <p className="mt-3 text-xs leading-relaxed text-ink-3">
        Simulated figures only. Real payouts on Monad testnet would be
        distributed per harvest settlement.
      </p>
    </div>
  );
}
