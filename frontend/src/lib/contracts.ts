"use client";

import { useMemo } from "react";
import type { Abi } from "viem";
import {
  useReadContract,
  useReadContracts,
} from "wagmi";

import landBatchAbiJson from "./abi/LandBatch.json";
import factoryAbiJson from "./abi/LandBatchFactory.json";
import usdcAbiJson from "./abi/MockUSDC.json";
import stayAbiJson from "./abi/StayBooking.json";
import {
  BATCH_ADDRESSES,
  CONTRACT_ADDRESSES,
} from "./config";

export const landBatchAbi = landBatchAbiJson as unknown as Abi;
export const factoryAbi = factoryAbiJson as unknown as Abi;
export const usdcAbi = usdcAbiJson as unknown as Abi;
export const stayAbi = stayAbiJson as unknown as Abi;

export type ReadState = "live" | "noAddress" | "unavailable";

export type BatchLive = {
  cropType: string;
  name: string;
  symbol: string;
  totalAcres: bigint;
  totalSupply: bigint;
  pricePerToken: bigint;
  soldTokens: bigint;
  lockedTokens: bigint;
  availableTokens: bigint;
  investorShareBps: bigint;
  currentYear: bigint;
  growthStage: number;
  cropNumber: bigint;
  cropCycleYears: bigint;
  buybackReserve: bigint;
  totalRevenueDistributed: bigint;
  plantingDate: bigint;
  fixedReturnBps: bigint;
  admin: `0x${string}`;
  farmer: `0x${string}`;
  usdc: `0x${string}`;
  clips: { url: string; timestamp: bigint }[];
  milestones: {
    name: string;
    amount: bigint;
    startDay: bigint;
    endDay: bigint;
    claimed: boolean;
  }[];
};

export type InvestorInfo = {
  isFixedReturn: boolean;
  totalInvested: bigint;
  claimedRevenue: bigint;
  pendingRevenue: bigint;
};

export type SellRequest = {
  tokenAmount: bigint;
  requestTime: bigint;
  active: boolean;
};

const EMPTY: BatchLive = {
  cropType: "",
  name: "",
  symbol: "",
  totalAcres: 0n,
  totalSupply: 0n,
  pricePerToken: 0n,
  soldTokens: 0n,
  lockedTokens: 0n,
  availableTokens: 0n,
  investorShareBps: 0n,
  currentYear: 0n,
  growthStage: 0,
  cropNumber: 0n,
  cropCycleYears: 0n,
  buybackReserve: 0n,
  totalRevenueDistributed: 0n,
  plantingDate: 0n,
  fixedReturnBps: 0n,
  admin: "0x0000000000000000000000000000000000000000",
  farmer: "0x0000000000000000000000000000000000000000",
  usdc: "0x0000000000000000000000000000000000000000",
  clips: [],
  milestones: [],
};

export function batchAddress(i: number): `0x${string}` | undefined {
  return BATCH_ADDRESSES[i];
}

export function useBatch(i: number): {
  state: ReadState;
  data: BatchLive;
  refetch: () => void;
} {
  const address = batchAddress(i);
  const { data, isError, isPending, refetch } = useReadContracts({
    contracts: address
      ? [
          { address, abi: landBatchAbi, functionName: "cropType" },
          { address, abi: landBatchAbi, functionName: "name" },
          { address, abi: landBatchAbi, functionName: "symbol" },
          { address, abi: landBatchAbi, functionName: "totalAcres" },
          { address, abi: landBatchAbi, functionName: "totalSupply" },
          { address, abi: landBatchAbi, functionName: "pricePerToken" },
          { address, abi: landBatchAbi, functionName: "soldTokens" },
          { address, abi: landBatchAbi, functionName: "lockedTokens" },
          { address, abi: landBatchAbi, functionName: "getAvailableTokens" },
          { address, abi: landBatchAbi, functionName: "investorShareBps" },
          { address, abi: landBatchAbi, functionName: "currentYear" },
          { address, abi: landBatchAbi, functionName: "growthStage" },
          { address, abi: landBatchAbi, functionName: "cropNumber" },
          { address, abi: landBatchAbi, functionName: "cropCycleYears" },
          { address, abi: landBatchAbi, functionName: "buybackReserve" },
          { address, abi: landBatchAbi, functionName: "totalRevenueDistributed" },
          { address, abi: landBatchAbi, functionName: "plantingDate" },
          { address, abi: landBatchAbi, functionName: "fixedReturnBps" },
          { address, abi: landBatchAbi, functionName: "admin" },
          { address, abi: landBatchAbi, functionName: "farmer" },
          { address, abi: landBatchAbi, functionName: "usdc" },
          { address, abi: landBatchAbi, functionName: "getClips" },
          { address, abi: landBatchAbi, functionName: "getMilestones" },
        ]
      : [],
    query: { refetchInterval: 30_000 },
  });

  const parsed = useMemo<BatchLive>(() => {
    if (!data || isError) return EMPTY;
    const r = (j: number) => data[j]?.result;
    const clipsArr = (r(21) as [string, bigint][] | undefined) ?? [];
    const milArr = (r(22) as [string, bigint, bigint, bigint, boolean][] | undefined) ?? [];
    return {
      cropType: (r(0) as string) ?? "",
      name: (r(1) as string) ?? "",
      symbol: (r(2) as string) ?? "",
      totalAcres: (r(3) as bigint) ?? 0n,
      totalSupply: (r(4) as bigint) ?? 0n,
      pricePerToken: (r(5) as bigint) ?? 0n,
      soldTokens: (r(6) as bigint) ?? 0n,
      lockedTokens: (r(7) as bigint) ?? 0n,
      availableTokens: (r(8) as bigint) ?? 0n,
      investorShareBps: (r(9) as bigint) ?? 0n,
      currentYear: (r(10) as bigint) ?? 0n,
      growthStage: Number(r(11) ?? 0),
      cropNumber: (r(12) as bigint) ?? 0n,
      cropCycleYears: (r(13) as bigint) ?? 0n,
      buybackReserve: (r(14) as bigint) ?? 0n,
      totalRevenueDistributed: (r(15) as bigint) ?? 0n,
      plantingDate: (r(16) as bigint) ?? 0n,
      fixedReturnBps: (r(17) as bigint) ?? 0n,
      admin: (r(18) as `0x${string}`) ?? EMPTY.admin,
      farmer: (r(19) as `0x${string}`) ?? EMPTY.farmer,
      usdc: (r(20) as `0x${string}`) ?? EMPTY.usdc,
      clips: clipsArr.map(([url, timestamp]) => ({ url, timestamp })),
      milestones: milArr.map(([name, amount, startDay, endDay, claimed]) => ({
        name,
        amount,
        startDay,
        endDay,
        claimed,
      })),
    };
  }, [data, isError]);

  return {
    state: !address ? "noAddress" : isError ? "unavailable" : isPending ? "unavailable" : "live",
    data: parsed,
    refetch,
  };
}

export function useInvestorInfo(
  i: number,
  wallet: `0x${string}` | undefined,
): { state: ReadState; data: InvestorInfo } {
  const address = batchAddress(i);
  const { data, isError } = useReadContract({
    address: address as `0x${string}`,
    abi: landBatchAbi,
    functionName: "getInvestorInfo",
    args: wallet ? [wallet] : undefined,
    query: { enabled: !!address && !!wallet, refetchInterval: 30_000 },
  });

  const parsed = useMemo<InvestorInfo>(() => {
    if (!data) return { isFixedReturn: false, totalInvested: 0n, claimedRevenue: 0n, pendingRevenue: 0n };
    const t = data as unknown as [boolean, bigint, bigint, bigint];
    return {
      isFixedReturn: t[0],
      totalInvested: t[1],
      claimedRevenue: t[2],
      pendingRevenue: t[3],
    };
  }, [data]);

  return {
    state: !address ? "noAddress" : isError ? "unavailable" : "live",
    data: parsed,
  };
}

export function useSellRequest(
  i: number,
  wallet: `0x${string}` | undefined,
): { state: ReadState; data: SellRequest } {
  const address = batchAddress(i);
  const { data, isError } = useReadContract({
    address: address as `0x${string}`,
    abi: landBatchAbi,
    functionName: "getSellRequest",
    args: wallet ? [wallet] : undefined,
    query: { enabled: !!address && !!wallet, refetchInterval: 30_000 },
  });

  const parsed = useMemo<SellRequest>(() => {
    if (!data) return { tokenAmount: 0n, requestTime: 0n, active: false };
    const t = data as unknown as [bigint, bigint, boolean];
    return { tokenAmount: t[0], requestTime: t[1], active: t[2] };
  }, [data]);

  return {
    state: !address ? "noAddress" : isError ? "unavailable" : "live",
    data: parsed,
  };
}

export function useTokenBalance(
  i: number,
  wallet: `0x${string}` | undefined,
): bigint | undefined {
  const address = batchAddress(i);
  const { data } = useReadContract({
    address: address as `0x${string}`,
    abi: landBatchAbi,
    functionName: "balanceOf",
    args: wallet ? [wallet] : undefined,
    query: { enabled: !!address && !!wallet, refetchInterval: 30_000 },
  });
  return data as bigint | undefined;
}

export function useUSDCBalance(wallet: `0x${string}` | undefined): {
  balance: bigint;
  hasClaimed: boolean;
  refetch: () => void;
} {
  const { data, refetch } = useReadContracts({
    contracts: wallet
      ? [
          {
            address: CONTRACT_ADDRESSES.mockUSDC,
            abi: usdcAbi,
            functionName: "balanceOf",
            args: [wallet],
          },
          {
            address: CONTRACT_ADDRESSES.mockUSDC,
            abi: usdcAbi,
            functionName: "hasClaimed",
            args: [wallet],
          },
        ]
      : [],
    query: { refetchInterval: 30_000 },
  });
  return {
    balance: (data?.[0]?.result as bigint) ?? 0n,
    hasClaimed: Boolean(data?.[1]?.result),
    refetch,
  };
}

export type StayInfo = {
  batchId: number;
  day: bigint;
  nights: number;
  guests: number;
  total: bigint;
};

export function useUserBookings(wallet: `0x${string}` | undefined): {
  state: ReadState;
  bookings: StayInfo[];
  refetch: () => void;
} {
  const { data, isError, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.stayBooking,
    abi: stayAbi,
    functionName: "getUserBookings",
    args: wallet ? [wallet] : undefined,
    query: { enabled: !!wallet, refetchInterval: 30_000 },
  });
  const bookings = useMemo(() => {
    if (!data) return [];
    const rows = data as unknown as [bigint, bigint][];
    return rows.map(([batchId, day]) => ({ batchId: Number(batchId), day, nights: 0, guests: 0, total: 0n }));
  }, [data]);
  return { state: isError ? "unavailable" : "live", bookings, refetch };
}

export function useStayPrice(batchId: number): bigint | undefined {
  const { data } = useReadContract({
    address: CONTRACT_ADDRESSES.stayBooking,
    abi: stayAbi,
    functionName: "pricePerNight",
    args: [BigInt(batchId)],
    query: { refetchInterval: 60_000 },
  });
  return data as bigint | undefined;
}

export function useIsBooked(batchId: number, day: bigint | undefined): boolean | undefined {
  const { data } = useReadContract({
    address: CONTRACT_ADDRESSES.stayBooking,
    abi: stayAbi,
    functionName: "isBooked",
    args: day !== undefined ? [BigInt(batchId), day] : undefined,
    query: { enabled: day !== undefined, refetchInterval: 15_000 },
  });
  return data as boolean | undefined;
}

export function useGetStay(batchId: number, day: bigint | undefined): {
  booker: `0x${string}`;
  nights: number;
  guests: number;
  total: bigint;
} | undefined {
  const { data } = useReadContract({
    address: CONTRACT_ADDRESSES.stayBooking,
    abi: stayAbi,
    functionName: "getStay",
    args: day !== undefined ? [BigInt(batchId), day] : undefined,
    query: { enabled: day !== undefined },
  });
  if (!data) return undefined;
  const t = data as unknown as [`0x${string}`, bigint, bigint, bigint];
  return { booker: t[0], nights: Number(t[1]), guests: Number(t[2]), total: t[3] };
}

export function useAdminAddress(): `0x${string}` | undefined {
  const { data } = useReadContract({
    address: CONTRACT_ADDRESSES.factory,
    abi: factoryAbi,
    functionName: "admin",
  });
  return data as `0x${string}` | undefined;
}
