import { Fragment } from "react";
import { ArrowRight, ArrowDown } from "lucide-react";

const steps = [
  {
    n: "1",
    num: "mUSDC in · LAND out",
    title: "Buy a parcel",
    body: "Tokens are bought with mUSDC at the parcel's fixed price. 10% of every purchase is set aside in the buyback reserve that funds later exits.",
    chip: "bg-emerald-100 text-emerald-700",
  },
  {
    n: "2",
    num: "−5 points on a mid-stream sale",
    title: "The early exit",
    body: "Your split is 70 / 30 from the day you buy, and holding to the harvest keeps it yours. Sell before it and a new buyer takes your stake: 5 points of the split move to the farmer for each year you held — your risk is being reduced.",
    chip: "bg-amber-100 text-amber-700",
  },
  {
    n: "3",
    num: "share → split",
    title: "Revenue splits",
    body: "Revenue is split at the current share. Fixed-return holders are capped at their rate; the farmer takes the rest — milestones and daily clips are the proof of work behind it.",
    chip: "bg-rose-100 text-rose-700",
  },
  {
    n: "4",
    num: "cooldown → buyback",
    title: "Exit after 90 days",
    body: "Request a sale and your tokens lock for 90 days. While they wait, your harvest stops. After the cooldown you are paid principal plus 1% per year of appreciation — from the reserve.",
    chip: "bg-lime-100 text-lime-700",
  },
];

export function ModelFlow() {
  return (
    <div>
      <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-[1fr_2.5rem_1fr_2.5rem_1fr_2.5rem_1fr] lg:items-stretch">
        {steps.map((step, i) => (
          <Fragment key={step.n}>
            <li className="sticker-card flex flex-col p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink-800 bg-amber-400 font-heading text-base font-bold text-ink-900 shadow-[2px_2px_0_0_oklch(0.2_0.05_152)] tabular">
                  {step.n}
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${step.chip}`}>
                  {step.num}
                </span>
              </div>
              <h3 className="mt-5 font-heading text-xl font-bold text-ink-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">{step.body}</p>
            </li>
            {i < steps.length - 1 && (
              <Fragment key={`${step.n}-arrow`}>
                <li aria-hidden className="hidden items-center justify-center text-emerald-400 lg:flex">
                  <ArrowRight className="h-6 w-6" strokeWidth={3} />
                </li>
                <li aria-hidden className="flex justify-center text-emerald-400 sm:hidden lg:hidden">
                  <ArrowDown className="h-6 w-6" strokeWidth={3} />
                </li>
              </Fragment>
            )}
          </Fragment>
        ))}
      </ol>

      <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-4">
        {[
          { label: "Starting investor share", value: "70%", note: "of every harvest", bg: "bg-emerald-50" },
          { label: "Moves to the farmer", value: "−5 pts", note: "on a mid-stream sale", bg: "bg-amber-50" },
          { label: "Sell cooldown", value: "90 days", note: "then your money's back", bg: "bg-rose-50" },
          { label: "After the cooldown", value: "+1% / yr", note: "if a year has passed", bg: "bg-lime-50" },
        ].map((cell) => (
          <div key={cell.label} className={`sticker-card ${cell.bg} px-5 py-5`}>
            <p className="font-heading text-2xl font-bold text-ink-900 tabular">{cell.value}</p>
            <p className="mt-2 text-sm font-bold text-ink-800">{cell.label}</p>
            <p className="mt-0.5 text-xs text-zinc-500">{cell.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
