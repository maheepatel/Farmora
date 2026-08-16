"use client";

import { useState } from "react";
import { useAccount, useReadContract, useWriteContract, usePublicClient } from "wagmi";
import { formatUnits } from "viem";
import { allBatches, getBatchAddress, saveCreatedBatch, CONTRACT_ADDRESSES, isAdminAddress, type LandBatch } from "@/lib/config";

import LandBatchAbi from "@/lib/abi/LandBatch.json";
import LandBatchFactoryAbi from "@/lib/abi/LandBatchFactory.json";
import MockUSDCAbi from "@/lib/abi/MockUSDC.json";
import { PageHeader } from "@/components/site/page-header";

const TABS = [
  { id: "batches", label: "Batches" },
  { id: "milestones", label: "Milestones" },
  { id: "harvest", label: "Harvest & Time" },
  { id: "clips", label: "Daily Clips" },
  { id: "create", label: "Create Batch" },
] as const;

const GROWTH_STAGES = ["Seedling", "Vegetative", "Flowering", "Fruiting", "Harvest Ready"];

const isSafeUrl = (url: string) => /^(https?|ipfs):\/\//i.test(url);

function useSafeAccount() {
  try {
    return useAccount();
  } catch {
    return { isConnected: false, address: undefined };
  }
}

function fmt(value: unknown, decimals = 18, digits = 2) {
  if (value === undefined || value === null) return "—";
  return Number(formatUnits(value as bigint, decimals)).toLocaleString(undefined, { maximumFractionDigits: digits });
}

function fmtInt(value: unknown) {
  if (value === undefined || value === null) return "—";
  return Number(value).toString();
}

function BatchAdmin({ batch }: { batch: LandBatch }) {
  const addr = getBatchAddress(batch);
  const enabled = !!addr;
  const { address: userAddr } = useSafeAccount();

  const { data: soldTokens } = useReadContract({ address: addr, abi: LandBatchAbi, functionName: "soldTokens", query: { enabled } });
  const { data: buybackReserve } = useReadContract({ address: addr, abi: LandBatchAbi, functionName: "buybackReserve", query: { enabled } });
  const { data: currentYear } = useReadContract({ address: addr, abi: LandBatchAbi, functionName: "currentYear", query: { enabled } });
  const { data: growthStage } = useReadContract({ address: addr, abi: LandBatchAbi, functionName: "growthStage", query: { enabled } });
  const { data: cropCycleYears } = useReadContract({ address: addr, abi: LandBatchAbi, functionName: "cropCycleYears", query: { enabled } });
  const { data: cropNumber } = useReadContract({ address: addr, abi: LandBatchAbi, functionName: "cropNumber", query: { enabled } });
  const { data: investorShareBps } = useReadContract({ address: addr, abi: LandBatchAbi, functionName: "investorShareBps", query: { enabled } });
  const { data: farmer } = useReadContract({ address: addr, abi: LandBatchAbi, functionName: "farmer", query: { enabled } });
  const { data: usdcAllowance } = useReadContract({
    address: CONTRACT_ADDRESSES.mockUSDC as `0x${string}`,
    abi: MockUSDCAbi,
    functionName: "allowance",
    args: userAddr && addr ? [userAddr, addr] : undefined,
    query: { enabled: !!userAddr && !!addr },
  });

  const { writeContractAsync, isPending } = useWriteContract();
  const publicClient = usePublicClient();
  const [stageSel, setStageSel] = useState("0");
  const [revenueAmt, setRevenueAmt] = useState("");
  const [clipUrl, setClipUrl] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  const waitForTx = async (hash: `0x${string}`) => {
    if (!publicClient) throw new Error("No public client");
    return publicClient.waitForTransactionReceipt({ hash, timeout: 60_000, retryCount: 20 });
  };

  const doWrite = async (fn: () => Promise<`0x${string}`>) => {
    try {
      const hash = await fn();
      setStatusMsg("Transaction submitted — confirming...");
      const receipt = await waitForTx(hash);
      setStatusMsg(receipt.status === "success" ? "Done." : "Transaction failed on-chain.");
    } catch (e: any) {
      const msg = String(e?.message || "");
      if (msg.includes("rejected")) setStatusMsg("You rejected the transaction.");
      else setStatusMsg((msg.length > 90 ? msg.slice(0, 90) + "..." : msg) || "Transaction failed.");
    }
  };

  const handleDistribute = async () => {
    const amt = Number(revenueAmt);
    if (!amt || amt <= 0) {
      setStatusMsg("Enter a revenue amount first.");
      return;
    }
    if (!addr) return;
    const wei = BigInt(Math.round(amt * 10 ** 18));
    const allowance = usdcAllowance as bigint | undefined;
    if (allowance !== undefined && allowance < wei) {
      setStatusMsg("Step 1/2 — Approving USDC to the batch, confirm in your wallet...");
      try {
        const approveHash = await writeContractAsync({
          address: CONTRACT_ADDRESSES.mockUSDC as `0x${string}`,
          abi: MockUSDCAbi,
          functionName: "approve",
          args: [addr as `0x${string}`, wei],
        });
        const approveReceipt = await waitForTx(approveHash);
        if (approveReceipt.status !== "success") {
          setStatusMsg("Approve failed on-chain. Try again.");
          return;
        }
      } catch (e: any) {
        const msg = String(e?.message || "");
        setStatusMsg(msg.includes("rejected") ? "You rejected the approval." : (msg.length > 90 ? msg.slice(0, 90) + "..." : msg) || "Approve failed.");
        return;
      }
    }
    setStatusMsg("Step 2/2 — Distributing revenue, confirm in your wallet...");
    await doWrite(() =>
      writeContractAsync({ address: addr as `0x${string}`, abi: LandBatchAbi, functionName: "distributeRevenue", args: [wei] })
    );
  };

  const handleUploadClip = async () => {
    const trimmed = clipUrl.trim();
    if (!trimmed) {
      setStatusMsg("Enter a clip URL first.");
      return;
    }
    if (!isSafeUrl(trimmed)) {
      setStatusMsg("Clip URL must start with https:// or ipfs://");
      return;
    }
    await doWrite(() => writeContractAsync({ address: addr as `0x${string}`, abi: LandBatchAbi, functionName: "uploadClip", args: [trimmed] }));
  };

  const share = investorShareBps !== undefined ? (Number(investorShareBps) / 100).toFixed(1) + "%" : "—";

  return (
    <div key={batch.id} className="sticker-card bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-lg font-bold text-ink-900">{batch.cropType}</h3>
        <span className="sticker-badge bg-ink-100 text-ink-800">
          Crop {fmtInt(cropNumber)} · Year {fmtInt(currentYear)}/{fmtInt(cropCycleYears)} · {GROWTH_STAGES[Number(growthStage ?? BigInt(0))] ?? GROWTH_STAGES[0]} · {share} investor
        </span>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-4 text-sm">
        <div>
          <span className="text-zinc-500">Acres: </span>
          <span className="text-zinc-300">{batch.acres}</span>
        </div>
        <div>
          <span className="text-zinc-500">Tokens Sold: </span>
          <span className="text-zinc-300">{fmt(soldTokens)} / {Number(batch.totalSupply).toLocaleString()}</span>
        </div>
        <div>
          <span className="text-zinc-500">Buyback Reserve: </span>
          <span className="text-emerald-700">{fmt(buybackReserve)} mUSDC</span>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          onClick={() => doWrite(() => writeContractAsync({ address: addr as `0x${string}`, abi: LandBatchAbi, functionName: "advanceYear" }))}
          disabled={isPending}
          className="sticker-btn sticker-btn-outline !px-4 !py-2 text-sm !text-emerald-700"
        >
          Advance Year
        </button>
        <select
          value={stageSel}
          onChange={(e) => setStageSel(e.target.value)}
          className="rounded-xl border-2 border-ink-800 bg-white px-3 py-2 text-sm font-semibold text-ink-900"
        >
          {GROWTH_STAGES.map((s, i) => (
            <option key={s} value={String(i)}>{s}</option>
          ))}
        </select>
        <button
          onClick={() => doWrite(() => writeContractAsync({ address: addr as `0x${string}`, abi: LandBatchAbi, functionName: "setGrowthStage", args: [BigInt(stageSel)] }))}
          disabled={isPending}
          className="sticker-btn sticker-btn-outline !px-4 !py-2 text-sm"
        >
          Set Growth Stage
        </button>
        <input
          type="number"
          placeholder="Revenue (mUSDC)"
          value={revenueAmt}
          onChange={(e) => setRevenueAmt(e.target.value)}
          className="w-40 rounded-xl border-2 border-ink-800 bg-white px-3 py-2 text-sm font-semibold text-ink-900 placeholder-zinc-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600/20"
        />
        <button
          onClick={handleDistribute}
          disabled={isPending}
          className="sticker-btn sticker-btn-amber !px-4 !py-2 text-sm"
        >
          Distribute Revenue
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          placeholder="Clip URL (IPFS/video link)"
          value={clipUrl}
          onChange={(e) => setClipUrl(e.target.value)}
          className="w-72 rounded-xl border-2 border-ink-800 bg-white px-3 py-2 text-sm font-semibold text-ink-900 placeholder-zinc-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600/20"
        />
        <button
          onClick={handleUploadClip}
          disabled={isPending}
          className="sticker-btn sticker-btn-outline !px-4 !py-2 text-sm"
        >
          Upload Clip
        </button>
        {!!farmer && (
          <span className="text-xs text-zinc-600">Farmer: {String(farmer).slice(0, 6)}...{String(farmer).slice(-4)}</span>
        )}
      </div>

      {statusMsg && <p className="mt-3 text-xs text-zinc-500 break-words">{statusMsg}</p>}
    </div>
  );
}

export default function Admin() {
  const { isConnected, address } = useSafeAccount();
  const [activeTab, setActiveTab] = useState<string>("batches");
  const isAdmin = isAdminAddress(address as `0x${string}` | undefined);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Farm Ops"
        subtitle="Manage your batches, milestones, harvests, and daily clips — every write lands on-chain."
      />

      {!isConnected && (
        <div className="sticker-card bg-white p-6 text-center text-sm font-semibold text-zinc-500">
          Connect your wallet to manage farm operations
        </div>
      )}

      {isConnected && !isAdmin && (
        <div className="sticker-card bg-rose-50 p-6 text-center">
          <p className="font-heading text-xl font-bold text-ink-900">Farm Ops is admin-only</p>
          <p className="mt-2 text-sm font-semibold text-zinc-600">
            Your wallet is not the farm admin. The contracts only accept farm operations from the
            admin address, so there is nothing to manage here.
          </p>
        </div>
      )}

      {isConnected && isAdmin && (
        <>
          <div className="mb-6 flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`sticker-btn !rounded-full !px-4 !py-2.5 text-sm ${
                  activeTab === tab.id ? "sticker-btn-amber" : "sticker-btn-outline !text-zinc-500"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "batches" && (
            <div className="animate-pop-in space-y-4">
              {allBatches().map((batch) => (
                <BatchAdmin key={batch.id} batch={batch} />
              ))}
            </div>
          )}

          {activeTab === "milestones" && <MilestonesTab />}

          {activeTab === "harvest" && <HarvestTab />}

          {activeTab === "clips" && <ClipsTab />}

          {activeTab === "create" && <CreateBatchTab />}
        </>
      )}
    </div>
  );
}

function MilestonesTab() {
  return (
    <div className="animate-pop-in space-y-4">
      {allBatches().map((batch) => (
        <BatchMilestones key={batch.id} batch={batch} />
      ))}
    </div>
  );
}

function BatchMilestones({ batch }: { batch: LandBatch }) {
  const addr = getBatchAddress(batch);
  const { data: milestones } = useReadContract({ address: addr, abi: LandBatchAbi, functionName: "getMilestones", query: { enabled: !!addr } });
  const { writeContractAsync, isPending } = useWriteContract();
  const publicClient = usePublicClient();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [startDay, setStartDay] = useState("");
  const [endDay, setEndDay] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  const waitForTx = async (hash: `0x${string}`) => {
    if (!publicClient) throw new Error("No public client");
    return publicClient.waitForTransactionReceipt({ hash, timeout: 60_000, retryCount: 20 });
  };

  const handleCreate = async () => {
    const amt = Number(amount);
    if (!name.trim() || !amt || amt <= 0) {
      setStatusMsg("Fill in name and amount first.");
      return;
    }
    try {
      const hash = await writeContractAsync({
        address: addr as `0x${string}`,
        abi: LandBatchAbi,
        functionName: "createMilestone",
        args: [name.trim(), BigInt(Math.round(amt * 10 ** 18)), BigInt(startDay || "0"), BigInt(endDay || "0")],
      });
      setStatusMsg("Milestone submitted — confirming...");
      const receipt = await waitForTx(hash);
      setStatusMsg(receipt.status === "success" ? "Milestone created." : "Failed on-chain.");
      if (receipt.status === "success") {
        setName("");
        setAmount("");
        setStartDay("");
        setEndDay("");
      }
    } catch (e: any) {
      const msg = String(e?.message || "");
      setStatusMsg(msg.includes("rejected") ? "You rejected the transaction." : (msg.length > 90 ? msg.slice(0, 90) + "..." : msg) || "Failed.");
    }
  };

  const ms = milestones as
    | readonly { name: string; amount: bigint; startDay: bigint; endDay: bigint; claimed: boolean }[]
    | undefined;

  const [claimMsg, setClaimMsg] = useState("");

  const handleClaim = async (index: number) => {
    if (!addr) return;
    try {
      const hash = await writeContractAsync({
        address: addr as `0x${string}`,
        abi: LandBatchAbi,
        functionName: "claimMilestone",
        args: [BigInt(index)],
      });
      setClaimMsg("Claiming — confirming...");
      const receipt = await waitForTx(hash);
      setClaimMsg(receipt.status === "success" ? "Milestone claimed — USDC sent to the farmer." : "Failed on-chain.");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setClaimMsg(msg.includes("rejected") ? "You rejected the transaction." : (msg.length > 90 ? msg.slice(0, 90) + "..." : msg) || "Failed.");
    }
  };

  return (
    <div className="sticker-card bg-white p-6">
      <h3 className="mb-4 font-heading text-lg font-bold text-ink-900">{batch.cropType} — Milestones</h3>
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-4">
          <input
            placeholder="Name (e.g. Soil prep)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl border-2 border-ink-800 bg-white px-4 py-2.5 text-sm font-semibold text-ink-900 placeholder-zinc-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600/20"
          />
          <input
            type="number"
            placeholder="Amount (mUSDC)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="rounded-xl border-2 border-ink-800 bg-white px-4 py-2.5 text-sm font-semibold text-ink-900 placeholder-zinc-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600/20"
          />
          <input
            type="number"
            placeholder="Start day"
            value={startDay}
            onChange={(e) => setStartDay(e.target.value)}
            className="rounded-xl border-2 border-ink-800 bg-white px-4 py-2.5 text-sm font-semibold text-ink-900 placeholder-zinc-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600/20"
          />
          <input
            type="number"
            placeholder="End day"
            value={endDay}
            onChange={(e) => setEndDay(e.target.value)}
            className="rounded-xl border-2 border-ink-800 bg-white px-4 py-2.5 text-sm font-semibold text-ink-900 placeholder-zinc-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600/20"
          />
        </div>
        <button
          onClick={handleCreate}
          disabled={isPending}
          className="sticker-btn sticker-btn-amber !px-5 !py-2.5 text-sm"
        >
          Create Milestone
        </button>
        {statusMsg && <p className="text-xs font-semibold text-zinc-500 break-words">{statusMsg}</p>}
      </div>

      <div className="mt-5 space-y-2">
        {ms && ms.length > 0 ? (
          ms.map((m, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border-2 border-ink-100 bg-ink-50 px-4 py-2.5 text-sm">
              <div>
                <span className="font-bold text-ink-900">{m.name}</span>
                <span className="ml-2 font-semibold text-zinc-500">
                  {fmt(m.amount)} mUSDC · day {String(m.startDay)}
                  {m.endDay > BigInt(0) ? `–${String(m.endDay)}` : "+"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`sticker-badge ${m.claimed ? "bg-zinc-200 text-zinc-500" : "bg-emerald-100 text-emerald-700"}`}>
                  {m.claimed ? "Claimed" : "Pending"}
                </span>
                {!m.claimed && (
                  <button
                    onClick={() => handleClaim(i)}
                    disabled={isPending}
                    className="sticker-btn sticker-btn-amber !px-3 !py-1 !text-xs"
                  >
                    Claim
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-sm font-semibold text-zinc-600">No milestones created yet</div>
        )}
      </div>
      {claimMsg && <p className="mt-3 text-xs font-semibold text-zinc-500 break-words">{claimMsg}</p>}
    </div>
  );
}

function HarvestTab() {
  return (
    <div className="animate-pop-in space-y-4">
      {allBatches().map((batch) => (
        <div key={batch.id} className="sticker-card bg-white p-6">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-heading text-lg font-bold text-ink-900">{batch.cropType}</h3>
            <span className="sticker-badge bg-ink-100 text-ink-800">Current Year</span>
          </div>
          <p className="mb-4 text-xs font-semibold text-zinc-600">
            Advance the farm one year — the investor share drops 5 points per year (70% → 0%). Growth stage is set
            separately per batch. Distribute revenue on the Batches tab.
          </p>
          <BatchAdminBatchOnly batch={batch} />
        </div>
      ))}
    </div>
  );
}

function BatchAdminBatchOnly({ batch }: { batch: LandBatch }) {
  const addr = getBatchAddress(batch);
  const { data: currentYear } = useReadContract({ address: addr, abi: LandBatchAbi, functionName: "currentYear", query: { enabled: !!addr } });
  const { data: investorShareBps } = useReadContract({ address: addr, abi: LandBatchAbi, functionName: "investorShareBps", query: { enabled: !!addr } });
  const { data: cropNumber } = useReadContract({ address: addr, abi: LandBatchAbi, functionName: "cropNumber", query: { enabled: !!addr } });
  const { writeContractAsync, isPending } = useWriteContract();
  const publicClient = usePublicClient();
  const [statusMsg, setStatusMsg] = useState("");

  const waitForTx = async (hash: `0x${string}`) => {
    if (!publicClient) throw new Error("No public client");
    return publicClient.waitForTransactionReceipt({ hash, timeout: 60_000, retryCount: 20 });
  };

  const doAdvance = async () => {
    try {
      const hash = await writeContractAsync({ address: addr as `0x${string}`, abi: LandBatchAbi, functionName: "advanceYear" });
      setStatusMsg("Advancing — confirming...");
      const receipt = await waitForTx(hash);
      setStatusMsg(receipt.status === "success" ? "Year advanced." : "Failed on-chain.");
    } catch (e: any) {
      const msg = String(e?.message || "");
      setStatusMsg(msg.includes("rejected") ? "You rejected the transaction." : (msg.length > 90 ? msg.slice(0, 90) + "..." : msg) || "Failed.");
    }
  };

  const share = investorShareBps !== undefined ? (Number(investorShareBps) / 100).toFixed(1) + "%" : "—";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={doAdvance}
        disabled={isPending}
        className="sticker-btn sticker-btn-amber !px-5 !py-2.5 text-sm"
      >
        Advance 1 Year
      </button>
      <span className="text-sm font-semibold text-zinc-400">Crop {fmtInt(cropNumber)} · Year {fmtInt(currentYear)} · investor share {share}</span>
      {statusMsg && <span className="text-xs font-semibold text-zinc-500 break-words">{statusMsg}</span>}
    </div>
  );
}

function ClipsTab() {
  return (
    <div className="animate-pop-in space-y-4">
      {allBatches().map((batch) => (
        <BatchClips key={batch.id} batch={batch} />
      ))}
    </div>
  );
}

function BatchClips({ batch }: { batch: LandBatch }) {
  const addr = getBatchAddress(batch);
  const { data: clips } = useReadContract({ address: addr, abi: LandBatchAbi, functionName: "getClips", query: { enabled: !!addr } });

  const list = clips as readonly { url: string; timestamp: bigint }[] | undefined;

  return (
    <div className="sticker-card bg-white p-6">
      <h3 className="mb-4 font-heading text-lg font-bold text-ink-900">{batch.cropType} — Daily Clips</h3>
      {list && list.length > 0 ? (
        <div className="space-y-2">
          {list.map((c, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border-2 border-ink-100 bg-ink-50 px-4 py-2.5 text-sm">
              {isSafeUrl(c.url) ? (
                <a href={c.url} target="_blank" rel="noreferrer" className="font-bold text-emerald-700 hover:underline break-all">
                  {c.url}
                </a>
              ) : (
                <span className="font-semibold text-zinc-500 break-all">{c.url}</span>
              )}
              <span className="ml-3 shrink-0 text-xs font-semibold text-zinc-600">day {String(c.timestamp / BigInt(86400))}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-sm font-semibold text-zinc-600">No clips uploaded yet. Use the Batches tab to upload.</div>
      )}
    </div>
  );
}

function CreateBatchTab() {
  const { address } = useSafeAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const publicClient = usePublicClient();
  const [cropType, setCropType] = useState("");
  const [acres, setAcres] = useState("");
  const [price, setPrice] = useState("");
  const [supply, setSupply] = useState("");
  const [fixedReturn, setFixedReturn] = useState("800");
  const [cycleYears, setCycleYears] = useState("3");
  const [farmerAddr, setFarmerAddr] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  const waitForTx = async (hash: `0x${string}`) => {
    if (!publicClient) throw new Error("No public client");
    return publicClient.waitForTransactionReceipt({ hash, timeout: 60_000, retryCount: 20 });
  };

  const handleCreate = async () => {
    if (!publicClient) return;
    const acresN = Number(acres);
    const priceN = Number(price);
    const supplyN = Number(supply);
    if (!cropType.trim() || !acresN || acresN <= 0 || !priceN || priceN <= 0 || !supplyN || supplyN <= 0) {
      setStatusMsg("Fill in crop type, acres, price and supply first.");
      return;
    }
    const cycleYearsN = Number(cycleYears);
    if (!cycleYearsN || cycleYearsN <= 0) {
      setStatusMsg("Crop cycle years must be greater than 0.");
      return;
    }
    const farmer = (farmerAddr.trim() as `0x${string}`) || (address as `0x${string}`);
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.factory as `0x${string}`,
        abi: LandBatchFactoryAbi,
        functionName: "createBatch",
        args: [
          farmer,
          cropType.trim(),
          BigInt(acresN),
          BigInt(Math.round(priceN * 10 ** 18)),
          BigInt(Math.round(supplyN * 10 ** 18)),
          BigInt(fixedReturn || "800"),
          BigInt(cycleYearsN),
        ],
      });
      setStatusMsg("Deploying batch — confirming...");
      const receipt = await waitForTx(hash);
      if (receipt.status === "success") {
        try {
          const count = (await publicClient.readContract({
            address: CONTRACT_ADDRESSES.factory as `0x${string}`,
            abi: LandBatchFactoryAbi,
            functionName: "getBatchCount",
          })) as bigint;
          const newAddr = (await publicClient.readContract({
            address: CONTRACT_ADDRESSES.factory as `0x${string}`,
            abi: LandBatchFactoryAbi,
            functionName: "batches",
            args: [count - BigInt(1)],
          })) as `0x${string}`;
          const created: LandBatch = {
            id: Math.max(0, ...allBatches().map((b) => b.id)) + 1,
            cropType: cropType.trim(),
            acres: acresN,
            pricePerToken: String(priceN),
            totalSupply: String(supplyN),
            tokensPerAcre: String(Math.round(supplyN / acresN)),
            pricePerAcre: `$${Math.round(priceN * acresN).toLocaleString()}`,
            totalValue: `$${Math.round(supplyN * priceN).toLocaleString()}`,
            firstHarvest: "Year 1",
            harvestCycle: "Annual",
            cropCycleYears: cycleYearsN,
            description: "User-created land batch deployed from Farm Ops.",
            image: "/crops/unknown.jpg",
            color: "from-emerald-500/20 to-green-500/20",
            borderColor: "border-emerald-500/30",
            address: newAddr,
          };
          saveCreatedBatch(created);
          setStatusMsg(`Batch deployed! "${created.cropType}" added to the marketplace.`);
        } catch (e2: any) {
          console.error("REGISTER BATCH ERROR:", e2);
          setStatusMsg("Batch deployed, but could not register it in the app. See console.");
        }
      } else {
        setStatusMsg("Failed on-chain.");
      }
    } catch (e: any) {
      const msg = String(e?.message || "");
      if (msg.includes("Only admin")) setStatusMsg("Only the factory admin can create batches.");
      else setStatusMsg(msg.includes("rejected") ? "You rejected the transaction." : (msg.length > 90 ? msg.slice(0, 90) + "..." : msg) || "Failed.");
    }
  };

  return (
    <div className="animate-pop-in">
      <div className="sticker-card bg-white p-6">
        <h3 className="mb-4 font-heading text-lg font-bold text-ink-900">Create New Land Batch</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Crop type"
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              className="rounded-xl border-2 border-ink-800 bg-white px-4 py-2.5 text-sm font-semibold text-ink-900 placeholder-zinc-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600/20"
            />
            <input
              type="number"
              placeholder="Total acres"
              value={acres}
              onChange={(e) => setAcres(e.target.value)}
              className="rounded-xl border-2 border-ink-800 bg-white px-4 py-2.5 text-sm font-semibold text-ink-900 placeholder-zinc-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600/20"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Token price (mUSDC)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="rounded-xl border-2 border-ink-800 bg-white px-4 py-2.5 text-sm font-semibold text-ink-900 placeholder-zinc-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600/20"
            />
            <input
              type="number"
              placeholder="Total supply"
              value={supply}
              onChange={(e) => setSupply(e.target.value)}
              className="rounded-xl border-2 border-ink-800 bg-white px-4 py-2.5 text-sm font-semibold text-ink-900 placeholder-zinc-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600/20"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Fixed return (bps, e.g. 800 = 8%)"
              value={fixedReturn}
              onChange={(e) => setFixedReturn(e.target.value)}
              className="rounded-xl border-2 border-ink-800 bg-white px-4 py-2.5 text-sm font-semibold text-ink-900 placeholder-zinc-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600/20"
            />
            <input
              type="number"
              placeholder="Crop cycle years (replants at 70 / 30)"
              value={cycleYears}
              onChange={(e) => setCycleYears(e.target.value)}
              className="rounded-xl border-2 border-ink-800 bg-white px-4 py-2.5 text-sm font-semibold text-ink-900 placeholder-zinc-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600/20"
            />
            <input
              placeholder="Farmer address (defaults to you)"
              value={farmerAddr}
              onChange={(e) => setFarmerAddr(e.target.value)}
              className="rounded-xl border-2 border-ink-800 bg-white px-4 py-2.5 text-sm font-semibold text-ink-900 placeholder-zinc-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600/20"
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={isPending}
            className="sticker-btn sticker-btn-amber !px-5 !py-2.5 text-sm"
          >
            Deploy Batch
          </button>
          {statusMsg && <p className="text-xs font-semibold text-zinc-500 break-words">{statusMsg}</p>}
        </div>
      </div>
    </div>
  );
}
