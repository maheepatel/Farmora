"use client";

import { Sparkles } from "lucide-react";

interface SuccessStampProps {
  label: string;
  sublabel?: string;
}

export function SuccessStamp({ label, sublabel }: SuccessStampProps) {
  return (
    <div className="animate-stamp-in flex flex-col items-center gap-1">
      <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-ink-800 bg-emerald-500 text-white shadow-[3px_3px_0_0_oklch(0.2_0.05_152)]">
        <Sparkles className="h-7 w-7" />
      </span>
      <span className="mt-2 rounded-full border-2 border-ink-800 bg-amber-400 px-4 py-1 font-heading text-sm font-bold tracking-wide text-amber-950 uppercase shadow-[3px_3px_0_0_oklch(0.2_0.05_152)]">
        {label}
      </span>
      {sublabel && <span className="mt-1 text-xs text-zinc-500">{sublabel}</span>}
    </div>
  );
}
