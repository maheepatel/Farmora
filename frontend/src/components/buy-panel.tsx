"use client";

import { CheckCircle, Lightning, Wallet } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Parcel } from "@/lib/parcels";
import { useWallet } from "@/lib/store";
import { formatINR } from "@/lib/format";

const presets = [10, 50, 100, 500];

export function BuyPanel({ parcel }: { parcel: Parcel }) {
  const { state, connect, buyShares } = useWallet();
  const [shares, setShares] = useState<number | "">(100);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const remaining = parcel.totalShares - parcel.soldShares;
  const cost = useMemo(
    () => (typeof shares === "number" ? Math.round(shares * parcel.sharePrice) : 0),
    [shares, parcel.sharePrice],
  );

  function handleBuy() {
    setStatus("idle");
    setError("");
    if (!state.address) {
      connect();
      return;
    }
    const qty = typeof shares === "number" ? shares : 0;
    if (qty <= 0) {
      setError("Enter a number of shares first.");
      setStatus("error");
      return;
    }
    if (qty > remaining) {
      setError(`Only ${remaining.toLocaleString("en-IN")} shares remain.`);
      setStatus("error");
      return;
    }
    if (cost > state.balance) {
      setError(
        `You need ${formatINR(cost)} but your balance is ${formatINR(state.balance)}.`,
      );
      setStatus("error");
      return;
    }
    buyShares(parcel.id, qty, parcel.sharePrice);
    setStatus("success");
  }

  return (
    <div className="rounded-[1.5rem] bg-paper-2 p-6 ring-1 ring-ink/10 md:p-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-ink-3">
            Share price
          </p>
          <p className="mt-1 font-display text-4xl text-ink">
            {formatINR(parcel.sharePrice)}
          </p>
        </div>
        <div className="text-right text-sm text-ink-2">
          <p>
            <span className="font-semibold text-ink">
              {parcel.annualYieldPct.toFixed(1)}%
            </span>{" "}
            annual yield
          </p>
          <p className="mt-0.5 text-xs text-ink-3">
            {remaining.toLocaleString("en-IN")} shares left
          </p>
        </div>
      </div>

      <div className="mt-6">
        <label
          htmlFor="shares"
          className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-2"
        >
          Shares to buy
        </label>
        <input
          id="shares"
          type="number"
          min={1}
          max={remaining}
          value={shares}
          onChange={(e) => {
            const v = e.target.value;
            setShares(v === "" ? "" : Math.max(0, Number(v)));
            setStatus("idle");
            setError("");
          }}
          className="mt-2 w-full rounded-2xl border border-ink/15 bg-paper px-4 py-3 text-lg text-ink focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setShares(p);
                setStatus("idle");
                setError("");
              }}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                shares === p
                  ? "border-sage-2 bg-sage-2 text-paper"
                  : "border-ink/15 text-ink-2 hover:border-ink/30"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t hairline pt-5">
        <span className="text-sm text-ink-2">Total cost</span>
        <span className="font-display text-2xl text-ink">{formatINR(cost)}</span>
      </div>

      {status === "success" ? (
        <div className="mt-6 rounded-2xl bg-sage-50 p-4 text-sm text-sage-2 ring-1 ring-sage/30">
          <p className="flex items-center gap-2 font-medium">
            <CheckCircle size={18} weight="fill" />
            Purchase placed in your portfolio
          </p>
          <p className="mt-1 text-xs text-ink-2">
            This is a demo transaction. On Monad testnet it would settle in a
            block.
          </p>
          <Link
            href="/dashboard"
            className="mt-3 inline-flex rounded-full bg-sage-2 px-4 py-2 text-xs font-medium text-paper hover:bg-sage-3"
          >
            View dashboard
          </Link>
        </div>
      ) : (
        <>
          {status === "error" && (
            <p className="mt-5 rounded-2xl bg-harvest/10 p-3 text-sm text-harvest-2 ring-1 ring-harvest/30">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={handleBuy}
            disabled={typeof shares === "number" && shares <= 0}
            className="btn-spring mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-sage-2 px-6 py-3.5 text-sm font-medium text-paper hover:bg-sage-3 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Wallet size={16} weight="regular" />
            {state.address ? `Buy for ${formatINR(cost)}` : "Connect wallet to buy"}
          </button>
        </>
      )}

      <div className="mt-5 flex items-center gap-2 text-xs text-ink-3">
        <Lightning size={13} />
        Demo build: wallet, purchases and yield are simulated in your browser
        until Monad contracts go live.
      </div>
    </div>
  );
}
