"use client";

import Link from "next/link";
import { useAccount, useReadContract, useWriteContract, usePublicClient } from "wagmi";
import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { allBatches, getBatchAddress, type LandBatch } from "@/lib/config";

import LandBatchAbi from "@/lib/abi/LandBatch.json";
import { PageHeader } from "@/components/site/page-header";
import { Sprout, Timer } from "lucide-react";
import { CropArt } from "@/components/site/farm-art";
import { CoinRain } from "@/components/site/confetti";
import { SuccessStamp } from "@/components/site/success-stamp";
import { CountUp } from "@/components/site/count-up";

const GROWTH_STAGES = ["Seedling", "Vegetative", "Flowering", "Fruiting", "Harvest Ready"];

function useSafeAccount() {
  try {
    return useAccount();
  } catch {
    return { isConnected: false, address: undefined };
  }
}

function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    let mounted = true;
    const tick = () => {
      if (mounted) setNow(Math.floor(Date.now() / 1000));
    };
    const timeout = setTimeout(tick, 0);
    const interval = setInterval(tick, intervalMs);
    return () => {
      mounted = false;
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [intervalMs]);
  return now;
}

function fmt(value: unknown, decimals = 18, digits = 2) {
  if (value === undefined || value === null) return "—";
  const n = Number(formatUnits(value as bigint, decimals));
  return n.toLocaleString(undefined, { maximumFractionDigits: digits });
}

function shortAddr(a?: string) {
  return a ? `${a.slice(0, 6)}...${a.slice(-4)}` : "";
}

function fmtCountdown(seconds: number) {
  if (seconds <= 0) return "ready";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  if (days > 0) return `${days}d ${hours}h left`;
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m left`;
}

function HoldingCard({ batch, address }: { batch: LandBatch; address: `0x${string}` }) {
  const addr = getBatchAddress(batch);
  const enabled = !!addr && !!address;

  const { data: balance } = useReadContract({
    address: addr,
    abi: LandBatchAbi,
    functionName: "balanceOf",
    args: [address],
    query: { enabled },
  });
  const { data: info } = useReadContract({
    address: addr,
    abi: LandBatchAbi,
    functionName: "getInvestorInfo",
    args: [address],
    query: { enabled },
  });
  const { data: pricePerToken } = useReadContract({
    address: addr,
    abi: LandBatchAbi,
    functionName: "pricePerToken",
    query: { enabled },
  });
  const { data: growthStage } = useReadContract({
    address: addr,
    abi: LandBatchAbi,
    functionName: "growthStage",
    query: { enabled },
  });
  const { data: currentYear } = useReadContract({
    address: addr,
    abi: LandBatchAbi,
    functionName: "currentYear",
    query: { enabled },
  });
  const { data: cropNumber } = useReadContract({
    address: addr,
    abi: LandBatchAbi,
    functionName: "cropNumber",
    query: { enabled },
  });
  const { data: investorShareBps } = useReadContract({
    address: addr,
    abi: LandBatchAbi,
    functionName: "investorShareBps",
    query: { enabled },
  });
  const { data: totalSupply } = useReadRecord(addr, "totalSupply", enabled);
  const { data: soldTokens } = useReadRecord(addr, "soldTokens", enabled);
  const { data: sellRequest } = useReadContract({
    address: addr,
    abi: LandBatchAbi,
    functionName: "getSellRequest",
    args: [address],
    query: { enabled },
  });
  const { data: sellCooldown } = useReadContract({
    address: addr,
    abi: LandBatchAbi,
    functionName: "SELL_COOLDOWN",
    query: { enabled },
  });

  const { writeContractAsync, isPending } = useWriteContract();
  const publicClient = usePublicClient();
  const now = useNow();
  const [statusMsg, setStatusMsg] = useState("");
  const [celebrated, setCelebrated] = useState<{ kind: "claim" | "sell"; amount: number } | null>(null);

  const waitForTx = async (hash: `0x${string}`) => {
    if (!publicClient) throw new Error("No public client");
    return publicClient.waitForTransactionReceipt({
      hash,
      timeout: 60_000,
      retryCount: 20,
    });
  };

  const doWrite = async (fn: () => Promise<`0x${string}`>, kind: "claim" | "sell", amount = 0) => {
    try {
      const hash = await fn();
      setStatusMsg("Transaction submitted — confirming...");
      const receipt = await waitForTx(hash);
      if (receipt.status === "success") {
        setStatusMsg(kind === "claim" ? "Revenue claimed!" : "Tokens sold — mUSDC sent to you.");
        setCelebrated({ kind, amount });
      } else {
        setStatusMsg("Transaction failed on-chain.");
      }
    } catch (e: any) {
      const msg = String(e?.message || "");
      if (msg.includes("rejected")) setStatusMsg("You rejected the transaction.");
      else setStatusMsg((msg.length > 90 ? msg.slice(0, 90) + "..." : msg) || "Transaction failed.");
    }
  };

  const bal = balance as bigint | undefined;
  const infoObj = info as
    | { isFixedReturn: boolean; totalInvested: bigint; claimedRevenue: bigint; pendingRevenue: bigint }
    | undefined;
  const invested = infoObj?.totalInvested;
  const claimed = infoObj?.claimedRevenue;
  const pending = infoObj?.pendingRevenue;
  const isFixed = infoObj?.isFixedReturn;

  if (bal !== undefined && bal === BigInt(0)) return null;
  if (bal === undefined) return <div key={batch.id} />;

  const value = pricePerToken !== undefined && bal !== undefined ? (bal * (pricePerToken as bigint)) / BigInt(10) ** BigInt(18) : undefined;
  const stage = growthStage !== undefined ? Number(growthStage) : 0;
  const sharePct = investorShareBps !== undefined && investorShareBps !== null ? Number(investorShareBps) / 100 : 70;
  const soldPct =
    totalSupply !== undefined && soldTokens !== undefined && (totalSupply as bigint) > BigInt(0)
      ? Math.min(100, (Number((soldTokens as bigint) * BigInt(10000)) / Number(totalSupply as bigint)) / 100)
      : 0;
  const sellReq = sellRequest as { tokenAmount?: bigint; requestTime?: bigint; active?: boolean } | undefined;
  const sellActive = sellReq?.active === true;
  const cooldownSecs = sellCooldown !== undefined ? Number(sellCooldown) : 0;
  const sellReady =
    sellActive &&
    sellReq?.requestTime !== undefined &&
    Number(sellReq.requestTime) + cooldownSecs <= now;
  const secondsLeft = sellActive && sellReq?.requestTime !== undefined
    ? Number(sellReq.requestTime) + cooldownSecs - now
    : 0;
  const pendingNum = pending ? Number(formatUnits(pending as bigint, 18)) : 0;

  return (
    <div className="sticker-card animate-pop-in bg-white p-6">
      <div className="relative overflow-hidden">
        {celebrated && (
          <>
            <CoinRain />
            <div className="relative z-10 mb-4 flex flex-col items-center rounded-2xl border-2 border-dashed border-emerald-600 bg-emerald-50/80 p-5">
              <SuccessStamp
                label={celebrated.kind === "claim" ? "Revenue claimed!" : "Tokens sold!"}
                sublabel={celebrated.kind === "claim" ? "to your wallet" : "paid from the buyback reserve"}
              />
              {celebrated.amount > 0 && (
                <div className="mt-3 text-center">
                  <CountUp value={celebrated.amount} decimals={2} className="text-2xl font-bold text-emerald-700" />
                  <span className="ml-1 text-sm font-bold text-zinc-500">mUSDC</span>
                </div>
              )}
            </div>
          </>
        )}

        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <CropArt cropType={batch.cropType} className="h-16 w-16 shrink-0 rounded-2xl border-2 border-ink-800" />
            <div>
              <h3 className="font-heading text-xl font-bold text-ink-900">{batch.cropType}</h3>
              <p className="text-sm text-zinc-500">{batch.acres} acres · Crop {Number(cropNumber ?? BigInt(1))} · Year {Number(currentYear ?? BigInt(0))}</p>
            </div>
          </div>
          <span className="sticker-badge bg-emerald-100 text-emerald-700">
            {GROWTH_STAGES[stage] ?? GROWTH_STAGES[0]}
          </span>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div className="rounded-2xl border-2 border-ink-100 bg-ink-50 p-3">
            <div className="text-xs font-bold text-zinc-500">Tokens</div>
            <div className="font-heading text-base font-bold text-ink-900">{fmt(bal)} LAND</div>
          </div>
          <div className="rounded-2xl border-2 border-ink-100 bg-ink-50 p-3">
            <div className="text-xs font-bold text-zinc-500">Invested</div>
            <div className="font-heading text-base font-bold text-ink-900">{fmt(invested)} mUSDC</div>
          </div>
          <div className="rounded-2xl border-2 border-ink-100 bg-ink-50 p-3">
            <div className="text-xs font-bold text-zinc-500">Claimed</div>
            <div className="font-heading text-base font-bold text-emerald-700">{fmt(claimed)} mUSDC</div>
          </div>
          <div className="rounded-2xl border-2 border-ink-100 bg-ink-50 p-3">
            <div className="text-xs font-bold text-zinc-500">Pending</div>
            <div className="font-heading text-base font-bold text-amber-600">{fmt(pending)} mUSDC</div>
          </div>
        </div>

        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-semibold text-zinc-500">Sale progress · {fmt(soldTokens)} / {fmt(totalSupply)} sold</span>
          <span className="font-semibold text-zinc-500">
            Value ≈ {fmt(value)} mUSDC{isFixed ? " · Fixed return" : ""}
          </span>
        </div>
        <div className="mb-3 h-3 overflow-hidden rounded-full border-2 border-ink-800 bg-ink-50">
          <div className="h-full rounded-full bg-emerald-500 striped-bar" style={{ width: `${soldPct}%` }} />
        </div>

        {sellActive && (
          <div className="mb-3 flex items-start gap-2 rounded-2xl border-2 border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            <Timer className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              {sellReady ? (
                "Cooldown done — your harvest stopped at the request. Execute the sell to get paid."
              ) : (
                <>
                  <span className="font-bold">Sell pending · {fmtCountdown(secondsLeft)}.</span>{" "}
                  Your harvest stopped the moment you requested — no further revenue accumulates.{" "}
                  <span className="font-bold">After the cooldown you&apos;re paid principal + 1%/yr appreciation, from the buyback reserve.</span>
                </>
              )}
            </span>
          </div>
        )}

        {statusMsg && <p className="mb-3 text-xs font-semibold text-zinc-500 break-words">{statusMsg}</p>}

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => doWrite(
              () => writeContractAsync({ address: addr as `0x${string}`, abi: LandBatchAbi, functionName: "claimRevenue" }),
              "claim",
              pendingNum
            )}
            disabled={!pending || (pending as bigint) === BigInt(0) || isPending}
            className="sticker-btn sticker-btn-amber !px-4 !py-2 text-sm"
          >
            {pending && (pending as bigint) > BigInt(0) ? `Claim ${fmt(pending)} mUSDC` : "Claim Revenue"}
          </button>
          {sellReady ? (
            <button
              onClick={() => doWrite(() => writeContractAsync({ address: addr as `0x${string}`, abi: LandBatchAbi, functionName: "executeSell" }), "sell")}
              disabled={isPending}
              className="sticker-btn sticker-btn-amber !px-4 !py-2 text-sm"
            >
              Execute Sell
            </button>
          ) : sellActive ? (
            <span className="sticker-badge bg-rose-100 text-rose-700">
              Sell pending (cooldown)
            </span>
          ) : (
            <button
              onClick={() => doWrite(() => writeContractAsync({ address: addr as `0x${string}`, abi: LandBatchAbi, functionName: "requestSell", args: [bal as bigint] }), "sell")}
              disabled={!bal || (bal as bigint) === BigInt(0) || isPending}
              className="sticker-btn sticker-btn-outline !px-4 !py-2 text-sm"
            >
              Sell All
            </button>
          )}
          <Link
            href={`/batch/${batch.id}`}
            className="sticker-btn sticker-btn-outline !px-4 !py-2 text-sm"
          >
            View Details
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 border-t-2 border-ink-100 pt-3 text-xs text-zinc-500">
          <span><span className="font-bold text-ink-900">{sharePct}%</span> share to you this year</span>
          <span><span className="font-bold text-ink-900">−5 pts/yr</span> on a mid-stream sale</span>
          <span><span className="font-bold text-ink-900">+1%/yr</span> appreciation after cooldown</span>
          <span><span className="font-bold text-ink-900">90d</span> sell cooldown</span>
        </div>
      </div>
    </div>
  );
}

function useReadRecord(addr: `0x${string}` | undefined, functionName: string, enabled: boolean) {
  return useReadContract({
    address: addr,
    abi: LandBatchAbi,
    functionName,
    query: { enabled },
  });
}

export default function Portfolio() {
  const { isConnected, address } = useSafeAccount();
  const [claimAllStatus, setClaimAllStatus] = useState("");
  const { writeContractAsync, isPending } = useWriteContract();
  const publicClient = usePublicClient();

  const pendingByBatch = allBatches().map((batch) => {
    const addr = getBatchAddress(batch);
    return { batch, addr };
  });

  const infoResults = pendingByBatch.map(({ addr }) =>
    useReadContract({
      address: addr,
      abi: LandBatchAbi,
      functionName: "getInvestorInfo",
      args: address ? [address as `0x${string}`] : undefined,
      query: { enabled: !!address },
    })
  );

  const balanceResults = pendingByBatch.map(({ addr }) =>
    useReadContract({
      address: addr,
      abi: LandBatchAbi,
      functionName: "balanceOf",
      args: address ? [address as `0x${string}`] : undefined,
      query: { enabled: !!address },
    })
  );

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <PageHeader
          title="Cropfolio"
          subtitle="Your acres, your revenue, your claims — read straight from the contracts."
        />
        <div className="sticker-card animate-pop-in bg-white p-14 text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-ink-800 bg-emerald-100 text-emerald-600 shadow-[3px_3px_0_0_oklch(0.2_0.05_152)]">
            <Sprout className="h-7 w-7" />
          </span>
          <p className="font-heading text-xl font-bold text-ink-900">Your ledger isn&apos;t open yet</p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-zinc-500">
            Connect your wallet to see the land you hold, the revenue you&apos;ve claimed, and the
            harvest still owing to you.
          </p>
        </div>
      </div>
    );
  }

  const anyBalance = balanceResults.some((r) => r.data !== undefined && (r.data as bigint) > BigInt(0));
  const loading = balanceResults.some((r) => r.isLoading) && !anyBalance;

  const totals = infoResults.reduce(
    (acc, r) => {
      const d = r.data as
        | { isFixedReturn: boolean; totalInvested: bigint; claimedRevenue: bigint; pendingRevenue: bigint }
        | undefined;
      if (d) {
        acc.invested += d.totalInvested;
        acc.claimed += d.claimedRevenue;
        acc.pending += d.pendingRevenue;
      }
      return acc;
    },
    { invested: BigInt(0), claimed: BigInt(0), pending: BigInt(0) }
  );

  const waitForTx = async (hash: `0x${string}`) => {
    if (!publicClient) throw new Error("No public client");
    return publicClient.waitForTransactionReceipt({ hash, timeout: 60_000, retryCount: 20 });
  };

  const handleClaimAll = async () => {
    const withPending = infoResults
      .map((r, i) => ({ batch: pendingByBatch[i].batch, addr: pendingByBatch[i].addr, data: r.data }))
      .filter((x) => {
        const d = x.data as
          | { isFixedReturn: boolean; totalInvested: bigint; claimedRevenue: bigint; pendingRevenue: bigint }
          | undefined;
        return !!d && d.pendingRevenue > BigInt(0);
      });
    if (withPending.length === 0) {
      setClaimAllStatus("No pending revenue to claim.");
      return;
    }
    for (let i = 0; i < withPending.length; i++) {
      const { batch, addr } = withPending[i];
      setClaimAllStatus(`Claiming ${batch.cropType} (${i + 1}/${withPending.length})...`);
      try {
        const hash = await writeContractAsync({
          address: addr as `0x${string}`,
          abi: LandBatchAbi,
          functionName: "claimRevenue",
        });
        await waitForTx(hash);
      } catch (e: any) {
        const msg = String(e?.message || "");
        setClaimAllStatus(msg.includes("rejected") ? `Claim for ${batch.cropType} rejected.` : `Claim for ${batch.cropType} failed.`);
        return;
      }
    }
    setClaimAllStatus("All pending revenue claimed.");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader title="Cropfolio" subtitle={`${shortAddr(address)} · on Monad Testnet`} />

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <div className="sticker-card animate-pop-in bg-white p-6">
          <div className="mb-1 text-sm font-bold text-zinc-500">Total Invested</div>
          <CountUp value={Number(formatUnits(totals.invested, 18))} decimals={2} className="font-heading text-4xl font-bold text-ink-900" />
          <span className="ml-1 font-bold text-zinc-500">mUSDC</span>
        </div>
        <div className="sticker-card animate-pop-in bg-emerald-50 p-6" style={{ animationDelay: "100ms" }}>
          <div className="mb-1 text-sm font-bold text-zinc-500">Revenue Claimed</div>
          <CountUp value={Number(formatUnits(totals.claimed, 18))} decimals={2} className="font-heading text-4xl font-bold text-emerald-700" />
          <span className="ml-1 font-bold text-zinc-500">mUSDC</span>
        </div>
        <div className="sticker-card animate-pop-in bg-amber-50 p-6" style={{ animationDelay: "150ms" }}>
          <div className="mb-1 text-sm font-bold text-zinc-500">Pending Revenue</div>
          <div className="mb-3 font-heading text-4xl font-bold text-amber-600 tabular">
            <CountUp value={Number(formatUnits(totals.pending, 18))} decimals={2} />
            <span className="ml-1 text-lg font-bold text-zinc-500">mUSDC</span>
          </div>
          <button
            onClick={handleClaimAll}
            disabled={totals.pending === BigInt(0) || isPending}
            className="sticker-btn sticker-btn-amber !px-4 !py-2 text-sm"
          >
            Claim All
          </button>
          {claimAllStatus && <p className="mt-2 text-xs font-semibold text-zinc-500 break-words">{claimAllStatus}</p>}
        </div>
      </div>

      <div className="mb-8 sticker-card flex flex-wrap items-center gap-x-6 gap-y-2 bg-ink-50 px-5 py-4 text-xs font-semibold text-zinc-600">
        <span>Sell terms: <span className="text-ink-900">90-day cooldown</span> once you request.</span>
        <span>Harvest stops at request — <span className="text-ink-900">no revenue after exit</span>.</span>
        <span>Payout = principal <span className="text-ink-900">+ 1%/yr appreciation</span>, paid from the buyback reserve.</span>
      </div>

      {loading ? (
        <div className="sticker-card animate-pop-in bg-white p-12 text-center">
          <p className="font-bold text-zinc-400">Loading your holdings...</p>
        </div>
      ) : !anyBalance ? (
        <div className="sticker-card animate-pop-in bg-white p-12 text-center" style={{ animationDelay: "200ms" }}>
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-ink-800 bg-emerald-100 text-emerald-600 shadow-[3px_3px_0_0_oklch(0.2_0.05_152)]">
            <Sprout className="h-7 w-7" />
          </span>
          <p className="font-heading text-xl font-bold text-ink-900">No acres on your ledger yet</p>
          <p className="mb-6 mt-2 text-sm text-zinc-600">Browse the marketplace to buy your first land tokens</p>
          <Link href="/marketplace" className="sticker-btn sticker-btn-amber !px-5 !py-2.5 text-sm">
            Browse the parcels
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingByBatch.map(({ batch }) => (
            <HoldingCard key={batch.id} batch={batch} address={address as `0x${string}`} />
          ))}
        </div>
      )}
    </div>
  );
}
