"use client";

import {
  ArrowRight,
  Coins,
  HandCoins,
  Wallet,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { parcels } from "@/lib/parcels";
import { useWallet } from "@/lib/store";
import { formatINR, formatShares } from "@/lib/format";

export default function Dashboard() {
  const { state, connect, stakeAll, claimYield } = useWallet();
  const address = state.address;

  const holdingRows = state.holdings
    .map((h) => {
      const parcel = parcels.find((p) => p.id === h.parcelId);
      return parcel ? { ...h, parcel } : null;
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  const portfolioValue = holdingRows.reduce(
    (sum, r) => sum + r.parcel.sharePrice * r.shares,
    0,
  );

  if (!address) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sage-50 ring-1 ring-sage/30">
          <Wallet size={26} className="text-sage-2" />
        </span>
        <h1 className="mt-6 font-display text-4xl text-ink">Connect to view your farm</h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-2">
          Your parcels, shares and pending yield live here. Connect a wallet to
          get started.
        </p>
        <button
          type="button"
          onClick={connect}
          className="btn-spring mt-8 rounded-full bg-sage-2 px-6 py-3 text-sm font-medium text-paper hover:bg-sage-3"
        >
          Connect wallet
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-24 pt-16 sm:px-6 md:pt-24">
      <header className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sage-2">
            Your portfolio
          </p>
          <h1 className="mt-3 font-display text-4xl tracking-tight text-ink sm:text-5xl">
            {address.slice(0, 6)}...{address.slice(-4)}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={stakeAll}
            disabled={state.holdings.length === 0}
            className="btn-spring rounded-full border border-ink/20 px-5 py-2.5 text-sm font-medium text-ink hover:border-ink/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Stake all
          </button>
          <Link
            href="/parcels"
            className="btn-spring rounded-full bg-sage-2 px-5 py-2.5 text-sm font-medium text-paper hover:bg-sage-3"
          >
            Explore parcels
          </Link>
        </div>
      </header>

      <section className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="rounded-[1.5rem] bg-sage-2 p-6 text-paper">
          <p className="text-[11px] uppercase tracking-[0.14em] text-paper/70">
            Portfolio value
          </p>
          <p className="mt-2 font-display text-4xl">{formatINR(portfolioValue)}</p>
          <p className="mt-2 text-sm text-paper/70">
            {formatShares(state.holdings.reduce((s, h) => s + h.shares, 0))} shares
          </p>
        </div>
        <div className="rounded-[1.5rem] bg-paper-2 p-6 ring-1 ring-ink/10">
          <p className="text-[11px] uppercase tracking-[0.14em] text-ink-3">
            Available balance
          </p>
          <p className="mt-2 font-display text-4xl text-ink">
            {formatINR(state.balance)}
          </p>
          <p className="mt-2 text-sm text-ink-2">Monad testnet MON</p>
        </div>
        <div className="flex flex-col justify-between rounded-[1.5rem] bg-paper-2 p-6 ring-1 ring-ink/10">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-ink-3">
              Pending yield
            </p>
            <p className="mt-2 font-display text-4xl text-sage-2">
              {formatINR(state.pendingYield)}
            </p>
          </div>
          <button
            type="button"
            onClick={claimYield}
            disabled={state.pendingYield <= 0}
            className="btn-spring mt-4 flex items-center justify-center gap-2 rounded-full bg-sage px-5 py-2.5 text-sm font-medium text-paper hover:bg-sage-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <HandCoins size={16} />
            Claim yield
          </button>
        </div>
      </section>

      <section className="mt-14 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <h2 className="font-display text-2xl text-ink">Your parcels</h2>
          {holdingRows.length === 0 ? (
            <div className="mt-6 flex min-h-[220px] flex-col items-center justify-center rounded-[1.5rem] bg-paper-2 text-center ring-1 ring-ink/10">
              <Coins size={28} className="text-sage" />
              <p className="mt-3 font-medium text-ink">No shares yet</p>
              <p className="mt-1 max-w-xs text-sm text-ink-2">
                Buy your first parcel shares and they will appear here.
              </p>
              <Link
                href="/parcels"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-sage-2 hover:text-sage-3"
              >
                Browse parcels
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <ul className="mt-6 space-y-4">
              {holdingRows.map((r) => (
                <li
                  key={r.parcelId}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-paper-2 p-5 ring-1 ring-ink/10"
                >
                  <div>
                    <Link
                      href={`/parcels/${r.parcel.id}`}
                      className="font-display text-xl text-ink hover:text-sage-2"
                    >
                      {r.parcel.name}
                    </Link>
                    <p className="mt-1 text-sm text-ink-2">
                      {r.parcel.district}, {r.parcel.state}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-ink">
                      {formatShares(r.shares)} shares
                    </p>
                    <p className="text-sm text-ink-2">
                      {formatINR(r.shares * r.parcel.sharePrice)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="font-display text-2xl text-ink">Activity</h2>
          {state.transactions.length === 0 ? (
            <div className="mt-6 rounded-[1.5rem] bg-paper-2 p-8 text-center ring-1 ring-ink/10">
              <p className="text-sm text-ink-2">No transactions yet.</p>
            </div>
          ) : (
            <ul className="mt-6 space-y-3">
              {state.transactions.slice(0, 8).map((t) => {
                const parcel = parcels.find((p) => p.id === t.parcelId);
                const label =
                  t.type === "buy"
                    ? `Bought shares in ${parcel ? parcel.name : "a parcel"}`
                    : t.type === "stake"
                      ? "Staked shares, yield accrued"
                      : "Yield claimed";
                return (
                  <li
                    key={t.id}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-paper-2 px-5 py-4 text-sm ring-1 ring-ink/10"
                  >
                    <div>
                      <p className="font-medium text-ink">{label}</p>
                      <p className="text-xs text-ink-3">
                        {new Date(t.at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 font-medium ${
                        t.type === "claim" ? "text-sage-2" : "text-ink"
                      }`}
                    >
                      {t.type === "claim" ? "+" : t.type === "buy" ? "-" : ""}
                      {formatINR(t.amount)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
