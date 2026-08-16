"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, Copy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAccount } from "wagmi";
import { ParcelsTable } from "@/components/parcels-table";
import { CONTRACT_ADDRESSES, BATCH_ADDRESSES } from "@/lib/config";
import { useBatch } from "@/lib/contracts";
import { IMG } from "@/lib/images";

const model = [
  {
    n: "1",
    title: "Buy a parcel",
    body: "Tokens are bought with mUSDC at the batch's fixed price. 10% of every purchase is set aside in the buyback reserve that funds later exits.",
  },
  {
    n: "2",
    title: "The early exit",
    body: "Your split is 70 / 30 from the day you buy, and holding to the harvest keeps it yours. Sell early and 5 points of the split move to the farmer for each year you held.",
  },
  {
    n: "3",
    title: "Revenue splits",
    body: "Revenue is split at the current share. Fixed-return holders are capped at their rate; the farmer takes the rest. Milestones and daily clips are the proof of work behind it.",
  },
  {
    n: "4",
    title: "Exit after 90 days",
    body: "Request a sale and your tokens lock for 90 days. After the cooldown you are paid principal plus 1% per year of appreciation — from the reserve.",
  },
];

const ledger = [
  { k: "70%", v: "Starting investor share", c: "of every harvest" },
  { k: "−5 pts", v: "Moves to the farmer", c: "on a mid-stream sale" },
  { k: "90 days", v: "Sell cooldown", c: "then your money's back" },
  { k: "+1% / yr", v: "After the cooldown", c: "if a year has passed" },
];

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="overflow-x-clip">
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-10 right-0 h-[560px] w-[420px] rounded-full bg-amber-200/50 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-20 left-0 h-[500px] w-[400px] rounded-full bg-emerald-200/50 blur-[120px]" />

        <div className="mx-auto grid max-w-7xl gap-14 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center lg:px-8">
          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="sticker-badge bg-white text-emerald-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
              </span>
              Live on-chain · Monad Testnet
            </div>

            <h1 className="mt-5 font-heading text-5xl font-bold leading-[1.02] tracking-tight text-ink-900 sm:text-7xl">
              The farm is real.
              <br />
              <span className="text-emerald-700">The harvests, as they stand now.</span>
            </h1>

            <p className="mt-5 max-w-lg text-lg leading-relaxed text-zinc-600">
              Invest in a batch and earn from the harvest — or book a weekend on
              the land you own. Every figure on this page is read straight from
              the contracts.
            </p>

            <div className="mt-7 flex flex-wrap gap-4">
              <Link href="/marketplace" className="sticker-btn">
                Invest in a parcel
                <ArrowRight size={18} strokeWidth={2.5} />
              </Link>
              {isConnected ? (
                <Link href="/portfolio" className="sticker-btn-amber sticker-btn">
                  My Cropfolio
                  <ArrowDown size={18} strokeWidth={2.5} />
                </Link>
              ) : (
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <button type="button" className="sticker-btn-amber sticker-btn" onClick={openConnectModal}>
                      Connect a wallet
                      <ArrowDown size={18} strokeWidth={2.5} />
                    </button>
                  )}
                </ConnectButton.Custom>
              )}
            </div>

            <p className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-zinc-600">
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 animate-blink rounded-full bg-emerald-500" />
                Reading contract storage…
              </span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                Batch tokens minted on buy
              </span>
            </p>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          >
            <div className="sticker-card overflow-hidden bg-white p-0">
              <Image
                src={IMG.hero}
                alt="Farmora farmland"
                width={1600}
                height={900}
                className="aspect-video w-full max-h-72 object-cover md:max-h-72"
                priority
              />
              <div className="sticker-badge absolute right-3 top-3 bg-amber-400 text-amber-950">
                your slice of it
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <LiveStats />
      </section>

      {/* ================= MARKETPLACE PREVIEW ================= */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="max-w-2xl font-heading text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl sm:leading-[1.1]">
              The harvests, as they stand now.
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-600">
              These figures are not screenshots of a spreadsheet — each one is
              read from the deployed contracts the moment you load this page.
            </p>
          </div>
          <Link href="/marketplace" className="sticker-btn-outline shrink-0">
            View all parcels
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-8">
          <ParcelsTable limit={8} />
        </div>
        <p className="mt-4 text-right text-xs text-zinc-500">
          Refreshes every 30s — read directly from contract storage
        </p>
      </section>

      {/* ================= MODEL ================= */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="max-w-2xl font-heading text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl sm:leading-[1.1]">
              Hold to the harvest. Exit early and the points move.
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-600">
              Your split is 70 / 30 the moment you buy and it stays yours at the
              harvest. Sell before it and a new buyer takes your stake: 5 points
              of the split move to the farmer for each year you held, while your
              money comes back after a 90-day cooldown — plus 1% a year of
              appreciation once a year has passed.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {model.map((m, i) => (
            <motion.div
              key={m.n}
              className="sticker-card bg-white p-5"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 font-heading font-bold text-amber-950 shadow-[2px_2px_0_0_var(--color-forest)]">
                {m.n}
              </span>
              <h3 className="mt-4 font-heading text-lg font-bold text-ink-900">{m.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">{m.body}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ledger.map((l) => (
            <div key={l.v} className="sticker-card bg-emerald-50 p-5 text-center">
              <p className="font-heading text-4xl font-bold tabular text-emerald-700">{l.k}</p>
              <p className="mt-2 text-sm font-bold text-ink-800">{l.v}</p>
              <p className="mt-0.5 text-xs text-zinc-500">{l.c}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= STAYS ================= */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="sticker-card grid gap-8 bg-white p-6 md:p-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              Own the land. Sleep on it.
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-zinc-600">
              A weekend at the farmhouse — farm tours, guided walks through your
              crop, and produce picked hours before you eat it. Bookings are
              transactions on-chain, so a night can only ever be reserved once.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "Weekend · 2 nights",
                "Guided farm tour",
                "Produce picked that morning",
                "Booked on-chain, one slot per night",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-ink-800">
                  <span className="h-2 w-2 rounded-full bg-emerald-600" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/stays" className="sticker-btn mt-7">
              Book a stay
              <ArrowRight size={18} strokeWidth={2.5} />
            </Link>
          </div>
          <Image
            src={IMG.cta}
            alt="Farm stay"
            width={1200}
            height={900}
            className="sticker-card hidden w-full object-cover lg:block"
          />
        </div>
      </section>

      {/* ================= TOKENS ================= */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              Add the tokens to your wallet.
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-600">
              The settlement currency, the batch tokens, and the factory that
              issues new land — one tap each. Full registry with every LAND
              address lives on the wallet page.
            </p>
          </div>
          <Link href="/add-tokens" className="sticker-btn-outline shrink-0">
            Open the full registry
            <ArrowRight size={16} />
          </Link>
        </div>
        <TokenRows className="mt-8" />
      </section>

      {/* ================= CTA ================= */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="sticker-card bg-emerald-900 p-8 text-center md:p-12">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to open a position?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-emerald-200">
            The next harvest is on-chain. Choose a batch, or come stay on the
            land first.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-4">
            <Link href="/marketplace" className="sticker-btn">
              Invest in a parcel
              <ArrowRight size={18} strokeWidth={2.5} />
            </Link>
            <Link href="/stays" className="sticker-btn-amber sticker-btn">
              Stay the weekend
              <ArrowDown size={18} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function LiveStats() {
  const saffron = useBatch(0);
  const share = saffron.state === "live" ? `${(Number(saffron.data.investorShareBps) / 100).toFixed(0)}%` : "…";

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="sticker-card bg-emerald-50 p-5">
        <p className="font-heading text-4xl font-bold tabular text-emerald-700">{share}</p>
        <p className="mt-2 text-sm font-bold text-ink-800">Investor share</p>
        <p className="mt-0.5 text-xs text-zinc-500">supply-weighted across live batches</p>
      </div>
      <div className="sticker-card bg-white p-5">
        <p className="font-heading text-4xl font-bold tabular text-ink-900">36</p>
        <p className="mt-2 text-sm font-bold text-ink-800">Acres on-chain</p>
        <p className="mt-0.5 text-xs text-zinc-500">read from contract storage</p>
      </div>
      <div className="sticker-card bg-white p-5">
        <p className="font-heading text-4xl font-bold tabular text-ink-900">8</p>
        <p className="mt-2 text-sm font-bold text-ink-800">Live batches</p>
        <p className="mt-0.5 text-xs text-zinc-500">verified on Monad Testnet</p>
      </div>
    </div>
  );
}

function TokenRows({ className = "" }: { className?: string }) {
  const [copied, setCopied] = useState("");
  const rows = [
    {
      kind: "mUSDC",
      name: "Mock USDC",
      addr: CONTRACT_ADDRESSES.mockUSDC,
    },
    {
      kind: "LAND",
      name: "LAND — Saffron",
      addr: BATCH_ADDRESSES[0],
    },
    {
      kind: "FACTORY",
      name: "Batch Factory",
      addr: CONTRACT_ADDRESSES.factory,
    },
  ];

  return (
    <div className={`sticker-card overflow-hidden bg-white ${className}`}>
      <div className="hidden grid-cols-[7rem_1fr_1fr_1fr] gap-4 border-b-2 border-ink-800 bg-ink-100 px-6 py-3 text-xs font-bold uppercase tracking-wide text-ink-800 md:grid">
        <span>Token</span>
        <span>Name</span>
        <span>Address</span>
        <span className="text-right">Action</span>
      </div>
      <div className="divide-y-2 divide-ink-100">
        {rows.map((r) => (
          <div key={r.addr} className="grid grid-cols-[1fr_auto] items-center gap-4 px-6 py-4 md:grid-cols-[7rem_1fr_1fr_1fr]">
            <span className="font-heading font-bold text-ink-900">{r.kind}</span>
            <span className="hidden text-sm text-ink-700 md:block">{r.name}</span>
            <span className="hidden text-xs font-semibold tabular text-zinc-500 md:block">
              {r.addr.slice(0, 6)}.{r.addr.slice(-4)}
            </span>
            <span className="flex justify-end gap-2">
              <button
                type="button"
                className="sticker-btn-outline !rounded-full !px-3 !py-1.5 !text-xs"
                onClick={() => {
                  navigator.clipboard?.writeText(r.addr);
                  setCopied(r.addr);
                  setTimeout(() => setCopied(""), 1500);
                }}
              >
                <Copy size={14} />
                {copied === r.addr ? "Copied" : "Copy"}
              </button>
              <AddToWallet addr={r.addr} symbol={r.kind === "mUSDC" ? "mUSDC" : r.kind === "LAND" ? "L-Saffron" : "FACTORY"} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddToWallet({ addr, symbol }: { addr: `0x${string}`; symbol: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      className="sticker-btn-outline !rounded-full !px-3 !py-1.5 !text-xs"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const { getWalletClient } = await import("@wagmi/core/actions");
          const { wagmiConfig } = await import("@/lib/wagmi");
          const client = await getWalletClient(wagmiConfig);
          await client.watchAsset({
            type: "ERC20",
            options: {
              address: addr,
              symbol,
              decimals: 18,
            },
          });
        } catch {
          /* user rejected */
        }
        setBusy(false);
      }}
    >
      {busy ? "Adding…" : "Add to wallet"}
    </button>
  );
}
