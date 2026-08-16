"use client";

import { useQueries } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { LAND_BATCHES, getBatchAddress } from "@/lib/config";
import { fetchLiveStats } from "@/lib/live-batch";

export function useAllLiveStats() {
  const publicClient = usePublicClient();
  return useQueries({
    queries: LAND_BATCHES.map((batch) => ({
      queryKey: ["liveBatchStats", batch.id, getBatchAddress(batch) ?? null],
      queryFn: () => fetchLiveStats(batch, publicClient),
      enabled: Boolean(getBatchAddress(batch)) && Boolean(publicClient),
      staleTime: 15_000,
      retry: 1,
    })),
  });
}
