"use client";

import { useMemo, useState } from "react";
import { getCropEstimator, type EstimatorYear } from "@/lib/crop-estimator";
import type { LandBatch } from "@/lib/config";

const fmtPrice = (p: number) =>
  p >= 1000
    ? p.toLocaleString("en-US", { maximumFractionDigits: 0 })
    : p.toLocaleString("en-US", { maximumFractionDigits: 2 });

const fmtUSD = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtKg = (kg: number) =>
  kg >= 1000 ? `${(kg / 1000).toFixed(1)} t` : `${kg.toFixed(kg >= 10 ? 1 : 2)} kg`;

export function ReturnEstimator({
  batch,
  totalSupply,
  investorSharePct,
  accent,
}: {
  batch: LandBatch;
  totalSupply: number;
  investorSharePct: number;
  accent: string;
}) {
  const est = getCropEstimator(batch.cropType);
  const [amount, setAmount] = useState("1000");

  const invest = Math.max(0, parseFloat(amount) || 0);
  const tokens = invest / Number(batch.pricePerToken);
  const acreShare = totalSupply > 0 ? (tokens * batch.acres) / totalSupply : 0;
  const investorShare = investorSharePct / 100;

  const rows = useMemo<EstimatorYear[]>(() => est?.years ?? [], [est]);

  const yearReturn = (y: EstimatorYear) => acreShare * est!.yieldPerAcre * y.price * investorShare;
  const totalReturn = rows.reduce((sum, y) => sum + yearReturn(y), 0);
  const avgYearReturn = rows.length > 0 ? totalReturn / rows.length : 0;
  const multiple = invest > 0 ? totalReturn / invest : 0;

  if (!est) {
    return (
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600">
        Yield and price data for {batch.cropType} is not available yet.
      </p>
    );
  }

  return (
    <div className="mt-5 rounded-2xl border-2 border-ink-800 bg-ink-50/50 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-heading text-base font-bold text-ink-900">Return estimator</h3>
        <span className="sticker-badge bg-ink-100 text-ink-800">4 years · 2023–2026 · real market data</span>
        <span className={`sticker-badge ${accent}`}>{investorSharePct}% to investors</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="sticker-badge bg-white text-ink-800">{est.yieldNote}</span>
        <span className="sticker-badge bg-white text-ink-800">{est.priceNote}</span>
      </div>

      <div className="mt-5 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-500">
            You invest (mUSDC)
          </label>
          <input
            type="number"
            value={amount}
            min="0"
            onChange={(e) => setAmount(e.target.value)}
            className="w-44 rounded-xl border-2 border-ink-800 bg-white px-3 py-2 text-lg font-bold text-ink-900 placeholder-zinc-400 transition-colors focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600/20"
          />
        </div>
        <div className="text-sm font-semibold text-zinc-500">
          {invest > 0 && totalSupply > 0 ? (
            <>
              = <span className="font-bold text-ink-900">{tokens.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span> LAND tokens
              &middot; <span className="font-bold text-ink-900">{fmtKg(acreShare * est.yieldPerAcre)}</span> of the annual crop
            </>
          ) : (
            "Enter an amount to estimate"
          )}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-ink-800 text-left text-xs uppercase tracking-wider text-zinc-500">
              <th className="pb-2 pr-3">Year</th>
              <th className="pb-2 pr-3">Market price / kg</th>
              <th className="pb-2 pr-3">Your share</th>
              <th className="pb-2 pr-3">Gross</th>
              <th className="pb-2 text-right">Your {investorSharePct}%</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((y) => (
              <tr key={y.year} className="border-b-2 border-ink-100">
                <td className="py-2 pr-3 font-bold text-ink-900">{y.year}</td>
                <td className="py-2 pr-3 font-semibold text-zinc-600">${fmtPrice(y.price)}</td>
                <td className="py-2 pr-3 text-zinc-600">{fmtKg(acreShare * est.yieldPerAcre)}</td>
                <td className="py-2 pr-3 text-zinc-600">{fmtUSD(acreShare * est.yieldPerAcre * y.price)}</td>
                <td className={`py-2 text-right font-bold ${accent}`}>{fmtUSD(yearReturn(y))}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-ink-800">
              <td className="pt-3 pr-3 font-bold text-ink-900">4-yr total</td>
              <td className="pt-3 pr-3" />
              <td className="pt-3 pr-3" />
              <td className="pt-3 pr-3 font-bold text-zinc-600">{fmtUSD(totalReturn)}</td>
              <td className={`pt-3 text-right font-bold ${accent}`}>{fmtUSD(totalReturn)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Return on {fmtUSD(invest)}</span>
          <span className={`font-heading text-2xl font-bold ${accent}`}>{multiple.toFixed(2)}×</span>
          <span className="text-xs font-semibold text-zinc-500">over 4 years</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Estimated next year</span>
          <span className={`font-heading text-2xl font-bold ${accent}`}>{fmtUSD(avgYearReturn)}</span>
          <span className="text-xs font-semibold text-zinc-500">4-yr average · prices vary</span>
        </div>
        {rows.length > 0 && (
          <p className="text-xs font-semibold text-zinc-400">
            {rows[rows.length - 1].note} · {est.priceNote}
          </p>
        )}
      </div>
    </div>
  );
}
