"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { ADMIN_ADDRESS, BATCHES, CONTRACT_ADDRESSES, getBatchMeta, isAdminAddress } from "@/lib/config";
import {
  batchAddress,
  factoryAbi,
  landBatchAbi,
  useBatch,
} from "@/lib/contracts";
import { dayToDate, fmtUSDC, fmtWhole, pct } from "@/lib/format";

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const isAdmin = isConnected && isAdminAddress(address);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="font-display text-5xl leading-[1.05] tracking-tight text-ink sm:text-6xl">
          Farm <span className="paint">Ops</span>
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-2">
          Run the farm: advance years, distribute revenue, manage milestones,
          clips and batches, straight into the contracts.
        </p>
      </div>

      {!isConnected ? (
        <div className="mt-10">
          <div className="sketch mx-auto max-w-md bg-white p-8 text-center">
            <p className="text-4xl">🔐</p>
            <h2 className="mt-3 font-display text-2xl text-ink">Admin console</h2>
            <p className="mt-2 text-sm text-ink-2">
              Farm Ops is gated to the farm admin wallet.
            </p>
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button type="button" onClick={openConnectModal} className="btn btn-fill mt-5">
                  Connect wallet
                </button>
              )}
            </ConnectButton.Custom>
          </div>
        </div>
      ) : isAdmin ? (
        <div>
          <div className="sketch mt-10 flex flex-wrap items-center justify-between gap-3 bg-white p-4">
            <p className="font-display text-lg text-ink">
              Admin: <span className="font-mono text-sm text-ink-3">{ADMIN_ADDRESS}</span>
            </p>
            <span className="chip bg-sage-50">
              <span className="h-2 w-2 rounded-full bg-sage-2" />
              admin access
            </span>
          </div>
          <AdminPanels />
        </div>
      ) : (
        <div className="mt-10">
          <div className="sketch mx-auto max-w-md bg-white p-8 text-center">
            <p className="text-4xl">⛔</p>
            <h2 className="mt-3 font-display text-2xl text-ink">Access denied</h2>
            <p className="mt-2 text-sm text-ink-2">
              This console is only available to the farm admin wallet. Browse the
              marketplace or check your cropfolio instead.
            </p>
            <a href="/marketplace" className="btn btn-sketch mt-5">
              Go to the marketplace
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminPanels() {
  const [sel, setSel] = useState(0);
  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-8">
        <BatchAdminPanel id={sel} />
        <MilestonesPanel id={sel} />
        <ClipPanel id={sel} />
        <CreateBatchPanel />
      </div>

      <div className="flex flex-col gap-4">
        <p className="font-display text-2xl text-ink">pick a batch</p>
        <div className="grid grid-cols-2 gap-2">
          {BATCHES.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setSel(b.id)}
              className={`rounded-full border-2 px-3 py-2 text-sm font-semibold transition-all duration-150 ${
                sel === b.id
                  ? "border-ink bg-ink text-paper shadow-[2px_2px_0_rgba(43,38,29,0.25)]"
                  : "border-transparent text-ink-2 hover:border-ink hover:bg-white"
              }`}
            >
              {b.emoji} {b.cropType}
            </button>
          ))}
        </div>
        <BatchSummary id={sel} />
      </div>
    </div>
  );
}

function BatchSummary({ id }: { id: number }) {
  const b = useBatch(id);
  const d = b.data;
  return (
    <div className="sketch-soft bg-paper-2 p-4 text-sm">
      <p className="font-display text-lg text-ink">{getBatchMeta(id).cropType}</p>
      <p className="mt-1 text-ink-2">Tokens Sold: <span className="font-display text-ink">{fmtTokens(d.soldTokens)}</span></p>
      <p className="text-ink-2">Revenue (mUSDC) distributed: <span className="font-display text-ink">{fmtUSDC(d.totalRevenueDistributed)}</span></p>
      <p className="text-ink-2">Buyback reserve: <span className="font-display text-ink">{fmtUSDC(d.buybackReserve)}</span></p>
    </div>
  );
}

function BatchAdminPanel({ id }: { id: number }) {
  const b = useBatch(id);
  const d = b.data;
  const [rev, setRev] = useState("");
  const [step, setStep] = useState<1 | 2>(1);

  const advance = useWriteContract();
  const distribute = useWriteContract();
  const advanceReceipt = useWaitForTransactionReceipt({ hash: advance.data });
  const distReceipt = useWaitForTransactionReceipt({ hash: distribute.data });

  const revAmt = useMemo(() => {
    const n = Number(rev || "0");
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }, [rev]);

  const addr = batchAddress(id)!;

  return (
    <section className="sketch overflow-hidden bg-white">
      <div className="border-b-2 border-ink/20 px-5 py-4">
        <h2 className="font-display text-3xl text-ink">Batch ops · {getBatchMeta(id).cropType}</h2>
      </div>
      <div className="grid gap-4 p-5 sm:grid-cols-2">
        <div className="sketch-soft bg-paper-2 p-4">
          <p className="text-xs font-semibold text-ink-3">current year</p>
          <p className="font-display text-4xl text-ink">{fmtWhole(d.currentYear)}</p>
          <button
            type="button"
            className="btn btn-fill mt-3 w-full !text-sm"
            disabled={advance.isPending}
            onClick={() =>
              advance.writeContract({ address: addr, abi: landBatchAbi, functionName: "advanceYear" })
            }
          >
            {advanceReceipt.isSuccess ? "Year advanced ✓" : advance.isPending ? "Advancing…" : "Advance Year"}
          </button>
        </div>

        <div className="sketch-soft bg-paper-2 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-ink-3">investor share</p>
            <p className="font-display text-ink">{pct(d.investorShareBps)}</p>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink/15">
            <motion.div
              className="h-full rounded-full bg-sage-2"
              initial={{ width: 0 }}
              animate={{ width: `${(Number(d.investorShareBps) / 10000) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="sketch-soft bg-harvest/20 p-4 mx-5 mb-5">
        <p className="font-display text-xl text-ink">Distribute revenue</p>
        <div className="mt-2 flex gap-2">
          <input
            type="number"
            inputMode="decimal"
            placeholder="Revenue (mUSDC)"
            value={rev}
            onChange={(e) => setRev(e.target.value)}
            className="input-sketch"
          />
          <button
            type="button"
            className="btn btn-sun shrink-0"
            disabled={revAmt <= 0 || distribute.isPending}
            onClick={() => {
              setStep(2);
              distribute.writeContract({
                address: addr,
                abi: landBatchAbi,
                functionName: "distributeRevenue",
                args: [BigInt(Math.round(revAmt * 1_000_000_000_000_000_000))],
              });
            }}
          >
            {distribute.isPending ? "Distributing…" : "Distribute Revenue"}
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="text-ink-3">progress:</span>
          {[1, 2].map((s) => (
            <span
              key={s}
              className={`flex h-7 w-7 items-center justify-center rounded-full border-2 font-display ${
                step >= s ? "border-ink bg-ink text-paper" : "border-ink bg-white text-ink-3"
              }`}
            >
              {s}
            </span>
          ))}
          <span className="font-display text-ink">Step {step}/2</span>
        </div>
        <AnimatePresence>
          {distReceipt.isSuccess && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 font-display text-sage-2"
            >
              Done. 🎉 Revenue distributed on-chain.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function MilestonesPanel({ id }: { id: number }) {
  const b = useBatch(id);
  const d = b.data;
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [startDay, setStartDay] = useState("");
  const [endDay, setEndDay] = useState("");
  const [selIdx, setSelIdx] = useState(0);

  const create = useWriteContract();
  const claim = useWriteContract();
  const createReceipt = useWaitForTransactionReceipt({ hash: create.data });
  const claimReceipt = useWaitForTransactionReceipt({ hash: claim.data });

  const addr = batchAddress(id)!;

  return (
    <section className="sketch overflow-hidden bg-white">
      <div className="border-b-2 border-ink/20 px-5 py-4">
        <h2 className="font-display text-3xl text-ink">Milestones</h2>
      </div>
      <div className="grid gap-3 p-5 sm:grid-cols-2">
        {d.milestones.map((m, i) => (
          <div key={i} className={`sketch-xs bg-white p-3 ${i === selIdx ? "ring-4 ring-harvest" : ""}`}>
            <div className="flex items-center justify-between">
              <p className="font-display text-lg text-ink">{m.name}</p>
              <span className={`chip !px-2.5 !py-0.5 !text-xs ${m.claimed ? "bg-sage-50" : "bg-harvest/25"}`}>
                {m.claimed ? "claimed" : "open"}
              </span>
            </div>
            <p className="mt-1 text-sm text-ink-2">
              {fmtUSDC(m.amount)} mUSDC · days {fmtWhole(m.startDay)}-{fmtWhole(m.endDay)}
            </p>
            <button
              type="button"
              className="btn btn-sketch mt-2 w-full !text-sm"
              disabled={m.claimed || claim.isPending}
              onClick={() => {
                setSelIdx(i);
                claim.writeContract({
                  address: addr,
                  abi: landBatchAbi,
                  functionName: "claimMilestone",
                  args: [BigInt(i)],
                });
              }}
            >
              {claimReceipt.isSuccess && selIdx === i ? "Milestone claimed ✓" : "Claim milestone"}
            </button>
          </div>
        ))}
      </div>

      <div className="sketch-soft mx-5 mb-5 bg-paper-2 p-4">
        <p className="font-display text-xl text-ink">Create a milestone</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="input-sketch" />
          <input type="number" placeholder="Amount (mUSDC)" value={amount} onChange={(e) => setAmount(e.target.value)} className="input-sketch" />
          <input type="date" value={startDay} onChange={(e) => setStartDay(e.target.value)} className="input-sketch" />
          <input type="date" value={endDay} onChange={(e) => setEndDay(e.target.value)} className="input-sketch" />
        </div>
        <button
          type="button"
          className="btn btn-fill mt-3 !text-sm"
          disabled={!name || !amount || !endDay || create.isPending}
          onClick={() =>
            create.writeContract({
              address: addr,
              abi: landBatchAbi,
              functionName: "createMilestone",
              args: [
                name,
                BigInt(Math.round(Number(amount) * 1e18)),
                BigInt(Math.floor(Date.parse(startDay || new Date().toISOString().slice(0, 10)) / 86400000)),
                BigInt(Math.floor(Date.parse(endDay) / 86400000)),
              ],
            })
          }
        >
          {createReceipt.isSuccess ? "Milestone created ✓" : create.isPending ? "Creating…" : "Create milestone"}
        </button>
      </div>
    </section>
  );
}

function ClipPanel({ id }: { id: number }) {
  const b = useBatch(id);
  const d = b.data;
  const [url, setUrl] = useState("");
  const upload = useWriteContract();
  const upReceipt = useWaitForTransactionReceipt({ hash: upload.data });

  return (
    <section className="sketch overflow-hidden bg-white">
      <div className="border-b-2 border-ink/20 px-5 py-4">
        <h2 className="font-display text-3xl text-ink">Camera clips</h2>
      </div>
      <div className="p-5">
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://… clip url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="input-sketch"
          />
          <button
            type="button"
            className="btn btn-sun shrink-0"
            disabled={!url || upload.isPending}
            onClick={() =>
              upload.writeContract({
                address: batchAddress(id)!,
                abi: landBatchAbi,
                functionName: "uploadClip",
                args: [url],
              })
            }
          >
            {upReceipt.isSuccess ? "Uploaded ✓" : upload.isPending ? "Uploading…" : "Upload clip"}
          </button>
        </div>
        <div className="mt-3 space-y-1">
          {d.clips.map((c, i) => (
            <p key={i} className="truncate text-xs text-ink-3">📹 {c.url} · {dayToDate(c.timestamp)}</p>
          ))}
          {d.clips.length === 0 && <p className="text-xs text-ink-3">No clips yet.</p>}
        </div>
      </div>
    </section>
  );
}

function CreateBatchPanel() {
  const [crop, setCrop] = useState("");
  const [acres, setAcres] = useState("");
  const [price, setPrice] = useState("");
  const [supply, setSupply] = useState("");
  const [fixed, setFixed] = useState("");
  const [years, setYears] = useState("");
  const create = useWriteContract();
  const createReceipt = useWaitForTransactionReceipt({ hash: create.data });

  const farmer = "0x0000000000000000000000000000000000000000";

  return (
    <section className="sketch overflow-hidden bg-white">
      <div className="border-b-2 border-ink/20 px-5 py-4">
        <h2 className="font-display text-3xl text-ink">Create a batch</h2>
      </div>
      <div className="p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input type="text" placeholder="Crop type" value={crop} onChange={(e) => setCrop(e.target.value)} className="input-sketch" />
          <input type="number" placeholder="Acres" value={acres} onChange={(e) => setAcres(e.target.value)} className="input-sketch" />
          <input type="number" placeholder="Price per token (mUSDC)" value={price} onChange={(e) => setPrice(e.target.value)} className="input-sketch" />
          <input type="number" placeholder="Total supply (tokens)" value={supply} onChange={(e) => setSupply(e.target.value)} className="input-sketch" />
          <input type="number" placeholder="Fixed return % (e.g. 15)" value={fixed} onChange={(e) => setFixed(e.target.value)} className="input-sketch" />
          <input type="number" placeholder="Crop cycle years" value={years} onChange={(e) => setYears(e.target.value)} className="input-sketch" />
        </div>
        <button
          type="button"
          className="btn btn-fill mt-4"
          disabled={!crop || create.isPending}
          onClick={() =>
            create.writeContract({
              address: CONTRACT_ADDRESSES.factory,
              abi: factoryAbi,
              functionName: "createBatch",
              args: [
                farmer,
                crop,
                BigInt(Number(acres) || 1),
                BigInt(Math.round((Number(price) || 1) * 1e18)),
                BigInt(Number(supply) || 10000),
                BigInt(Math.round((Number(fixed) || 15) * 100)),
                BigInt(Number(years) || 1),
              ],
            })
          }
        >
          {createReceipt.isSuccess ? "Batch created ✓" : create.isPending ? "Creating…" : "Create batch"}
        </button>
        <p className="mt-2 text-xs text-ink-3">
          {crop ? `New "${crop}" batch will be deployed by the factory.` : "Fill the form to deploy a new batch via LandBatchFactory."}
        </p>
      </div>
    </section>
  );
}
