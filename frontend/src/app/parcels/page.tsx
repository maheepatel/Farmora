"use client";

import { MagnifyingGlass, SlidersHorizontal } from "@phosphor-icons/react/dist/ssr";
import { useMemo, useState } from "react";
import { cropOptions, parcels, regionOptions } from "@/lib/parcels";
import { ParcelCard } from "@/components/parcel-card";

export default function Marketplace() {
  const [crop, setCrop] = useState("All crops");
  const [region, setRegion] = useState("All regions");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return parcels.filter((p) => {
      const matchCrop = crop === "All crops" || p.crop === crop;
      const matchRegion = region === "All regions" || p.state === region;
      const q = query.trim().toLowerCase();
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.crop.toLowerCase().includes(q);
      return matchCrop && matchRegion && matchQuery;
    });
  }, [crop, region, query]);

  return (
    <div className="pt-16">
      <header className="mx-auto max-w-[1400px] px-4 pb-10 pt-16 sm:px-6 md:pt-24">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sage-2">
          Marketplace
        </p>
        <h1 className="mt-4 max-w-2xl font-display text-5xl leading-tight tracking-tight text-ink sm:text-6xl">
          Farmland, available now
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-2">
          Every parcel is verified, tokenised and raising funds. Pick a crop,
          filter by region, and start with a single share.
        </p>
      </header>

      <div className="mx-auto max-w-[1400px] px-4 pb-6 sm:px-6">
        <div className="flex flex-col gap-3 border-y hairline py-4 md:flex-row md:items-center md:justify-between">
          <div className="relative max-w-sm flex-1">
            <MagnifyingGlass
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search parcels, districts, crops"
              aria-label="Search parcels"
              className="w-full rounded-full border border-ink/15 bg-paper py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-3 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal size={16} className="mr-1 text-ink-3" />
            {cropOptions.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCrop(c)}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                  crop === c
                    ? "border-sage-2 bg-sage-2 text-paper"
                    : "border-ink/15 bg-transparent text-ink-2 hover:border-ink/30"
                }`}
              >
                {c}
              </button>
            ))}
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              aria-label="Filter by region"
              className="rounded-full border border-ink/15 bg-paper px-3.5 py-1.5 text-sm text-ink focus:border-sage focus:outline-none"
            >
              {regionOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 pb-24 sm:px-6">
        {filtered.length === 0 ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
            <p className="font-display text-2xl text-ink">No parcels match</p>
            <p className="mt-2 max-w-sm text-sm text-ink-2">
              Try a different crop, region or search term. New parcels are
              listed every season.
            </p>
            <button
              type="button"
              onClick={() => {
                setCrop("All crops");
                setRegion("All regions");
                setQuery("");
              }}
              className="mt-6 rounded-full border border-ink/20 px-5 py-2.5 text-sm font-medium text-ink hover:border-ink/40"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ParcelCard key={p.id} parcel={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
