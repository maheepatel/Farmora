"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CropArt } from "./site/farm-art";

interface LandBatchData {
  id: number;
  cropType: string;
  acres: number;
  pricePerToken: string;
  totalSupply: string;
  tokensPerAcre: string;
  pricePerAcre: string;
  totalValue: string;
  firstHarvest: string;
  harvestCycle: string;
  description: string;
  image?: string;
}

const cropAccent: Record<string, string> = {
  Saffron: "text-purple-700",
  Cordyceps: "text-orange-700",
  Mushroom: "text-stone-600",
  "Dragon Fruit": "text-pink-600",
  Pomegranate: "text-rose-700",
  Grapes: "text-violet-700",
  Turmeric: "text-yellow-700",
  Ginger: "text-amber-700",
};

export function LandBatchCard({ batch }: { batch: LandBatchData }) {
  const accent = cropAccent[batch.cropType] || "text-emerald-700";

  return (
    <Link href={`/batch/${batch.id}`} className="group block h-full">
      <div className="sticker-card flex h-full flex-col overflow-hidden bg-white transition-transform duration-200 group-hover:-translate-y-1.5 group-hover:shadow-sticker-lg">
        <div className="relative border-b-2 border-ink-800 bg-ink-50 p-4">
          <CropArt cropType={batch.cropType} className="aspect-[16/9] w-full rounded-2xl border-2 border-ink-800" />
          <span className="sticker-badge absolute left-5 top-5 bg-amber-400 text-ink-900">
            {batch.acres} acres
          </span>
          <span className="sticker-badge absolute bottom-5 right-5 bg-white text-ink-800">
            {batch.pricePerAcre}
            <span className="ml-1 text-xs font-bold text-zinc-500">/acre</span>
          </span>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-heading text-2xl font-bold tracking-tight text-ink-900">
                {batch.cropType}
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                {batch.firstHarvest} · {batch.harvestCycle}
              </p>
            </div>
            <div className="text-right">
              <div className={`font-heading text-2xl font-bold tabular ${accent}`}>
                {batch.pricePerAcre}
              </div>
              <div className="text-xs text-zinc-500">per acre</div>
            </div>
          </div>

          <p className="mt-4 text-base leading-relaxed text-zinc-600">{batch.description}</p>

          <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl border-2 border-ink-800 bg-ink-50 p-2 text-center">
            {[
              { v: batch.totalValue, l: "Valuation" },
              { v: batch.harvestCycle, l: "Harvest" },
              { v: Number(batch.totalSupply).toLocaleString(), l: "Tokens" },
            ].map((cell) => (
              <div key={cell.l} className="rounded-xl bg-white px-2 py-3">
                <div className="text-sm font-bold text-ink-900">{cell.v}</div>
                <div className="mt-1 text-xs font-semibold text-zinc-500">{cell.l}</div>
              </div>
            ))}
          </div>

          <div className="mt-auto flex items-center justify-between pt-6 text-sm">
            <span className="text-zinc-600">
              <span className="font-bold text-emerald-700">70%</span> investor share → −5 pts/yr
            </span>
            <span className="flex items-center gap-1.5 font-bold text-emerald-700 transition-transform group-hover:translate-x-0.5">
              View parcel
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
