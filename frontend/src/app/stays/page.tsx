"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { BATCHES, CONTRACT_ADDRESSES, getBatchMeta } from "@/lib/config";
import { stayAbi, useGetStay, useIsBooked, useStayPrice, useUserBookings } from "@/lib/contracts";
import { dateToDay, dayToDate, fmtUSDC } from "@/lib/format";

export default function StaysPage() {
  const { address, isConnected } = useAccount();
  const [sel, setSel] = useState(0);
  const [date, setDate] = useState("");
  const [nights, setNights] = useState("2");
  const [guests, setGuests] = useState("2");

  const day = useMemo(() => (date ? dateToDay(date) : undefined), [date]);
  const price = useStayPrice(sel);
  const booked = useIsBooked(sel, day);
  const stay = useGetStay(sel, day);

  const book = useWriteContract();
  const bookReceipt = useWaitForTransactionReceipt({ hash: book.data });
  const cancel = useWriteContract();
  const cancelReceipt = useWaitForTransactionReceipt({ hash: cancel.data });

  const nightsN = useMemo(() => Math.max(1, Math.min(7, Number(nights) || 1)), [nights]);
  const guestsN = useMemo(() => Math.max(1, Math.min(8, Number(guests) || 1)), [guests]);
  const total = price !== undefined ? price * BigInt(nightsN) : 0n;

  const myBookings = useUserBookings(address);
  const checked = day !== undefined;
  const available = checked && booked === false;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="font-heading text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">
          Farm <span className="text-emerald-700">Stays</span>
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-zinc-600">
          Sleep on the land. Book a night on any batch, on-chain, in mUSDC.
          Up to 7 nights and 8 guests.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="sticker-card overflow-hidden bg-white">
          <div className="border-b-2 border-ink-100 px-5 py-4">
            <h2 className="font-heading text-2xl font-bold text-ink-900">Book a stay</h2>
          </div>
          <div className="p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-zinc-600">batch</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {BATCHES.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSel(b.id)}
                      className={`rounded-full border-2 px-3 py-1.5 text-sm font-semibold transition-all duration-150 ${
                        sel === b.id
                          ? "border-ink-800 bg-emerald-600 text-white shadow-[2px_2px_0_0_var(--color-forest)]"
                          : "border-transparent text-ink-600 hover:border-ink-800 hover:bg-white hover:shadow-[2px_2px_0_0_var(--color-forest)]"
                      }`}
                    >
                      {b.emoji} {b.cropType}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="text-sm font-semibold text-zinc-600">check-in</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input-ledger mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-zinc-600">nights (≤7)</label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={nights}
                    onChange={(e) => setNights(e.target.value)}
                    className="input-ledger mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-zinc-600">guests (≤8)</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="input-ledger mt-2"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-zinc-600">
                {getBatchMeta(sel).cropType} night rate:{" "}
                <span className="font-heading font-bold text-ink-900">
                  {price !== undefined ? `${fmtUSDC(price)} mUSDC` : "…"}
                </span>
                {price !== undefined && (
                  <span className="ml-2 font-heading text-lg font-bold text-emerald-700">
                    {nightsN} nights = {fmtUSDC(total)} mUSDC
                  </span>
                )}
              </div>
              <span className="sticker-btn pointer-events-none cursor-default opacity-90 !px-4 !py-1.5 !text-sm">
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
                    <div className="mt-4 rounded-xl bg-emerald-50 p-4">
                      <p className="font-heading text-xl font-bold text-emerald-700">
                        ✓ Available! {dayToDate(day!)} is free.
                      </p>
                      {!isConnected ? (
                        <ConnectButton.Custom>
                          {({ openConnectModal }) => (
                            <button type="button" onClick={openConnectModal} className="sticker-btn mt-3">
                              Connect wallet to book
                            </button>
                          )}
                        </ConnectButton.Custom>
                      ) : bookReceipt.isSuccess ? (
                        <motion.div
                          initial={{ scale: 0.85, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                        >
                          <p className="mt-3 font-heading text-2xl font-bold text-emerald-700">
                            Stay booked on-chain! 🎉
                          </p>
                          <p className="text-sm text-zinc-600">
                            {dayToDate(day!)} · {nightsN} night{nightsN > 1 ? "s" : ""} · {guestsN} guest{guestsN > 1 ? "s" : ""}
                          </p>
                          <span className="sticker-btn mt-3 pointer-events-none cursor-default opacity-90 !px-4 !py-1.5 !text-sm">
                            Done
                          </span>
                        </motion.div>
                      ) : (
                        <div className="mt-3 flex flex-wrap gap-3">
                          <button
                            type="button"
                            className="sticker-btn"
                            disabled={book.isPending}
                            onClick={() =>
                              book.writeContract({
                                address: CONTRACT_ADDRESSES.stayBooking,
                                abi: stayAbi,
                                functionName: "bookStay",
                                args: [BigInt(sel), day!, BigInt(nightsN), BigInt(guestsN)],
                              })
                            }
                          >
                            {book.isPending ? "Booking…" : `Confirm booking · ${fmtUSDC(total)} mUSDC`}
                          </button>
                          <button type="button" className="sticker-btn-outline" onClick={() => setDate("")}>
                            Pick another date
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-xl bg-rose-50 p-4">
                      <p className="font-heading text-xl font-bold text-rose-600">
                        {booked === true
                          ? stay
                            ? `✗ Taken by ${stay.booker.slice(0, 6)}… — pick another date`
                            : "✗ Not available — pick another date"
                          : "Checking…"}
                      </p>
                      <button type="button" className="sticker-btn-outline mt-3" onClick={() => setDate("")}>
                        Pick another date
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        <section className="sticker-card bg-white p-5">
          <h2 className="font-heading text-2xl font-bold text-ink-900">My stays</h2>
          {!isConnected ? (
            <p className="mt-3 text-sm text-zinc-600">Connect a wallet to see your stays.</p>
          ) : myBookings.bookings.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-600">No stays booked yet.</p>
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
    <div className="rounded-xl bg-white p-3 ring-2 ring-ink-100">
      <div className="flex items-center justify-between">
        <p className="font-heading text-lg font-bold text-ink-900">
          {meta.emoji} {meta.cropType}
        </p>
        <span className="text-sm text-zinc-600">{dayToDate(day)}</span>
      </div>
      <p className="text-xs text-zinc-500">
        {stay ? `${stay.nights} night${stay.nights > 1 ? "s" : ""} · ${stay.guests} guest${stay.guests > 1 ? "s" : ""} · ${fmtUSDC(stay.total)} mUSDC` : ""}
      </p>
      <button
        type="button"
        className="sticker-btn mt-2 w-full !bg-rose-600 !text-sm"
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
        {cancelReceiptSuccess ? "Cancelled — refunded ✓" : "Cancel stay (refund)"}
      </button>
    </div>
  );
}
