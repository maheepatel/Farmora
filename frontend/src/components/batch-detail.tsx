"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { BuyPanel } from "@/components/buy-panel";
import { getBatchMeta } from "@/lib/config";
import { batchAddress, useBatch, useStayPrice } from "@/lib/contracts";
import { fmtUSDC, fmtWhole, pct, GROWTH_STAGES, timeAgo } from "@/lib/format";
import { estimateReturns } from "@/lib/estimator";

export function BatchDetail({ id }: { id: number }) {
  const meta = getBatchMeta(id);
  const batch = useBatch(id);
  const d = batch.data;
  const live = batch.state === "live";
  const stayPrice = useStayPrice(id);
  const est = estimateReturns(id, d.investorShareBps, d.fixedReturnBps);
  const [tab, setTab] = useState<"overview" | "clips" | "stays">("overview");

  const badge = live
    ? "live"
    : batch.state === "noAddress"
      ? "not-deployed"
      : "unavailable";

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8">
      <Link href="/marketplace" className="sticker-btn-outline !px-4 !py-1.5 !text-sm">
        ← Back to Farm Marketplace
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="text-5xl">{meta.emoji}</span>
        <h1 className="font-heading text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">
          {meta.cropType}
        </h1>
        <span
          className={`sticker-badge ${
            badge === "live"
              ? "bg-emerald-50 text-emerald-700"
              : badge === "not-deployed"
                ? "bg-amber-50 text-amber-700"
                : "bg-rose-50 text-rose-700"
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${badge === "live" ? "bg-emerald-500" : "bg-amber-400"}`} />
          {badge}
        </span>
        <span className="sticker-badge bg-white text-ink-700">
          {GROWTH_STAGES[d.growthStage] ?? "Unknown"} stage
        </span>
      </div>
      <p className="mt-3 max-w-2xl text-zinc-600">{meta.description}</p>

      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-6">
        {[
          ["Crop", meta.cropType],
          ["Acres", `${meta.acres}`],
          ["Crop #", live ? fmtWhole(d.cropNumber) : "…"],
          ["Cycle", `${meta.cropCycleYears} yr`],
          ["First harvest", meta.firstHarvest],
          ["Ticker", meta.tokenSymbol],
        ].map(([k, v]) => (
          <div key={k} className="sticker-card bg-white p-3 text-center">
            <p className="text-xs text-zinc-500">{k}</p>
            <p className="font-heading text-lg leading-tight text-ink-900">{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="flex flex-col gap-8">
          <section className="sticker-card overflow-hidden bg-white">
            <div className="border-b-2 border-ink-100 px-5 py-4">
              <h2 className="font-heading text-2xl font-bold text-ink-900">
                Live on-chain <span className="text-sm font-normal text-zinc-500">· reads every 30s</span>
              </h2>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <div className="rounded-xl bg-emerald-50 p-4">
                <p className="text-xs font-semibold text-zinc-500">growth year</p>
                <p className="font-heading text-3xl font-bold tabular text-ink-900">
                  {live ? `Year ${fmtWhole(d.currentYear)}` : "…"}
                </p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink-100">
                  <motion.div
                    className="h-full rounded-full bg-emerald-600"
                    initial={{ width: 0 }}
                    animate={{ width: live ? `${(Number(d.currentYear) / Math.max(1, Number(d.cropCycleYears))) * 100}%` : "0%" }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  planted {live ? timeAgo(d.plantingDate) : ""} · advanceYear-aware
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-4">
                <p className="text-xs font-semibold text-zinc-500">investor share</p>
                <p className="font-heading text-3xl font-bold tabular text-emerald-700">
                  {live ? pct(d.investorShareBps) : "…"}
                </p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink-100">
                  <motion.div
                    className="h-full rounded-full bg-amber-400"
                    initial={{ width: 0 }}
                    animate={{ width: live ? `${(Number(d.investorShareBps) / 10000) * 100}%` : "0%" }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-500">70% → 0%, steps down 5 pts/yr</p>
              </div>
              <div className="rounded-xl bg-white p-4 ring-2 ring-ink-100">
                <p className="text-xs font-semibold text-zinc-500">tokens sold / available</p>
                <p className="font-heading text-3xl font-bold tabular text-ink-900">
                  {live ? fmtWhole(d.soldTokens) : "…"}
                  <span className="text-lg font-medium text-zinc-400"> / {live ? fmtWhole(d.availableTokens) : "…"}</span>
                </p>
              </div>
              <div className="rounded-xl bg-white p-4 ring-2 ring-ink-100">
                <p className="text-xs font-semibold text-zinc-500">buyback reserve</p>
                <p className="font-heading text-3xl font-bold tabular text-ink-900">
                  {live ? `${fmtUSDC(d.buybackReserve)} mUSDC` : "…"}
                </p>
                <p className="mt-1 text-xs text-zinc-500">10% of revenue set aside</p>
              </div>
            </div>
          </section>

          <section className="sticker-card overflow-hidden bg-white">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-ink-100 px-5 py-4">
              <h2 className="font-heading text-2xl font-bold text-ink-900">Return estimator</h2>
              <span className="text-xs text-zinc-500">per token, % per year</span>
            </div>
            <div className="overflow-x-auto p-5">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b-2 border-ink-800">
                    {["", ...est.years.map((y) => y.year)].map((h, i) => (
                      <th key={i} className="px-2 py-2 text-left font-heading text-lg text-ink-900">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-ink-100">
                    <td className="px-2 py-2 font-semibold text-zinc-500">variable</td>
                    {est.years.map((y) => (
                      <td key={y.year} className="px-2 py-2">
                        <motion.span
                          className="font-heading text-lg font-bold text-emerald-700"
                          initial={{ opacity: 0, y: 8 }}
                          whileInView={{ opacity: 1, y: 0 }}
                        >
                          {y.variable.toFixed(1)}%
                        </motion.span>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-ink-100">
                    <td className="px-2 py-2 font-semibold text-zinc-500">fixed</td>
                    {est.years.map((y) => (
                      <td key={y.year} className="px-2 py-2 font-heading text-lg font-bold text-amber-600">
                        {y.fixed.toFixed(1)}%
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-emerald-50">
                    <td className="px-2 py-2 font-semibold text-zinc-500">4-yr total</td>
                    <td className="px-2 py-2 font-heading text-xl font-bold text-ink-900" colSpan={2}>
                      {est.totalVariable.toFixed(1)}%
                      <span className="text-xs font-normal text-zinc-500"> variable</span>
                    </td>
                    <td className="px-2 py-2 font-heading text-xl font-bold text-ink-900" colSpan={2}>
                      {est.totalFixed.toFixed(1)}%
                      <span className="text-xs font-normal text-zinc-500"> fixed</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="border-t-2 border-ink-100 px-5 py-3 text-xs text-zinc-500">
              <span className="font-semibold text-ink-900">estimated next year:</span>{" "}
              {est.nextYear.toFixed(1)}% (variable) · simplified crop economics:
              price/acre × realistic yield × investor share, ~1% appreciation/yr.
            </p>
          </section>

          <section className="sticker-card overflow-hidden bg-white">
            <div className="flex gap-2 border-b-2 border-ink-100 px-5 py-3">
              {(["overview", "clips", "stays"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-150 border-2 ${
                    tab === t
                      ? "border-ink-800 bg-emerald-600 text-white shadow-[2px_2px_0_0_var(--color-forest)]"
                      : "border-transparent text-ink-600 hover:border-ink-800 hover:bg-white hover:shadow-[2px_2px_0_0_var(--color-forest)]"
                  }`}
                >
                  {t === "stays" ? "Stays" : t === "clips" ? "Clips" : "Overview"}
                </button>
              ))}
            </div>

            {tab === "overview" && (
              <div className="grid gap-4 p-5 sm:grid-cols-2">
                <div className="rounded-xl bg-white p-4 ring-2 ring-ink-100">
                  <p className="text-xs font-semibold text-zinc-500">contract</p>
                  <a
                    href={`https://testnet.monadscan.com/address/${batchAddress(id)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all font-mono text-xs text-emerald-700 underline decoration-2 underline-offset-2"
                  >
                    {batchAddress(id)}
                  </a>
                </div>
                <div className="rounded-xl bg-white p-4 ring-2 ring-ink-100">
                  <p className="text-xs font-semibold text-zinc-500">price per token</p>
                  <p className="font-heading text-xl font-bold text-ink-900">
                    {live ? `${fmtUSDC(d.pricePerToken)} mUSDC` : "…"}
                  </p>
                </div>
              </div>
            )}

            {tab === "clips" && (
              <div className="space-y-2 p-5">
                {d.clips.length === 0 ? (
                  <p className="text-zinc-500">No clips uploaded yet.</p>
                ) : (
                  d.clips.map((c, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 rounded-xl bg-white p-3 ring-2 ring-ink-100">
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noreferrer"
                        className="break-all text-sm text-emerald-700 underline decoration-2 underline-offset-2"
                      >
                        {c.url}
                      </a>
                      <span className="shrink-0 text-xs text-zinc-500">{timeAgo(c.timestamp)}</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === "stays" && (
              <div className="m-5 rounded-xl bg-emerald-50 p-4">
                <p className="font-heading text-lg font-bold text-ink-900">
                  Stay on this batch:{" "}
                  {stayPrice !== undefined ? `${fmtUSDC(stayPrice)} mUSDC / night` : "…"}
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  Up to 7 nights, up to 8 guests, booked on-chain.
                </p>
                <Link href="/stays" className="sticker-btn mt-4 !px-4 !py-1.5 !text-sm">
                  Check availability →
                </Link>
              </div>
            )}
          </section>
        </div>

        <BuyPanel
          batchId={id}
          pricePerToken={d.pricePerToken}
          soldTokens={d.soldTokens}
          totalSupply={d.totalSupply}
        />
      </div>
    </div>
  );
}
