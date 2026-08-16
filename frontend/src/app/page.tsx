"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Copy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useState } from "react";
import { useAccount } from "wagmi";
import { Arrow } from "@/components/doodles";
import { ParcelsTable } from "@/components/parcels-table";
import { BATCH_ADDRESSES, CONTRACT_ADDRESSES } from "@/lib/config";
import { useBatch } from "@/lib/contracts";
import { IMG } from "@/lib/images";

const model = [
  {
    n: "1",
    title: "Buy a parcel",
    body: "Tokens are bought with mUSDC at the batch's fixed price. A share of every purchase is set aside in the buyback reserve that funds later exits.",
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
    body: "Request a sale and your tokens lock for 90 days. After the cooldown you are paid principal plus 1% per year of appreciation from the reserve.",
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
      <section className="relative">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center lg:px-8">
          <div className="relative z-10">
            <span className="chip bg-white">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sage opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sage-2" />
              </span>
              Live on-chain · Monad Testnet
            </span>

            <h1 className="mt-6 font-display text-5xl leading-[1.05] tracking-tight text-ink sm:text-7xl">
              The farm is real.
              <br />
              <span className="paint">The harvests, as they stand now.</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-2">
              Invest in a batch and earn from the harvest, or book a weekend on
              the land you own. Every figure on this page is read straight from
              the contracts.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/marketplace" className="btn btn-fill">
                Invest in a parcel
              </Link>
              {isConnected ? (
                <Link href="/portfolio" className="btn btn-sun">
                  My Cropfolio
                </Link>
              ) : (
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <button type="button" className="btn btn-sun" onClick={openConnectModal}>
                      Connect a wallet
                    </button>
                  )}
                </ConnectButton.Custom>
              )}
            </div>

            <p className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-ink-3">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-sage-2" />
                Reading contract storage…
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-harvest" />
                Batch tokens minted on buy
              </span>
            </p>
          </div>

          <div className="relative">
            <div className="sketch tilt-r overflow-hidden p-0">
              <Image
                src={IMG.hero}
                alt="Farmora farmland"
                width={1600}
                height={900}
                className="aspect-video w-full object-cover"
                priority
              />
              <span className="chip absolute right-4 top-4 rotate-3 bg-harvest text-ink">
                your slice of it
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <LiveStats />
      </section>

      {/* ================= MARKETPLACE PREVIEW ================= */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="max-w-2xl font-display text-4xl leading-[1.1] tracking-tight text-ink sm:text-5xl">
              The harvests, as <span className="paint">they stand now.</span>
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-2">
              These figures are not screenshots of a spreadsheet. Each one is
              read from the deployed contracts the moment you load this page.
            </p>
          </div>
          <Link href="/marketplace" className="btn btn-sketch shrink-0">
            View all parcels
          </Link>
        </div>

        <div className="mt-8">
          <ParcelsTable limit={8} />
        </div>
        <p className="mt-4 text-right text-xs text-ink-3">
          Refreshes every 30s · read directly from contract storage
        </p>
      </section>

      {/* ================= MODEL ================= */}
      <section className="bg-paper-2/70">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-4xl leading-[1.1] tracking-tight text-ink sm:text-5xl">
              Hold to the harvest. <span className="paint">Exit early</span> and
              the points move.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-2">
              Your split is 70 / 30 the moment you buy and it stays yours at the
              harvest. Sell before it and a new buyer takes your stake: 5 points
              of the split move to the farmer for each year you held, while your
              money comes back after a 90-day cooldown plus 1% a year of
              appreciation once a year has passed.
            </p>
          </div>

          <div className="mt-10 flex flex-col items-stretch gap-4 lg:flex-row lg:items-center">
            {model.map((m, i) => (
              <Fragment key={m.n}>
                {i > 0 && <Arrow className="self-center lg:-mx-1" down />}
                <div className="sketch flex-1 bg-white p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink bg-harvest font-display text-xl text-ink shadow-[2px_2px_0_rgba(43,38,29,0.2)]">
                    {m.n}
                  </span>
                  <h3 className="mt-4 font-display text-xl text-ink">{m.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-2">{m.body}</p>
                </div>
              </Fragment>
            ))}
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ledger.map((l) => (
              <div key={l.v} className="sketch-soft p-5 text-center">
                <p className="font-display text-4xl text-ink">{l.k}</p>
                <p className="mt-2 text-sm font-bold text-ink">{l.v}</p>
                <p className="mt-0.5 text-xs text-ink-3">{l.c}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= STAYS ================= */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 lg:px-8">
        <div className="sketch grid gap-8 bg-white p-6 md:p-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <h2 className="font-display text-4xl leading-[1.1] tracking-tight text-ink sm:text-5xl">
              Own the land. <span className="paint">Sleep on it.</span>
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-2">
              A weekend at the farmhouse, with farm tours, guided walks through
              your crop, and produce picked hours before you eat it. Bookings
              are transactions on-chain, so a night can only ever be reserved
              once.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "Weekend · 2 nights",
                "Guided farm tour",
                "Produce picked that morning",
                "Booked on-chain, one slot per night",
              ].map((f) => (
                <li key={f} className="chip w-full bg-sage-50 text-sm">
                  <span className="h-2 w-2 rounded-full bg-sage-2" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/stays" className="btn btn-fill mt-7">
              Book a stay
            </Link>
          </div>
          <Image
            src={IMG.cta}
            alt="Farm stay"
            width={1200}
            height={900}
            className="sketch-soft hidden w-full object-cover p-1 lg:block"
          />
        </div>
      </section>

      {/* ================= TOKENS ================= */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-display text-4xl leading-[1.1] tracking-tight text-ink sm:text-5xl">
              Add the tokens <span className="paint">to your wallet.</span>
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-2">
              The settlement currency, the batch tokens, and the factory that
              issues new land. One tap each. The full registry with every LAND
              address lives on the wallet page.
            </p>
          </div>
          <Link href="/add-tokens" className="btn btn-sketch shrink-0">
            Open the full registry
          </Link>
        </div>
        <TokenRows className="mt-8" />
      </section>

      {/* ================= CTA ================= */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="sketch bg-ink p-8 text-center text-paper md:p-12">
          <h2 className="font-display text-4xl leading-[1.1] tracking-tight sm:text-5xl">
            Ready to open a position?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-paper-2">
            The next harvest is on-chain. Choose a batch, or come stay on the
            land first.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/marketplace" className="btn btn-sun">
              Invest in a parcel
            </Link>
            <Link href="/stays" className="btn btn-sketch">
              Stay the weekend
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
      <div className="sketch bg-sage-50 p-5">
        <p className="font-display text-4xl text-ink">{share}</p>
        <p className="mt-2 text-sm font-bold text-ink">Investor share</p>
        <p className="mt-0.5 text-xs text-ink-3">supply-weighted across live batches</p>
      </div>
      <div className="sketch bg-white p-5">
        <p className="font-display text-4xl text-ink">36</p>
        <p className="mt-2 text-sm font-bold text-ink">Acres on-chain</p>
        <p className="mt-0.5 text-xs text-ink-3">read from contract storage</p>
      </div>
      <div className="sketch bg-white p-5">
        <p className="font-display text-4xl text-ink">8</p>
        <p className="mt-2 text-sm font-bold text-ink">Live batches</p>
        <p className="mt-0.5 text-xs text-ink-3">verified on Monad Testnet</p>
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
      name: "LAND - Saffron",
      addr: BATCH_ADDRESSES[0],
    },
    {
      kind: "FACTORY",
      name: "Batch Factory",
      addr: CONTRACT_ADDRESSES.factory,
    },
  ];

  return (
    <div className={`sketch overflow-hidden bg-white ${className}`}>
      <div className="hidden grid-cols-[7rem_1fr_1fr_1fr] gap-4 border-b-2 border-ink/20 bg-paper-2 px-6 py-3 text-xs font-bold uppercase tracking-wide text-ink-2 md:grid">
        <span>Token</span>
        <span>Name</span>
        <span>Address</span>
        <span className="text-right">Action</span>
      </div>
      <div className="divide-y-2 divide-ink/10">
        {rows.map((r) => (
          <div key={r.addr} className="grid grid-cols-[1fr_auto] items-center gap-4 px-6 py-4 md:grid-cols-[7rem_1fr_1fr_1fr]">
            <span className="font-display text-lg text-ink">{r.kind}</span>
            <span className="hidden text-sm text-ink-2 md:block">{r.name}</span>
            <span className="hidden text-xs font-semibold text-ink-3 md:block">
              {r.addr.slice(0, 6)}.{r.addr.slice(-4)}
            </span>
            <span className="flex justify-end gap-2">
              <button
                type="button"
                className="btn btn-sketch !rounded-full !px-3 !py-1.5 !text-sm"
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
      className="btn btn-sketch !rounded-full !px-3 !py-1.5 !text-sm"
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
