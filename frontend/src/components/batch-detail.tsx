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
      <Link href="/marketplace" className="btn btn-sketch !px-4 !py-1.5 !text-sm">
        ← Back to Farm Marketplace
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="text-5xl">{meta.emoji}</span>
        <h1 className="font-display text-5xl leading-[1.05] tracking-tight text-ink sm:text-6xl">
          {meta.cropType}
        </h1>
        <span
          className={`chip ${
            badge === "live"
              ? "bg-sage-50"
              : badge === "not-deployed"
                ? "bg-harvest/25"
                : "bg-tomato/15"
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${badge === "live" ? "bg-sage-2" : "bg-harvest-2"}`} />
          {badge}
        </span>
        <span className="chip bg-white">
          {GROWTH_STAGES[d.growthStage] ?? "Unknown"} stage
        </span>
      </div>
      <p className="mt-3 max-w-2xl text-ink-2">{meta.description}</p>

      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-6">
        {[
          ["Crop", meta.cropType],
          ["Acres", `${meta.acres}`],
          ["Crop #", live ? fmtWhole(d.cropNumber) : "…"],
          ["Cycle", `${meta.cropCycleYears} yr`],
          ["First harvest", meta.firstHarvest],
          ["Ticker", meta.tokenSymbol],
        ].map(([k, v]) => (
          <div key={k} className="sketch-xs bg-white p-3 text-center">
            <p className="text-xs text-ink-3">{k}</p>
            <p className="font-display text-xl leading-tight text-ink">{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="flex flex-col gap-8">
          <section className="sketch overflow-hidden bg-white">
            <div className="border-b-2 border-ink/20 px-5 py-4">
              <h2 className="font-display text-3xl text-ink">
                Live on-chain <span className="text-base text-ink-3">· reads every 30s</span>
              </h2>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <div className="sketch-soft bg-sage-50 p-4">
                <p className="text-xs font-semibold text-ink-3">growth year</p>
                <p className="font-display text-4xl text-ink">
                  {live ? `Year ${fmtWhole(d.currentYear)}` : "…"}
                </p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink/15">
                  <motion.div
                    className="h-full rounded-full bg-sage-2"
                    initial={{ width: 0 }}
                    animate={{ width: live ? `${(Number(d.currentYear) / Math.max(1, Number(d.cropCycleYears))) * 100}%` : "0%" }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
                <p className="mt-1 text-xs text-ink-3">
                  planted {live ? timeAgo(d.plantingDate) : ""} · advanceYear-aware
                </p>
              </div>
              <div className="sketch-soft bg-sage-50 p-4">
                <p className="text-xs font-semibold text-ink-3">investor share</p>
                <p className="font-display text-4xl text-sage-2">
                  {live ? pct(d.investorShareBps) : "…"}
                </p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink/15">
                  <motion.div
                    className="h-full rounded-full bg-harvest"
                    initial={{ width: 0 }}
                    animate={{ width: live ? `${(Number(d.investorShareBps) / 10000) * 100}%` : "0%" }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
                <p className="mt-1 text-xs text-ink-3">70% → 0%, steps down 5 pts/yr</p>
              </div>
              <div className="sketch-xs bg-white p-4">
                <p className="text-xs font-semibold text-ink-3">tokens sold / available</p>
                <p className="font-display text-4xl text-ink">
                  {live ? fmtWhole(d.soldTokens) : "…"}
                  <span className="text-xl font-medium text-ink-3"> / {live ? fmtWhole(d.availableTokens) : "…"}</span>
                </p>
              </div>
              <div className="sketch-xs bg-white p-4">
                <p className="text-xs font-semibold text-ink-3">buyback reserve</p>
                <p className="font-display text-4xl text-ink">
                  {live ? `${fmtUSDC(d.buybackReserve)} mUSDC` : "…"}
                </p>
                <p className="mt-1 text-xs text-ink-3">funded by purchases</p>
              </div>
            </div>
          </section>

          <section className="sketch overflow-hidden bg-white">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-ink/20 px-5 py-4">
              <h2 className="font-display text-3xl text-ink">Return estimator</h2>
              <span className="text-xs text-ink-3">per token, % per year</span>
            </div>
            <div className="overflow-x-auto p-5">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b-2 border-ink">
                    {["", ...est.years.map((y) => y.year)].map((h, i) => (
                      <th key={i} className="px-2 py-2 text-left font-display text-lg text-ink">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-ink/15">
                    <td className="px-2 py-2 font-semibold text-ink-3">variable</td>
                    {est.years.map((y) => (
                      <td key={y.year} className="px-2 py-2">
                        <motion.span
                          className="font-display text-lg text-sage-2"
                          initial={{ opacity: 0, y: 8 }}
                          whileInView={{ opacity: 1, y: 0 }}
                        >
                          {y.variable.toFixed(1)}%
                        </motion.span>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-ink/15">
                    <td className="px-2 py-2 font-semibold text-ink-3">fixed</td>
                    {est.years.map((y) => (
                      <td key={y.year} className="px-2 py-2 font-display text-lg text-harvest-2">
                        {y.fixed.toFixed(1)}%
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-sage-50">
                    <td className="px-2 py-2 font-semibold text-ink-3">4-yr total</td>
                    <td className="px-2 py-2 font-display text-xl text-ink" colSpan={2}>
                      {est.totalVariable.toFixed(1)}%
                      <span className="text-xs font-normal text-ink-3"> variable</span>
                    </td>
                    <td className="px-2 py-2 font-display text-xl text-ink" colSpan={2}>
                      {est.totalFixed.toFixed(1)}%
                      <span className="text-xs font-normal text-ink-3"> fixed</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="border-t-2 border-ink/20 px-5 py-3 text-xs text-ink-3">
              <span className="font-semibold text-ink">estimated next year:</span>{" "}
              {est.nextYear.toFixed(1)}% (variable) · simplified crop economics:
              price/acre × realistic yield × investor share, ~1% appreciation/yr.
            </p>
          </section>

          <section className="sketch overflow-hidden bg-white">
            <div className="flex gap-2 border-b-2 border-ink/20 px-5 py-3">
              {(["overview", "clips", "stays"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`chip ${
                    tab === t ? "bg-ink text-paper" : "bg-white hover:bg-paper-2"
                  }`}
                >
                  {t === "stays" ? "Stays" : t === "clips" ? "Clips" : "Overview"}
                </button>
              ))}
            </div>

            {tab === "overview" && (
              <div className="grid gap-4 p-5 sm:grid-cols-2">
                <div className="sketch-xs bg-white p-4">
                  <p className="text-xs font-semibold text-ink-3">contract</p>
                  <a
                    href={`https://testnet.monadscan.com/address/${batchAddress(id)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all font-mono text-xs text-sage-2 underline decoration-2 underline-offset-2"
                  >
                    {batchAddress(id)}
                  </a>
                </div>
                <div className="sketch-xs bg-white p-4">
                  <p className="text-xs font-semibold text-ink-3">price per token</p>
                  <p className="font-display text-2xl text-ink">
                    {live ? `${fmtUSDC(d.pricePerToken)} mUSDC` : "…"}
                  </p>
                </div>
              </div>
            )}

            {tab === "clips" && (
              <div className="space-y-2 p-5">
                {d.clips.length === 0 ? (
                  <p className="text-ink-3">No clips uploaded yet.</p>
                ) : (
                  d.clips.map((c, i) => (
                    <div key={i} className="sketch-xs flex items-center justify-between gap-3 bg-white p-3">
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noreferrer"
                        className="break-all text-sm text-sage-2 underline decoration-2 underline-offset-2"
                      >
                        {c.url}
                      </a>
                      <span className="shrink-0 text-xs text-ink-3">{timeAgo(c.timestamp)}</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === "stays" && (
              <div className="m-5 sketch-soft bg-sage-50 p-4">
                <p className="font-display text-2xl text-ink">
                  Stay on this batch:{" "}
                  {stayPrice !== undefined ? `${fmtUSDC(stayPrice)} mUSDC / night` : "…"}
                </p>
                <p className="mt-1 text-sm text-ink-2">
                  Up to 7 nights, up to 8 guests, booked on-chain.
                </p>
                <Link href="/stays" className="btn btn-fill mt-4 !px-4 !py-1.5 !text-sm">
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
