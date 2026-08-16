"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAccount, useReadContracts, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { BATCHES } from "@/lib/config";
import {
  batchAddress,
  landBatchAbi,
  useSellRequest,
  useTokenBalance,
} from "@/lib/contracts";
import { fmtUSDC, fmtTokens } from "@/lib/format";
import { toBigIntTokens } from "@/lib/estimator";

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="font-heading text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">
          Crop<span className="text-emerald-700">folio</span>
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-zinc-600">
          Every token you hold across the farm, live from the contracts.
        </p>
      </div>

      {!isConnected ? (
        <div className="mt-10">
          <div className="sticker-card mx-auto max-w-md bg-white p-8 text-center">
            <p className="text-4xl">🧑‍🌾</p>
            <h2 className="mt-3 font-heading text-2xl font-bold text-ink-900">Connect your wallet</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Your holdings, pending revenue and sell requests live on-chain.
            </p>
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button type="button" onClick={openConnectModal} className="sticker-btn mt-5">
                  Connect wallet
                </button>
              )}
            </ConnectButton.Custom>
          </div>
        </div>
      ) : (
        <HoldingGrid address={address!} />
      )}
    </div>
  );
}

function useAllInvestorInfo(address: `0x${string}`) {
  const contracts = BATCHES.map((b) => ({
    address: batchAddress(b.id)!,
    abi: landBatchAbi,
    functionName: "getInvestorInfo" as const,
    args: [address] as const,
  }));
  const { data } = useReadContracts({ contracts });
  return useMemo(
    () =>
      BATCHES.map((_, i) => {
        const t = data?.[i]?.result as unknown as
          | [boolean, bigint, bigint, bigint]
          | undefined;
        return {
          isFixedReturn: t?.[0] ?? false,
          totalInvested: t?.[1] ?? 0n,
          claimedRevenue: t?.[2] ?? 0n,
          pendingRevenue: t?.[3] ?? 0n,
        };
      }),
    [data],
  );
}

function HoldingGrid({ address }: { address: `0x${string}` }) {
  const info = useAllInvestorInfo(address);

  const totalInvested = useMemo(
    () => info.reduce((s, h) => s + h.totalInvested, 0n),
    [info],
  );
  const totalPending = useMemo(
    () => info.reduce((s, h) => s + h.pendingRevenue, 0n),
    [info],
  );

  return (
    <div>
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="sticker-card bg-white p-4 text-center">
          <p className="text-xs text-zinc-500">invested</p>
          <p className="font-heading text-2xl font-bold tabular text-emerald-700">{fmtUSDC(totalInvested)} mUSDC</p>
        </div>
        <div className="sticker-card bg-amber-50 p-4 text-center">
          <p className="text-xs text-zinc-500">Pending Revenue</p>
          <p className="font-heading text-2xl font-bold tabular text-amber-700">{fmtUSDC(totalPending)} mUSDC</p>
        </div>
        <div className="sticker-card bg-white p-4 text-center">
          <p className="text-xs text-zinc-500">batches</p>
          <p className="font-heading text-2xl font-bold tabular text-ink-900">{BATCHES.length}</p>
        </div>
        <div className="sticker-card bg-white p-4 text-center">
          <p className="text-xs text-zinc-500">wallet</p>
          <p className="font-heading text-lg font-bold tabular text-ink-900">{address.slice(0, 6)}…{address.slice(-4)}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {BATCHES.map((b, i) => (
          <HoldingCard
            key={b.id}
            meta={b}
            index={i}
            investorInfo={info[i]}
            address={address}
          />
        ))}
      </div>
    </div>
  );
}

function HoldingCard({
  meta,
  index,
  investorInfo,
  address,
}: {
  meta: (typeof BATCHES)[number];
  index: number;
  investorInfo: {
    isFixedReturn: boolean;
    totalInvested: bigint;
    claimedRevenue: bigint;
    pendingRevenue: bigint;
  };
  address: `0x${string}`;
}) {
  const [sellMode, setSellMode] = useState(false);
  const [sellAmount, setSellAmount] = useState("");
  const [claimedMsg, setClaimedMsg] = useState(false);

  const balance = useTokenBalance(meta.id, address);
  const sell = useSellRequest(meta.id, address).data;
  const { isFixedReturn: isFixed, totalInvested, claimedRevenue, pendingRevenue } = investorInfo;

  const claim = useWriteContract();
  const sellReq = useWriteContract();
  const execute = useWriteContract();

  const claimReceipt = useWaitForTransactionReceipt({ hash: claim.data });
  const sellReceipt = useWaitForTransactionReceipt({ hash: sellReq.data });
  const execReceipt = useWaitForTransactionReceipt({ hash: execute.data });

  const sellAmt = useMemo(() => {
    const n = Number(sellAmount || "0");
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  }, [sellAmount]);

  const claimable = claimReceipt.isSuccess && !claimedMsg;
  const sellDone = sellReceipt.isSuccess;
  const execDone = execReceipt.isSuccess;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 3) * 0.08 }}
      className="sticker-card flex flex-col gap-3 bg-white p-5"
    >
      <div className="flex items-center justify-between gap-2">
        <Link href={`/batch/${meta.id}`} className="group flex items-center gap-2">
          <span className="text-3xl">{meta.emoji}</span>
          <span>
            <span className="block font-heading text-xl font-bold leading-none text-ink-900 group-hover:underline decoration-2 underline-offset-2">
              {meta.cropType}
            </span>
            <span className="block text-xs text-zinc-500">{meta.tokenSymbol}</span>
          </span>
        </Link>
        <span className={`sticker-badge ${isFixed ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
          {isFixed ? "fixed" : "variable"}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-ink-50 p-2">
          <p className="text-[11px] text-zinc-500">tokens</p>
          <p className="font-heading text-lg font-bold tabular text-ink-900">{fmtTokens(balance ?? 0n)}</p>
        </div>
        <div className="rounded-xl bg-ink-50 p-2">
          <p className="text-[11px] text-zinc-500">invested</p>
          <p className="font-heading text-lg font-bold tabular text-ink-900">{fmtUSDC(totalInvested)}</p>
        </div>
        <div className="rounded-xl bg-ink-50 p-2">
          <p className="text-[11px] text-zinc-500">claimed</p>
          <p className="font-heading text-lg font-bold tabular text-ink-900">{fmtUSDC(claimedRevenue)}</p>
        </div>
      </div>

      <div className="rounded-xl bg-amber-50 p-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-zinc-600">Pending Revenue</p>
          <p className="font-heading text-2xl font-bold tabular text-amber-700">{fmtUSDC(pendingRevenue)} mUSDC</p>
        </div>
        <AnimatePresence>
          {claimable && (
            <motion.p
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mt-2 text-center font-heading font-bold text-emerald-700"
            >
              Revenue claimed! 🎉
            </motion.p>
          )}
        </AnimatePresence>
        <button
          type="button"
          className="sticker-btn mt-3 w-full !text-sm"
          disabled={pendingRevenue <= 0n || claim.isPending}
          onClick={() => {
            setClaimedMsg(false);
            claim.writeContract({
              address: batchAddress(meta.id)!,
              abi: landBatchAbi,
              functionName: "claimRevenue",
            });
          }}
        >
          {claim.isPending
            ? "Claiming…"
            : pendingRevenue > 0n
              ? `Claim ${fmtUSDC(pendingRevenue)} mUSDC`
              : "No pending revenue"}
        </button>
      </div>

      <div className="rounded-xl bg-white p-3 ring-2 ring-ink-100">
        {sell.active ? (
          <div>
            <p className="font-heading text-lg font-bold text-ink-900">
              Sell requested · {fmtTokens(sell.tokenAmount)} tokens
            </p>
            <SellCooldown
              requestTime={sell.requestTime}
              executing={execute.isPending}
              execDone={execDone}
              onExecute={() =>
                execute.writeContract({
                  address: batchAddress(meta.id)!,
                  abi: landBatchAbi,
                  functionName: "executeSell",
                })
              }
            />
          </div>
        ) : sellDone ? (
          <p className="text-center font-heading font-bold text-emerald-700">Sell requested — cooldown started ✓</p>
        ) : !sellMode ? (
          <button
            type="button"
            className="sticker-btn-outline w-full !text-sm"
            onClick={() => setSellMode(true)}
          >
            Request Sell
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <input
              type="number"
              min="1"
              placeholder="Tokens to sell"
              value={sellAmount}
              onChange={(e) => setSellAmount(e.target.value)}
              className="input-ledger font-heading"
            />
            <button
              type="button"
              className="sticker-btn w-full !bg-rose-600 !text-sm"
              disabled={sellAmt <= 0 || sellReq.isPending}
              onClick={() =>
                sellReq.writeContract({
                  address: batchAddress(meta.id)!,
                  abi: landBatchAbi,
                  functionName: "requestSell",
                  args: [toBigIntTokens(sellAmt)],
                })
              }
            >
              {sellReq.isPending ? "Requesting…" : "Lock tokens & request sell"}
            </button>
            <button
              type="button"
              className="sticker-btn-outline !text-xs"
              onClick={() => setSellMode(false)}
            >
              cancel
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function SellCooldown({
  requestTime,
  executing,
  execDone,
  onExecute,
}: {
  requestTime: bigint;
  executing: boolean;
  execDone: boolean;
  onExecute: () => void;
}) {
  const [daysLeft, setDaysLeft] = useState(90);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const tick = () => {
      const left =
        90 -
        Math.min(
          90,
          Math.floor((Date.now() / 1000 - Number(requestTime)) / 86400),
        );
      setDaysLeft(Math.max(0, left));
      setReady(true);
    };
    const id = setTimeout(tick, 0);
    const iv = setInterval(tick, 60_000);
    return () => {
      clearTimeout(id);
      clearInterval(iv);
    };
  }, [requestTime]);

  return (
    <div>
      <p className="text-sm text-zinc-600">
        Cooldown:{" "}
        <span className="font-heading font-bold text-rose-600">
          {ready ? `${daysLeft} days left` : "…"}
        </span>
      </p>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink-100">
        <div
          className="h-full rounded-full bg-rose-500"
          style={{ width: `${(1 - daysLeft / 90) * 100}%` }}
        />
      </div>
      <button
        type="button"
        className="sticker-btn mt-3 w-full !bg-rose-600 !text-sm"
        disabled={!ready || daysLeft > 0 || executing}
        onClick={onExecute}
      >
        {execDone
          ? "Sell executed! ✓"
          : !ready
            ? "Checking…"
            : daysLeft > 0
              ? `Wait ${daysLeft}d`
              : "Execute Sell"}
      </button>
    </div>
  );
}
