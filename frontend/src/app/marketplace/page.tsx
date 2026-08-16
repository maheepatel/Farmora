"use client";

import { allBatches } from "@/lib/config";
import { LandBatchCard } from "@/components/land-batch-card";
import { PageHeader } from "@/components/site/page-header";

export default function Marketplace() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <PageHeader
        title="Farm Marketplace"
        subtitle="Browse the land and invest in agriculture. Each parcel is a live batch on-chain — what you read is what the contract says."
      />
      <div className="grid gap-6 sm:grid-cols-2">
        {allBatches().map((batch, i) => (
          <div
            key={batch.id}
            style={{ animationDelay: `${i * 120}ms` }}
            className="animate-pop-in"
          >
            <LandBatchCard batch={batch} />
          </div>
        ))}
      </div>
    </div>
  );
}
