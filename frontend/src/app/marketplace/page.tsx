"use client";

import { ParcelsTable } from "@/components/parcels-table";

export default function MarketplacePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="font-heading text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">
          Farm <span className="text-emerald-700">Marketplace</span>
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-zinc-600">
          Eight working batches, live on Monad Testnet. Every row reads straight
          from the deployed contracts — tokens sold, prices and investor share
          update on-chain.
        </p>
      </div>

      <div className="mt-8">
        <ParcelsTable />
      </div>
      <p className="mt-4 text-right text-xs text-zinc-500">
        Refreshes every 30s — read directly from contract storage
      </p>

      <div className="sticker-card mt-10 max-w-2xl bg-amber-50 p-5 text-sm text-ink-700">
        <span className="font-heading font-bold text-ink-900">New to mUSDC?</span> Grab
        testnet tokens from the faucet on the{" "}
        <a href="/add-tokens" className="font-semibold text-emerald-700 hover:underline">
          Tokens page
        </a>{" "}
        to start buying.
      </div>
    </div>
  );
}
