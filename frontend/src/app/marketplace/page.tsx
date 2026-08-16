"use client";

import { ParcelsTable } from "@/components/parcels-table";

export default function MarketplacePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="font-display text-5xl leading-[1.05] tracking-tight text-ink sm:text-6xl">
          Farm <span className="paint">Marketplace</span>
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-2">
          Eight working batches, live on Monad Testnet. Every row reads straight
          from the deployed contracts, so tokens sold, prices and investor share
          update on-chain.
        </p>
      </div>

      <div className="mt-8">
        <ParcelsTable />
      </div>
      <p className="mt-4 text-right text-xs text-ink-3">
        Refreshes every 30s · read directly from contract storage
      </p>

      <div className="sketch-soft mt-10 max-w-2xl bg-harvest/20 p-5 text-sm text-ink-2">
        <span className="font-display text-base text-ink">New to mUSDC?</span> Grab
        testnet tokens from the faucet on the{" "}
        <a href="/add-tokens" className="font-semibold text-sage-2 hover:underline">
          Tokens page
        </a>{" "}
        to start buying.
      </div>
    </div>
  );
}
