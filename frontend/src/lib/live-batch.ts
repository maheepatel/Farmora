"use client";

import { useQuery } from "@tanstack/react-query";
import type { PublicClient } from "viem";
import { usePublicClient } from "wagmi";
import LandBatchAbi from "@/lib/abi/LandBatch.json";
import { getBatchAddress, type LandBatch } from "@/lib/config";

export type LiveState = "live" | "noAddress" | "unavailable";

export interface LiveStats {
  state: LiveState;
  fixedReturnBps?: bigint;
  investorShareBps?: bigint;
  totalAcres?: bigint;
  totalSupply?: bigint;
  soldTokens?: bigint;
  availableTokens?: bigint;
  pricePerToken?: bigint;
  currentYear?: bigint;
  growthStage?: bigint;
}

const READS = [
  "fixedReturnBps",
  "getCurrentInvestorShare",
  "totalAcres",
  "totalSupply",
  "getAvailableTokens",
  "pricePerToken",
] as const;

export async function fetchLiveStats(batch: LandBatch, publicClient: PublicClient | undefined): Promise<LiveStats> {
  const address = getBatchAddress(batch);
  if (!address || !publicClient) return { state: "noAddress" };
  const out: LiveStats = { state: "unavailable" };
  for (const fn of READS) {
    try {
      const value = (await publicClient.readContract({
        address,
        abi: LandBatchAbi,
        functionName: fn,
      })) as bigint;
      switch (fn) {
        case "fixedReturnBps":
          out.fixedReturnBps = value;
          break;
        case "getCurrentInvestorShare":
          out.investorShareBps = value;
          break;
        case "totalAcres":
          out.totalAcres = value;
          break;
        case "totalSupply":
          out.totalSupply = value;
          break;
        case "getAvailableTokens":
          out.availableTokens = value;
          break;
        case "pricePerToken":
          out.pricePerToken = value;
          break;
      }
    } catch {
      // per-read failure — batch renders its own "Unavailable" state
    }
  }
  const hasCore = out.totalSupply !== undefined || out.totalAcres !== undefined;
  out.state = hasCore ? "live" : "unavailable";
  return out;
}

export function useLiveBatchStats(batch: LandBatch) {
  const publicClient = usePublicClient();
  const address = getBatchAddress(batch);

  return useQuery<LiveStats>({
    queryKey: ["liveBatchStats", batch.id, address ?? null],
    queryFn: () => fetchLiveStats(batch, publicClient),
    enabled: Boolean(address) && Boolean(publicClient),
    staleTime: 15_000,
    retry: 1,
  });
}
