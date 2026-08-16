"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { waitForTransactionReceipt } from "@wagmi/core/actions";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { BATCHES, CONTRACT_ADDRESSES, getBatchMeta } from "@/lib/config";
import { stayAbi, usdcAbi, useGetStay, useIsBooked, useStayPrice, useUserBookings } from "@/lib/contracts";
import { dateToDay, dayToDate, fmtUSDC } from "@/lib/format";
import { wagmiConfig } from "@/lib/wagmi";

export default function StaysPage() {
  const { address, isConnected } = useAccount();
  const [sel, setSel] = useState(0);
  const [date, setDate] = useState("");
  const [nights, setNights] = useState("2");
  const [guests, setGuests] = useState("2");
  const [approving, setApproving] = useState(false);

  const day = useMemo(() => (date ? dateToDay(date) : undefined), [date]);
  const price = useStayPrice(sel);
  const booked = useIsBooked(sel, day);
  const stay = useGetStay(sel, day);

  const { data: allowance } = useReadContract({
    address: CONTRACT_ADDRESSES.mockUSDC,
    abi: usdcAbi,
    functionName: "allowance",
    args: address ? [address, CONTRACT_ADDRESSES.stayBooking] : undefined,
    query: { enabled: !!address, refetchInterval: 10_000 },
  });

  const book = useWriteContract();
  const bookReceipt = useWaitForTransactionReceipt({ hash: book.data });
  const approve = useWriteContract();
  const cancel = useWriteContract();
  const cancelReceipt = useWaitForTransactionReceipt({ hash: cancel.data });

  const nightsN = useMemo(() => Math.max(1, Math.min(7, Number(nights) || 1)), [nights]);
  const guestsN = useMemo(() => Math.max(1, Math.min(8, Number(guests) || 1)), [guests]);
  const total = price !== undefined ? price * BigInt(nightsN) : 0n;
  const needsApproval = ((allowance as bigint) ?? 0n) < total;

  const handleBook = async () => {
    if (total <= 0n || !isConnected) return;
    try {
      if (needsApproval) {
        setApproving(true);
        const approveHash = await approve.writeContractAsync({
          address: CONTRACT_ADDRESSES.mockUSDC,
          abi: usdcAbi,
          functionName: "approve",
          args: [CONTRACT_ADDRESSES.stayBooking, total],
        });
        await waitForTransactionReceipt(wagmiConfig, { hash: approveHash });
      }
      await book.writeContractAsync({
        address: CONTRACT_ADDRESSES.stayBooking,
        abi: stayAbi,
        functionName: "bookStay",
        args: [BigInt(sel), day!, BigInt(nightsN), BigInt(guestsN)],
      });
    } catch {
      setApproving(false);
    }
  };

  const myBookings = useUserBookings(address);
  const checked = day !== undefined;
  const available = checked && booked === false;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="font-display text-5xl leading-[1.05] tracking-tight text-ink sm:text-6xl">
          Farm <span className="paint">Stays</span>
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-2">
          Sleep on the land. Book a night on any batch, on-chain, in mUSDC.
          Up to 7 nights and 8 guests.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="sketch overflow-hidden bg-white">
          <div className="border-b-2 border-ink/20 px-5 py-4">
            <h2 className="font-display text-3xl text-ink">Book a stay</h2>
          </div>
          <div className="p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-ink-2">batch</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {BATCHES.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSel(b.id)}
                      className={`rounded-full border-2 px-3 py-1.5 text-sm font-semibold transition-all duration-150 ${
                        sel === b.id
                          ? "border-ink bg-ink text-paper shadow-[2px_2px_0_rgba(43,38,29,0.25)]"
                          : "border-transparent text-ink-2 hover:border-ink hover:bg-white"
                      }`}
                    >
                      {b.emoji} {b.cropType}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="text-sm font-semibold text-ink-2">check-in</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input-sketch mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-ink-2">nights (≤7)</label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={nights}
                    onChange={(e) => setNights(e.target.value)}
                    className="input-sketch mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-ink-2">guests (≤8)</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="input-sketch mt-2"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-ink-2">
                {getBatchMeta(sel).cropType} night rate:{" "}
                <span className="font-display text-ink">
                  {price !== undefined ? `${fmtUSDC(price)} mUSDC` : "…"}
                </span>
                {price !== undefined && (
                  <span className="ml-2 font-display text-lg text-sage-2">
                    {nightsN} nights = {fmtUSDC(total)} mUSDC
                  </span>
                )}
              </div>
              <span className="chip pointer-events-none cursor-default bg-white opacity-90">
                Check availability
              </span>
            </div>

            <AnimatePresence>
              {checked && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  {available ? (
                    <div className="sketch-soft mt-4 bg-sage-50 p-4">
                      <p className="font-display text-xl text-sage-2">
                        ✓ Available! {dayToDate(day!)} is free.
                      </p>
                      {!isConnected ? (
                        <ConnectButton.Custom>
                          {({ openConnectModal }) => (
                            <button type="button" onClick={openConnectModal} className="btn btn-fill mt-3">
                              Connect wallet to book
                            </button>
                          )}
                        </ConnectButton.Custom>
                      ) : bookReceipt.isSuccess ? (
                        <motion.div
                          initial={{ scale: 0.85, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                        >
                          <p className="mt-3 font-display text-2xl text-sage-2">
                            Stay booked on-chain! 🎉
                          </p>
                          <p className="text-sm text-ink-2">
                            {dayToDate(day!)} · {nightsN} night{nightsN > 1 ? "s" : ""} · {guestsN} guest{guestsN > 1 ? "s" : ""}
                          </p>
                          <span className="chip mt-3 pointer-events-none cursor-default bg-white opacity-90">
                            Done
                          </span>
                        </motion.div>
                      ) : (
                        <div className="mt-3 flex flex-wrap gap-3">
                          <button
                            type="button"
                            className="btn btn-fill"
                            disabled={book.isPending || approving}
                            onClick={handleBook}
                          >
                            {book.isPending || approving
                              ? approving
                                ? "Approving…"
                                : "Booking…"
                              : needsApproval
                                ? `Approve & book · ${fmtUSDC(total)} mUSDC`
                                : `Confirm booking · ${fmtUSDC(total)} mUSDC`}
                          </button>
                          <button type="button" className="btn btn-sketch" onClick={() => setDate("")}>
                            Pick another date
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="sketch-soft mt-4 bg-tomato/10 p-4">
                      <p className="font-display text-xl text-tomato">
                        {booked === true
                          ? stay
                            ? `✗ Taken by ${stay.booker.slice(0, 6)}…, pick another date`
                            : "✗ Not available, pick another date"
                          : "Checking…"}
                      </p>
                      <button type="button" className="btn btn-sketch mt-3" onClick={() => setDate("")}>
                        Pick another date
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        <section className="sketch bg-white p-5">
          <h2 className="font-display text-2xl text-ink">My stays</h2>
          {!isConnected ? (
            <p className="mt-3 text-sm text-ink-2">Connect a wallet to see your stays.</p>
          ) : myBookings.bookings.length === 0 ? (
            <p className="mt-3 text-sm text-ink-2">No stays booked yet.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {myBookings.bookings.map((bk, i) => (
                <StayRow
                  key={i}
                  batchId={bk.batchId}
                  day={bk.day}
                  cancelReceiptSuccess={cancelReceipt.isSuccess}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StayRow({
  batchId,
  day,
  cancelReceiptSuccess,
}: {
  batchId: number;
  day: bigint;
  cancelReceiptSuccess: boolean;
}) {
  const meta = getBatchMeta(batchId);
  const stay = useGetStay(batchId, day);
  const cancel = useWriteContract();
  return (
    <div className="sketch-xs bg-white p-3">
      <div className="flex items-center justify-between">
        <p className="font-display text-lg text-ink">
          {meta.emoji} {meta.cropType}
        </p>
        <span className="text-sm text-ink-2">{dayToDate(day)}</span>
      </div>
      <p className="text-xs text-ink-3">
        {stay ? `${stay.nights} night${stay.nights > 1 ? "s" : ""} · ${stay.guests} guest${stay.guests > 1 ? "s" : ""} · ${fmtUSDC(stay.total)} mUSDC` : ""}
      </p>
      <button
        type="button"
        className="btn btn-tomato mt-2 w-full !text-sm"
        disabled={cancel.isPending}
        onClick={() =>
          cancel.writeContract({
            address: CONTRACT_ADDRESSES.stayBooking,
            abi: stayAbi,
            functionName: "cancelStay",
            args: [BigInt(batchId), day],
          })
        }
      >
        {cancelReceiptSuccess ? "Cancelled, refunded ✓" : "Cancel stay (refund)"}
      </button>
    </div>
  );
}
