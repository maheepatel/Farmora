"use client";

import { useEffect, useState } from "react";
import { useAccount, usePublicClient, useReadContract, useWriteContract } from "wagmi";
import { formatUnits } from "viem";
import {
  allBatches,
  getBatchAddress,
  CONTRACT_ADDRESSES,
  STAY_PRICES,
  dateToDayNumber,
  addDays,
  type LandBatch,
} from "@/lib/config";
import { Reveal } from "@/components/site/reveal";
import { PageHeader } from "@/components/site/page-header";
import { CropArt } from "@/components/site/farm-art";
import { ConfettiBurst } from "@/components/site/confetti";
import { SuccessStamp } from "@/components/site/success-stamp";

import StayBookingAbi from "@/lib/abi/StayBooking.json";
import LandBatchAbi from "@/lib/abi/LandBatch.json";
import MockUSDCAbi from "@/lib/abi/MockUSDC.json";

const MAX_NIGHTS = 3;

function useSafeAccount() {
  try {
    return useAccount();
  } catch {
    return { address: undefined, isConnected: false };
  }
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

interface StayCardProps {
  batch: LandBatch;
  onOpenModal: (batch: LandBatch) => void;
}

function StayCard({ batch, onOpenModal }: StayCardProps) {
  const { isConnected, address } = useSafeAccount();
  const publicClient = usePublicClient();
  const [state, setState] = useState<"idle" | "checking" | "ok" | "no">("idle");
  const [msg, setMsg] = useState("");

  const { data: priceData } = useReadContract({
    address: CONTRACT_ADDRESSES.stayBooking,
    abi: StayBookingAbi,
    functionName: "pricePerNight",
    args: [batch.id],
  });
  const price =
    priceData !== undefined && priceData !== null
      ? Number(formatUnits(priceData as bigint, 18))
      : STAY_PRICES[batch.id] ?? 0;

  const handleCheck = async () => {
    if (!isConnected || !address) {
      setState("no");
      setMsg("Connect your wallet to check availability.");
      return;
    }
    const addr = getBatchAddress(batch);
    if (!addr || !publicClient) {
      setState("no");
      setMsg("This parcel is not deployed on-chain yet.");
      return;
    }
    setState("checking");
    setMsg("Checking your LAND balance...");
    try {
      const bal = (await publicClient.readContract({
        address: addr,
        abi: LandBatchAbi,
        functionName: "balanceOf",
        args: [address],
      })) as bigint;
      if (bal > BigInt(0)) {
        setState("ok");
        setMsg("Available — you hold LAND in this parcel. Choose your nights.");
        onOpenModal(batch);
      } else {
        setState("no");
        setMsg("Not available — you need to hold LAND in this parcel first.");
      }
    } catch {
      setState("no");
      setMsg("Could not check availability. Please try again.");
    }
  };

  return (
    <div className="sticker-card flex h-full flex-col bg-white p-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <CropArt cropType={batch.cropType} className="h-12 w-12 shrink-0 rounded-xl border-2 border-ink-800" />
          <div>
            <h3 className="font-heading text-lg font-bold text-ink-900">
              {batch.cropType} Farmstead
            </h3>
            <p className="text-sm text-zinc-400">{batch.acres} acres</p>
          </div>
        </div>
        <div className="text-right">
          <div className="font-heading text-2xl font-bold text-amber-700 tabular">
            {price ? price.toLocaleString() : "—"}
          </div>
          <div className="text-xs font-bold text-zinc-500">mUSDC / night</div>
        </div>
      </div>

      <p className="mb-5 text-sm leading-relaxed text-zinc-500">
        Weekend getaways, guided farm tours, and produce picked the morning you leave. Bookings are
        transactions on-chain — a night can only ever be reserved once.
      </p>

      <div className="mb-5 grid grid-cols-3 gap-2">
        {[
          { v: "Paid", n: "in mUSDC" },
          { v: "Weekend", n: "2-night stay" },
          { v: "On-chain", n: "One slot / night" },
        ].map((c) => (
          <div key={c.v} className="rounded-2xl border-2 border-ink-100 bg-ink-50 p-3">
            <div className="text-sm font-bold text-emerald-700">{c.v}</div>
            <div className="mt-0.5 text-xs font-semibold text-zinc-500">{c.n}</div>
          </div>
        ))}
      </div>

      <div className="mt-auto">
        <button
          onClick={handleCheck}
          disabled={state === "checking"}
          className="sticker-btn sticker-btn-amber w-full !py-2.5 text-sm"
        >
          {state === "checking" ? "Checking..." : "Check availability"}
        </button>
        {msg && (
          <p
            className={`mt-2 text-center text-xs font-semibold ${
              state === "ok" ? "text-emerald-700" : "text-zinc-500"
            }`}
          >
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}

interface BookingModalProps {
  batch: LandBatch;
  onClose: () => void;
  onBooked: () => void;
}

function BookingModal({ batch, onClose, onBooked }: BookingModalProps) {
  const { address } = useSafeAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync, isPending } = useWriteContract();
  const [checkIn, setCheckIn] = useState(() => addDays(todayISO(), 7));
  const [nights, setNights] = useState(2);
  const [guests, setGuests] = useState(2);
  const [nightStatus, setNightStatus] = useState<(boolean | null)[]>([]);
  const [statusMsg, setStatusMsg] = useState("");
  const [done, setDone] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: priceData } = useReadContract({
    address: CONTRACT_ADDRESSES.stayBooking,
    abi: StayBookingAbi,
    functionName: "pricePerNight",
    args: [batch.id],
  });
  const price =
    priceData !== undefined && priceData !== null
      ? Number(formatUnits(priceData as bigint, 18))
      : STAY_PRICES[batch.id] ?? 0;
  const day = dateToDayNumber(checkIn);
  const total = price * nights;

  const waitForTx = async (hash: `0x${string}`) => {
    if (!publicClient) throw new Error("No public client");
    return publicClient.waitForTransactionReceipt({ hash, timeout: 60_000, retryCount: 20 });
  };

  const checkAvailability = () => {
    setRefreshKey((k) => k + 1);
  };

  useEffect(() => {
    if (!publicClient) return;
    let cancelled = false;
    (async () => {
      try {
        const results = await Promise.all(
          Array.from({ length: nights }, (_, i) =>
            publicClient.readContract({
              address: CONTRACT_ADDRESSES.stayBooking,
              abi: StayBookingAbi,
              functionName: "isBooked",
              args: [batch.id, day + BigInt(i)],
            })
          )
        );
        if (!cancelled) setNightStatus(results as boolean[]);
      } catch {
        if (!cancelled) setNightStatus(Array.from({ length: nights }, () => null));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [publicClient, batch.id, day, nights, refreshKey]);

  const anyTaken = nightStatus.some((s) => s === true);
  const loadingNights = nightStatus.length !== nights || nightStatus.some((s) => s === null);
  const busy = isPending || loadingNights || anyTaken;

  const handleSubmit = async () => {
    if (anyTaken || !address || !publicClient) return;
    setStatusMsg("Checking allowance...");
    try {
      const allowance = (await publicClient!.readContract({
        address: CONTRACT_ADDRESSES.mockUSDC,
        abi: MockUSDCAbi,
        functionName: "allowance",
        args: [address, CONTRACT_ADDRESSES.stayBooking],
      })) as bigint;
      const costWei = BigInt(total) * BigInt(10) ** BigInt(18);
      if (allowance < costWei) {
        setStatusMsg("Step 1/2 — approving mUSDC, confirm in your wallet...");
        const approveHash = await writeContractAsync({
          address: CONTRACT_ADDRESSES.mockUSDC,
          abi: MockUSDCAbi,
          functionName: "approve",
          args: [CONTRACT_ADDRESSES.stayBooking, costWei],
        });
        setStatusMsg("Approve sent — waiting for confirmation...");
        const approveReceipt = await waitForTx(approveHash);
        if (approveReceipt.status !== "success") {
          setStatusMsg("Approve failed on-chain. Try again.");
          return;
        }
        setStatusMsg("Approved! Step 2/2 — booking, confirm in your wallet...");
      } else {
        setStatusMsg("Booking on-chain, confirm in your wallet...");
      }
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.stayBooking,
        abi: StayBookingAbi,
        functionName: "bookStay",
        args: [batch.id, day, nights, guests],
      });
      setStatusMsg(`Submitted — awaiting confirmation...`);
      const receipt = await waitForTx(hash);
      if (receipt.status === "success") {
        setDone(true);
        setStatusMsg("Stay booked on-chain! Your nights are reserved.");
      } else {
        setStatusMsg("Booking failed on-chain. Try again.");
      }
    } catch (e: unknown) {
      console.error("BOOKING ERROR:", e);
      const msg = String((e as { message?: string })?.message || "");
      if (msg.includes("rejected")) {
        setStatusMsg("You rejected the transaction in your wallet.");
      } else if (msg.includes("Stay already booked")) {
        setStatusMsg("A night you picked was just taken on-chain. Choose another date.");
        checkAvailability();
      } else if (msg.includes("execution reverted")) {
        setStatusMsg("Transaction reverted — check your mUSDC balance.");
      } else {
        setStatusMsg((msg.length > 110 ? msg.slice(0, 110) + "..." : msg) || "Booking failed. See console.");
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-900/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Book a stay at the ${batch.cropType} farmstead`}
      onClick={onClose}
    >
      <div
        className="sticker-card relative w-full max-w-md overflow-hidden bg-white p-6 shadow-sticker-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {done && <ConfettiBurst count={50} />}

        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="text-sm font-bold text-amber-700">Book a stay</p>
            <h3 className="mt-1 font-heading text-xl font-bold text-ink-900">
              {batch.cropType} Farmstead
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close booking dialog"
            className="rounded-xl border-2 border-ink-800 bg-white p-1.5 text-zinc-400 shadow-[2px_2px_0_0_oklch(0.2_0.05_152)] transition-colors hover:text-zinc-700"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-500">
          Check-in date
        </label>
        <input
          type="date"
          value={checkIn}
          min={todayISO()}
          onChange={(e) => setCheckIn(e.target.value)}
          className="mb-4 w-full rounded-xl border-2 border-ink-800 bg-white px-3 py-2.5 text-sm font-semibold text-ink-900 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20"
        />

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-500">
              Nights
            </label>
            <select
              value={nights}
              onChange={(e) => setNights(Number(e.target.value))}
              className="w-full rounded-xl border-2 border-ink-800 bg-white px-3 py-2.5 text-sm font-semibold text-ink-900 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20"
            >
              {Array.from({ length: MAX_NIGHTS }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "night" : "nights"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-500">
              Guests
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full rounded-xl border-2 border-ink-800 bg-white px-3 py-2.5 text-sm font-semibold text-ink-900 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20"
            >
              {[1, 2, 3, 4].map((g) => (
                <option key={g} value={g}>
                  {g} {g === 1 ? "guest" : "guests"}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4 space-y-1.5 rounded-2xl border-2 border-ink-100 bg-ink-50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-zinc-500">Nights</span>
            <span className="text-sm font-bold text-ink-900 tabular">
              {nights} · {price ? (price * nights).toLocaleString() : "—"} mUSDC
            </span>
          </div>
          <div className="border-t-2 border-ink-100 pt-1.5">
            {Array.from({ length: nights }, (_, i) => (
              <div key={i} className="flex items-center justify-between py-0.5">
                <span className="text-xs font-semibold text-zinc-500">
                  Night {i + 1} — {addDays(checkIn, i)}
                </span>
                {nightStatus[i] === undefined || nightStatus[i] === null ? (
                  <span className="text-xs font-semibold text-zinc-400">checking…</span>
                ) : nightStatus[i] ? (
                  <span className="text-xs font-bold text-red-600">Booked</span>
                ) : (
                  <span className="text-xs font-bold text-emerald-700">Free</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <p className="mb-5 rounded-2xl border-2 border-ink-100 bg-ink-50 p-3 text-xs leading-relaxed font-semibold text-zinc-500">
          Paid in mUSDC and settled on-chain. The nights you book are reserved in the contract — the
          same date can never be booked twice.
        </p>

        {done ? (
          <div className="relative z-10 flex flex-col items-center rounded-2xl border-2 border-dashed border-emerald-600 bg-emerald-50/80 p-5">
            <SuccessStamp
              label="Stay booked!"
              sublabel="nights reserved on-chain"
            />
            <p className="mt-3 text-center text-xs leading-relaxed font-semibold text-zinc-600">
              {batch.cropType} Farmstead · {addDays(checkIn, 0)} · {nights} night
              {nights > 1 ? "s" : ""} · {guests} guest{guests > 1 ? "s" : ""}. The nights are
              reserved in the contract — open the house ledger to cancel.
            </p>
            <button
              onClick={onBooked}
              className="sticker-btn sticker-btn-amber mt-4 w-full !py-2 text-sm"
            >
              Done
            </button>
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!address || busy}
            className="sticker-btn sticker-btn-amber w-full !py-2.5 text-sm"
          >
            {loadingNights
              ? "Checking availability…"
              : anyTaken
                ? "Pick another date"
                : isPending
                  ? "Confirming…"
                  : `Confirm booking · ${(price * nights).toLocaleString()} mUSDC`}
          </button>
        )}

        {statusMsg && <p className="mt-3 text-xs font-semibold text-zinc-500 break-words">{statusMsg}</p>}
      </div>
    </div>
  );
}

interface MyBooking {
  batch: LandBatch | undefined;
  day: bigint;
  nights: number;
  guests: number;
  pricePerNight: number;
}

function MyBookings({ refreshKey, onChanged }: { refreshKey: number; onChanged: () => void }) {
  const { isConnected, address } = useSafeAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync, isPending } = useWriteContract();
  const [entries, setEntries] = useState<MyBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!isConnected || !address || !publicClient) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const stays = (await publicClient.readContract({
          address: CONTRACT_ADDRESSES.stayBooking,
          abi: StayBookingAbi,
          functionName: "getUserBookings",
          args: [address],
        })) as { batchId: bigint; day: bigint }[];
        const detailed = await Promise.all(
          stays.map(async (s) => {
            const stay = (await publicClient.readContract({
              address: CONTRACT_ADDRESSES.stayBooking,
              abi: StayBookingAbi,
              functionName: "getStay",
              args: [s.batchId, s.day],
            })) as { booker: string; nights: bigint; guests: bigint; pricePerNight: bigint; bookedAt: bigint };
            return {
              batch: allBatches().find((b) => b.id === Number(s.batchId)),
              day: s.day,
              nights: Number(stay.nights),
              guests: Number(stay.guests),
              pricePerNight: Number(formatUnits(stay.pricePerNight, 18)),
            };
          })
        );
        if (!cancelled) setEntries(detailed);
      } catch {
        if (!cancelled) setEntries([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isConnected, address, publicClient, refreshKey]);

  const waitForTx = async (hash: `0x${string}`) => {
    if (!publicClient) throw new Error("No public client");
    return publicClient.waitForTransactionReceipt({ hash, timeout: 60_000, retryCount: 20 });
  };

  const handleCancel = async (batchId: number, day: bigint) => {
    setMsg("Cancelling on-chain…");
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.stayBooking,
        abi: StayBookingAbi,
        functionName: "cancelStay",
        args: [batchId, day],
      });
      await waitForTx(hash);
      setMsg("Stay cancelled — the nights are free again.");
      onChanged();
    } catch (e: unknown) {
      const m = String((e as { message?: string })?.message || "");
      setMsg(m.includes("rejected") ? "You rejected the cancellation." : `Cancel failed: ${m.slice(0, 80)}`);
    }
  };

  if (!isConnected || entries.length === 0) return null;

  return (
    <section className="mt-16">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-heading text-xl font-bold text-ink-900">My stays</p>
        <span className="sticker-badge bg-ink-100 text-ink-800">Read on-chain</span>
      </div>
      {loading && entries.length === 0 ? (
        <p className="text-sm font-bold text-zinc-400">Loading your stays…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((b) => (
            <div key={b.day.toString()} className="sticker-card bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-heading text-lg font-bold text-ink-900">
                    {b.batch?.cropType ?? `Batch ${b.batch?.id ?? ""}`} Farmstead
                  </h3>
                  <p className="mt-0.5 text-xs font-semibold text-zinc-500">
                    {addDays("1970-01-01", Number(b.day))} · {b.nights} night{b.nights > 1 ? "s" : ""} ·{" "}
                    {b.guests} guest{b.guests > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-700 tabular">
                    {b.pricePerNight.toLocaleString()} / night
                  </div>
                  <div className="mt-0.5 text-xs font-semibold text-zinc-500">mUSDC</div>
                </div>
              </div>
              <button
                onClick={() => handleCancel(b.batch?.id ?? Number(b.day), b.day)}
                disabled={isPending}
                className="sticker-btn sticker-btn-outline mt-4 w-full !px-3 !py-2 text-xs hover:!border-red-600 hover:!text-red-600"
              >
                Cancel stay
              </button>
            </div>
          ))}
        </div>
      )}
      {msg && <p className="mt-3 text-xs font-semibold text-zinc-500">{msg}</p>}
    </section>
  );
}

const itinerary = [
  {
    day: "Day 1",
    title: "Arrive & walk your acres",
    body: "Check into the farmhouse, meet the farmer, and take a guided tour of the crop you own. Evening harvest tasting on the verandah.",
  },
  {
    day: "Day 2",
    title: "Work the harvest",
    body: "Join the morning harvest, learn the cycle from planting to market, and leave with produce picked hours earlier. Depart by evening.",
  },
];

export default function FarmStays() {
  const [modalBatch, setModalBatch] = useState<LandBatch | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Farm Stays"
        subtitle="Visit your farmland. Booking a stay is a real transaction on-chain — the nights you pick are reserved in the contract, so the same date can never be double-booked. Connect your wallet to check what you can book."
      />

      <Reveal className="sticker-card mb-14 bg-white p-8 sm:p-10">
        <span className="sticker-badge mb-3 inline-block bg-amber-100 text-amber-700">The weekend</span>
        <h2 className="font-heading text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
          A 2-night stay on your own land
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {itinerary.map((it) => (
            <div key={it.day} className="rounded-2xl border-2 border-ink-800 bg-ink-50 p-6">
              <div className="mb-2 text-sm font-bold text-amber-700">{it.day}</div>
              <h3 className="font-heading text-lg font-bold text-ink-900">{it.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">{it.body}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <div className="grid gap-6 sm:grid-cols-2">
        {allBatches().map((batch, i) => (
          <div
            key={batch.id}
            className="animate-pop-in"
            style={{ animationDelay: `${i * 120}ms` }}
          >
            <StayCard batch={batch} onOpenModal={setModalBatch} />
          </div>
        ))}
      </div>

      <MyBookings refreshKey={refreshKey} onChanged={refresh} />

      {modalBatch && (
        <BookingModal
          batch={modalBatch}
          onClose={() => setModalBatch(null)}
          onBooked={() => {
            setModalBatch(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}
