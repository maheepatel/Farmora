"use client";

import { useParams } from "next/navigation";
import { useAccount, useReadContract, useWriteContract, usePublicClient } from "wagmi";
import { useState } from "react";
import { formatUnits } from "viem";
import { getBatchById, getBatchAddress, CONTRACT_ADDRESSES } from "@/lib/config";
import Link from "next/link";
import { ArrowLeft, Wallet } from "lucide-react";

import LandBatchAbi from "@/lib/abi/LandBatch.json";
import MockUSDCAbi from "@/lib/abi/MockUSDC.json";
import { CropArt } from "@/components/site/farm-art";
import { ConfettiBurst, CoinRain } from "@/components/site/confetti";
import { SuccessStamp } from "@/components/site/success-stamp";
import { CountUp } from "@/components/site/count-up";
import { ReturnEstimator } from "@/components/site/return-estimator";

const GROWTH_STAGES = ["Seedling", "Vegetative", "Flowering", "Fruiting", "Harvest Ready"];

const cropThemes: Record<string, { accent: string }> = {
  Saffron: { accent: "text-purple-700" },
  Cordyceps: { accent: "text-orange-700" },
  Mushroom: { accent: "text-stone-600" },
  "Dragon Fruit": { accent: "text-pink-600" },
  Pomegranate: { accent: "text-rose-700" },
  Grapes: { accent: "text-violet-700" },
  Turmeric: { accent: "text-yellow-700" },
  Ginger: { accent: "text-amber-700" },
};

function useSafeAccount() {
  try {
    return useAccount();
  } catch {
    return { address: undefined, isConnected: false };
  }
}

export default function BatchDetail() {
  const params = useParams();
  const id = Number(params.id);
  const batch = getBatchById(id);
  const { address, isConnected } = useSafeAccount();
  const [buyAmount, setBuyAmount] = useState("");
  const [returnType, setReturnType] = useState<"fixed" | "variable">("variable");
  const [statusMsg, setStatusMsg] = useState("");
  const [celebrated, setCelebrated] = useState(false);
  const batchAddress = batch ? getBatchAddress(batch) : undefined;
  const isOnChain = !!batchAddress;

  const { data: cropType } = useReadContract({
    address: batchAddress,
    abi: LandBatchAbi,
    functionName: "cropType",
    query: { enabled: !!isOnChain },
  });
  const { data: totalSupply } = useReadContract({
    address: batchAddress,
    abi: LandBatchAbi,
    functionName: "totalSupply",
    query: { enabled: !!isOnChain },
  });
  const { data: investorShareBps } = useReadContract({
    address: batchAddress,
    abi: LandBatchAbi,
    functionName: "investorShareBps",
    query: { enabled: !!isOnChain },
  });
  const { data: growthStage } = useReadContract({
    address: batchAddress,
    abi: LandBatchAbi,
    functionName: "growthStage",
    query: { enabled: !!isOnChain },
  });
  const { data: currentYear } = useReadContract({
    address: batchAddress,
    abi: LandBatchAbi,
    functionName: "currentYear",
    query: { enabled: !!isOnChain },
  });
  const { data: cropCycleYears } = useReadContract({
    address: batchAddress,
    abi: LandBatchAbi,
    functionName: "cropCycleYears",
    query: { enabled: !!isOnChain },
  });
  const { data: cropNumber } = useReadContract({
    address: batchAddress,
    abi: LandBatchAbi,
    functionName: "cropNumber",
    query: { enabled: !!isOnChain },
  });
  const { data: availableTokens } = useReadContract({
    address: batchAddress,
    abi: LandBatchAbi,
    functionName: "getAvailableTokens",
    query: { enabled: !!isOnChain },
  });
  const { data: soldTokens } = useReadContract({
    address: batchAddress,
    abi: LandBatchAbi,
    functionName: "soldTokens",
    query: { enabled: !!isOnChain },
  });
  const { data: buybackReserve } = useReadContract({
    address: batchAddress,
    abi: LandBatchAbi,
    functionName: "buybackReserve",
    query: { enabled: !!isOnChain },
  });
  const { data: totalRevenue } = useReadContract({
    address: batchAddress,
    abi: LandBatchAbi,
    functionName: "totalRevenueDistributed",
    query: { enabled: !!isOnChain },
  });
  const { data: fixedReturnBps } = useReadContract({
    address: batchAddress,
    abi: LandBatchAbi,
    functionName: "fixedReturnBps",
    query: { enabled: !!isOnChain },
  });
  const { data: mockUSDDBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.mockUSDC as `0x${string}`,
    abi: MockUSDCAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!isConnected },
  });
  const { data: usdcAllowance } = useReadContract({
    address: CONTRACT_ADDRESSES.mockUSDC as `0x${string}`,
    abi: MockUSDCAbi,
    functionName: "allowance",
    args: address && batchAddress ? [address, batchAddress] : undefined,
    query: { enabled: !!isConnected && !!batchAddress },
  });

  const { writeContractAsync: faucetWrite, isPending: faucetPending } = useWriteContract();
  const { writeContractAsync: buyWrite, isPending: buyPending } = useWriteContract();
  const { writeContractAsync: approveWrite, isPending: approvePending } = useWriteContract();
  const publicClient = usePublicClient();

  const waitForTx = async (hash: `0x${string}`) => {
    if (!publicClient) throw new Error("No public client");
    return publicClient.waitForTransactionReceipt({
      hash,
      timeout: 60_000,
      retryCount: 20,
    });
  };

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const handleFaucet = async (retryCount = 3) => {
    for (let attempt = 0; attempt < retryCount; attempt++) {
      try {
        setStatusMsg(`Minting MockUSDC${attempt > 0 ? ` (attempt ${attempt + 1}/${retryCount})` : ""}...`);
        await faucetWrite({
          address: CONTRACT_ADDRESSES.mockUSDC as `0x${string}`,
          abi: MockUSDCAbi,
          functionName: "faucet",
        });
        setStatusMsg("Minted! Balance refreshed.");
        return;
      } catch (e: any) {
        const msg = e?.message || "";
        if (msg.includes("Already claimed")) {
          setStatusMsg("Already claimed MockUSDC.");
          return;
        }
        if (msg.includes("rate limited") || msg.includes("rate_limit")) {
          const delay = Math.min(2000 * 2 ** attempt + Math.random() * 1000, 15000);
          if (attempt < retryCount - 1) {
            setStatusMsg(`Rate limited — retrying in ${Math.round(delay / 1000)}s...`);
            await sleep(delay);
            continue;
          }
          setStatusMsg("Monad RPC is busy. Wait 10-15s, then click Mint again.");
          return;
        }
        setStatusMsg(msg.length > 80 ? msg.slice(0, 80) + "..." : msg);
        return;
      }
    }
  };

  const handleBuy = async () => {
    if (!batch || !buyAmount || !batchAddress || !address) return;
    setCelebrated(false);

    let tokenAmount: bigint;
    let costWei: bigint;
    try {
      tokenAmount =
        BigInt(Math.floor(Number(buyAmount) * Number(batch.tokensPerAcre))) * BigInt(10) ** BigInt(18);
      const pricePerTokenWei = BigInt(Math.round(Number(batch.pricePerToken) * 10 ** 18));
      costWei = (tokenAmount * pricePerTokenWei) / BigInt(10) ** BigInt(18);
    } catch {
      setStatusMsg("Invalid acres amount. Enter a number like 1 or 2.5.");
      return;
    }

    try {
      const allowance = usdcAllowance !== undefined ? (usdcAllowance as bigint) : BigInt(0);
      if (allowance < costWei) {
        setStatusMsg("Step 1/2 — Approving USDC, confirm in your wallet...");
        const approveHash = await approveWrite({
          address: CONTRACT_ADDRESSES.mockUSDC as `0x${string}`,
          abi: MockUSDCAbi,
          functionName: "approve",
          args: [batchAddress, costWei],
        });
        setStatusMsg("Approve sent — waiting for confirmation...");
        const approveReceipt = await waitForTx(approveHash);
        if (approveReceipt.status !== "success") {
          setStatusMsg("Approve failed on-chain. Try again.");
          return;
        }
        setStatusMsg("Approved! Step 2/2 — buying tokens, confirm in your wallet...");
      } else {
        setStatusMsg("Buying tokens, confirm in your wallet...");
      }
    } catch (e: any) {
      console.error("APPROVE STEP ERROR:", e);
      const msg = String(e?.message || "");
      if (msg.includes("User rejected") || msg.includes("user rejected") || msg.includes("Action rejected")) {
        setStatusMsg("You rejected the approval in your wallet. Click Approve & Buy again to retry.");
      } else if (msg.includes("rate limited") || msg.includes("rate_limit") || msg.includes("request limit")) {
        setStatusMsg("Monad RPC is busy. Wait 15s and try again.");
      } else {
        setStatusMsg(
          (msg.length > 110 ? msg.slice(0, 110) + "..." : msg) || "Approve step failed. See browser console (F12) for details."
        );
      }
      return;
    }

    try {
      const buyHash = await buyWrite({
        address: batchAddress,
        abi: LandBatchAbi,
        functionName: "buyTokens",
        args: [tokenAmount, returnType === "fixed"],
      });
      setStatusMsg("Purchase submitted — confirming...");
      const buyReceipt = await waitForTx(buyHash);
      if (buyReceipt.status === "success") {
        setStatusMsg("Purchase successful! Tokens minted.");
        setCelebrated(true);
      } else {
        setStatusMsg("Purchase failed on-chain. Try again.");
      }
    } catch (e: any) {
      console.error("BUY STEP ERROR:", e);
      const msg = String(e?.message || "");
      if (msg.includes("User rejected") || msg.includes("user rejected") || msg.includes("Action rejected")) {
        setStatusMsg("You rejected the purchase in your wallet. Click Approve & Buy again to retry.");
      } else if (msg.includes("execution reverted")) {
        setStatusMsg("Transaction reverted — check your mUSDC balance and allowance.");
      } else if (msg.includes("rate limited") || msg.includes("rate_limit") || msg.includes("request limit")) {
        setStatusMsg("Monad RPC is busy. Wait 15s and try again.");
      } else {
        setStatusMsg(
          (msg.length > 110 ? msg.slice(0, 110) + "..." : msg) || "Buy step failed. See browser console (F12) for details."
        );
      }
    }
  };

  if (!batch) return <div className="p-8 text-center text-zinc-500">Batch not found</div>;

  const theme = cropThemes[batch.cropType] || cropThemes.Turmeric;

  const vals = {
    sharePct: investorShareBps !== undefined && investorShareBps !== null ? Number(investorShareBps) / 100 : 70,
    stage: growthStage !== undefined && growthStage !== null ? Number(growthStage) : 1,
    year: currentYear !== undefined && currentYear !== null ? Number(currentYear) : 0,
    cycle: cropCycleYears !== undefined && cropCycleYears !== null ? Number(cropCycleYears) : batch.cropCycleYears,
    crop: cropNumber !== undefined && cropNumber !== null ? Number(cropNumber) : 1,
    avail: availableTokens ? Number(formatUnits(availableTokens as bigint, 18)) : 0,
    sold: soldTokens ? Number(formatUnits(soldTokens as bigint, 18)) : 0,
    buyback: buybackReserve ? Number(formatUnits(buybackReserve as bigint, 18)) : 0,
    revenue: totalRevenue ? Number(formatUnits(totalRevenue as bigint, 18)) : 0,
    mUSDCbal: mockUSDDBalance ? Number(formatUnits(mockUSDDBalance as bigint, 18)) : 0,
    supply: totalSupply ? Number(formatUnits(totalSupply as bigint, 18)) : 0,
    fixedPct: fixedReturnBps !== undefined && fixedReturnBps !== null ? Number(fixedReturnBps) / 100 : undefined,
  };

  const tokenAmount = buyAmount ? Math.floor(Number(buyAmount) * Number(batch.tokensPerAcre)) : 0;
  const usdcAmount = tokenAmount * Number(batch.pricePerToken);
  const soldPct = vals.supply > 0 ? (vals.sold / vals.supply) * 100 : 0;
  const progressPct = vals.cycle > 0 ? Math.min(100, Math.round((vals.year / vals.cycle) * 100)) : 0;
  const allowanceNum = usdcAllowance !== undefined ? Number(formatUnits(usdcAllowance as bigint, 18)) : 0;
  const needsApproval = usdcAmount > 0 && allowanceNum < usdcAmount;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/marketplace" className="mb-6 inline-flex items-center gap-1.5 text-sm font-bold text-zinc-500 transition-colors hover:text-emerald-700">
        <ArrowLeft className="h-4 w-4" />
        Back to Marketplace
      </Link>

      <div className="relative mb-10 overflow-hidden rounded-3xl border-2 border-ink-800 bg-white shadow-sticker-lg animate-pop-in">
        <div className="relative border-b-2 border-ink-800 bg-ink-50 p-4">
          <CropArt cropType={batch.cropType} className="aspect-[21/9] w-full rounded-2xl border-2 border-ink-800" />
          {!isOnChain && (
            <span className="sticker-badge absolute right-5 top-5 bg-amber-400 text-amber-950">
              Not deployed
            </span>
          )}
          <span className="sticker-badge absolute bottom-5 left-5 bg-white text-ink-900">
            {batch.acres} acres &middot; {batch.totalValue}
          </span>
        </div>
        <div className="p-8">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-ink-900 lg:text-5xl">
            {(cropType as string) || batch.cropType}
          </h1>
          <p className={`mt-2 text-lg font-bold ${theme.accent}`}>
            {batch.acres} acres &middot; {batch.totalValue} valuation &middot; {batch.harvestCycle}
          </p>
          <ReturnEstimator
            batch={batch}
            totalSupply={vals.supply}
            investorSharePct={vals.sharePct}
            accent={theme.accent}
          />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <div className="animate-pop-in" style={{ animationDelay: "100ms" }}>
            <div className="sticker-card bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-heading text-lg font-bold text-ink-900">Crop Progress</h3>
                <span className="sticker-badge bg-ink-100 text-ink-800">
                  Crop {vals.crop} · Year {vals.year} of {vals.cycle}
                </span>
              </div>
              <div className="mb-4 flex flex-wrap gap-2">
                {GROWTH_STAGES.map((s, i) => (
                  <span
                    key={s}
                    className={`sticker-badge ${
                      i === vals.stage
                        ? "bg-emerald-600 text-white"
                        : i < vals.stage
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-zinc-200 text-zinc-500"
                    }`}
                  >
                    {s}
                  </span>
                ))}
              </div>
              <div className="h-4 overflow-hidden rounded-full border-2 border-ink-800 bg-ink-50">
                <div
                  className="h-full rounded-full bg-emerald-500 striped-bar transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="mt-2 text-xs font-semibold text-zinc-600">
                {progressPct}% to the harvest · replants as a fresh 70 / 30 crop
              </p>
            </div>
          </div>

          <div className="animate-pop-in" style={{ animationDelay: "150ms" }}>
            <div className="sticker-card bg-white p-6">
              <h3 className="mb-4 font-heading text-lg font-bold text-ink-900">Revenue Split</h3>
              <div className="flex items-center gap-3">
                <div className="flex-1 rounded-2xl border-2 border-ink-800 bg-emerald-50 p-4 text-center">
                  <CountUp value={vals.sharePct} decimals={0} suffix="%" className="text-4xl font-bold text-emerald-700" />
                  <div className="mt-1 text-sm font-bold text-zinc-500">Investor</div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="h-8 w-1 rounded-full bg-ink-800" />
                </div>
                <div className="flex-1 rounded-2xl border-2 border-ink-800 bg-amber-50 p-4 text-center">
                  <div className="text-4xl font-bold text-amber-700">{100 - vals.sharePct}%</div>
                  <div className="mt-1 text-sm font-bold text-zinc-500">Farmer</div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-600">Slides −5 pts on a mid-stream sale</span>
                <span className="sticker-badge bg-ink-100 text-ink-800">Year {vals.year}</span>
              </div>
            </div>
          </div>

          <div className="animate-pop-in" style={{ animationDelay: "200ms" }}>
            <div className="sticker-card bg-white p-6">
              <h3 className="mb-4 font-heading text-lg font-bold text-ink-900">Details</h3>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div className="flex justify-between border-b-2 border-ink-100 pb-2">
                  <dt className="text-zinc-500">Total Acres</dt>
                  <dd className="font-bold text-ink-900">{batch.acres}</dd>
                </div>
                <div className="flex justify-between border-b-2 border-ink-100 pb-2">
                  <dt className="text-zinc-500">Token Supply</dt>
                  <dd className="font-bold text-ink-900">{vals.supply ? vals.supply.toLocaleString() : "—"} LAND</dd>
                </div>
                <div className="flex justify-between border-b-2 border-ink-100 pb-2">
                  <dt className="text-zinc-500">Available</dt>
                  <dd className="font-bold text-ink-900">{vals.avail.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between border-b-2 border-ink-100 pb-2">
                  <dt className="text-zinc-500">Sold</dt>
                  <dd className="font-bold text-ink-900">{vals.sold.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between border-b-2 border-ink-100 pb-2">
                  <dt className="text-zinc-500">First Harvest</dt>
                  <dd className="font-bold text-ink-900">{batch.firstHarvest}</dd>
                </div>
                <div className="flex justify-between border-b-2 border-ink-100 pb-2">
                  <dt className="text-zinc-500">Harvest Cycle</dt>
                  <dd className="font-bold text-ink-900">{batch.harvestCycle}</dd>
                </div>
                <div className="flex justify-between pb-2">
                  <dt className="text-zinc-500">Buyback Reserve</dt>
                  <dd className="font-bold text-emerald-700">{vals.buyback.toLocaleString()} mUSDC</dd>
                </div>
                <div className="flex justify-between pb-2">
                  <dt className="text-zinc-500">Revenue Distributed</dt>
                  <dd className="font-bold text-ink-900">{vals.revenue.toLocaleString()} mUSDC</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="animate-pop-in" style={{ animationDelay: "150ms" }}>
            <div className="relative overflow-hidden rounded-3xl border-2 border-ink-800 bg-white p-6 shadow-sticker-lg">
              {celebrated && (
                <>
                  <ConfettiBurst />
                  <CoinRain />
                </>
              )}

              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-heading text-lg font-bold text-ink-900">Buy Land Tokens</h3>
                {isConnected && vals.mUSDCbal === 0 && (
                  <button
                    onClick={() => handleFaucet()}
                    disabled={faucetPending}
                    className="sticker-btn sticker-btn-amber !px-3 !py-1.5 !text-xs"
                  >
                    {faucetPending ? "..." : "Get MockUSDC"}
                  </button>
                )}
              </div>

              {celebrated && (
                <div className="relative z-10 mb-5 flex flex-col items-center rounded-2xl border-2 border-dashed border-emerald-600 bg-emerald-50/80 p-5">
                  <SuccessStamp label="Tokens minted!" sublabel="on Monad Testnet" />
                  <div className="mt-3 flex gap-6">
                    <div className="text-center">
                      <div className="text-sm font-bold text-zinc-500">LAND</div>
                      <CountUp value={tokenAmount} className="text-2xl font-bold text-emerald-700" />
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-zinc-500">Cost</div>
                      <CountUp value={usdcAmount} className="text-2xl font-bold text-ink-900" />
                      <span className="ml-1 text-sm font-bold text-zinc-500">mUSDC</span>
                    </div>
                  </div>
                </div>
              )}

              {isConnected && (
                <div className="sticker-card mb-4 flex items-center gap-2 bg-ink-50 px-4 py-2.5 text-sm !shadow-[2px_2px_0_0_oklch(0.2_0.05_152)]">
                  <Wallet className="h-4 w-4 text-emerald-700" />
                  <span className="text-zinc-500">Balance: </span>
                  <span className="font-bold text-ink-900">{vals.mUSDCbal.toLocaleString()}</span>
                  <span className="font-bold text-zinc-500">mUSDC</span>
                </div>
              )}

              <div className="mb-4">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Acres to Purchase
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="1"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    className="w-full rounded-2xl border-2 border-ink-800 bg-white px-4 py-3 text-lg font-bold text-ink-900 placeholder-zinc-400 transition-colors focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600/20"
                  />
                  {batch?.tokensPerAcre && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                      {Number(batch.tokensPerAcre).toLocaleString()} tokens/acre
                    </span>
                  )}
                </div>
              </div>

              {tokenAmount > 0 && (
                <div className="mb-4 space-y-2 rounded-2xl border-2 border-emerald-600 bg-emerald-50 p-4">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-zinc-500">LAND Tokens</span>
                    <span className="font-bold text-ink-900">{tokenAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-zinc-500">Cost</span>
                    <span className="font-bold text-emerald-700">{usdcAmount.toLocaleString()} mUSDC</span>
                  </div>
                </div>
              )}

              <div className="mb-5">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Return Type
                </label>
                <div className="flex gap-2">
                  <button
                    className={`sticker-btn flex-1 !rounded-xl !px-3 !py-2.5 text-sm ${
                      returnType === "variable" ? "sticker-btn-amber" : "sticker-btn-outline"
                    }`}
                    onClick={() => setReturnType("variable")}
                  >
                    Variable
                  </button>
                  <button
                    className={`sticker-btn flex-1 !rounded-xl !px-3 !py-2.5 text-sm ${
                      returnType === "fixed" ? "sticker-btn-amber" : "sticker-btn-outline"
                    }`}
                    onClick={() => setReturnType("fixed")}
                  >
                    {vals.fixedPct !== undefined ? `Fixed ${vals.fixedPct.toFixed(0)}%` : "Fixed return"}
                  </button>
                </div>
              </div>

              <button
                disabled={!isConnected || !buyAmount || Number(buyAmount) <= 0 || buyPending || approvePending || !isOnChain}
                onClick={handleBuy}
                className="sticker-btn sticker-btn-amber w-full !py-3.5 text-base font-bold"
              >
                {approvePending ? "Approving..." : buyPending ? "Buying..." : needsApproval ? "Approve & Buy" : "Buy Tokens"}
              </button>

              {statusMsg && (
                <p className="mt-3 text-xs font-semibold text-zinc-500 break-words">{statusMsg}</p>
              )}
            </div>
          </div>

          <div className="animate-pop-in" style={{ animationDelay: "200ms" }}>
            <div className="sticker-card bg-white p-6">
              <h3 className="mb-4 font-heading text-lg font-bold text-ink-900">Sale Progress</h3>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-zinc-400">{vals.sold.toLocaleString()} sold</span>
                <span className="font-bold text-ink-900">{vals.supply.toLocaleString()} total</span>
              </div>
              <div className="h-4 overflow-hidden rounded-full border-2 border-ink-800 bg-ink-50">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-700 striped-bar"
                  style={{ width: `${Math.min(soldPct, 100)}%` }}
                />
              </div>
              <p className="mt-2 text-xs font-semibold text-zinc-600">{soldPct.toFixed(1)}% sold</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
