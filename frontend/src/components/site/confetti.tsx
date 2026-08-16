"use client";

import { useId, useMemo } from "react";

const PALETTE = [
  "oklch(0.76 0.15 72)",
  "oklch(0.5 0.115 152)",
  "oklch(0.71 0.12 19)",
  "oklch(0.63 0.12 115)",
  "oklch(0.55 0.09 320)",
  "oklch(0.72 0.09 250)",
];

/* Deterministic PRNG so confetti positions stay stable across re-renders
   and render stays pure (no Math.random during render). */
function mulberry32(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function useRng() {
  const id = useId();
  const seed = id
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return useMemo(() => mulberry32(seed), [seed]);
}

interface ConfettiBurstProps {
  count?: number;
}

export function ConfettiBurst({ count = 40 }: ConfettiBurstProps) {
  const rng = useRng();
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const left = rng() * 100;
        const drift = (rng() - 0.5) * 140;
        const delay = rng() * 0.5;
        const duration = 2 + rng() * 1.6;
        const color = PALETTE[i % PALETTE.length];
        const rotate = rng() * 360;
        const scale = 0.7 + rng() * 0.8;
        return { left, drift, delay, duration, color, rotate, scale, id: i };
      }),
    [count, rng]
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            transform: `rotate(${p.rotate}deg) scale(${p.scale})`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            ["--drift" as string]: `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
}

interface CoinRainProps {
  count?: number;
}

export function CoinRain({ count = 12 }: CoinRainProps) {
  const rng = useRng();
  const coins = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const left = 8 + rng() * 84;
        const delay = rng() * 0.4;
        const color = i % 3 === 0 ? "#F59E0B" : i % 3 === 1 ? "#34C96B" : "#FFC53D";
        return { left, delay, color, id: i };
      }),
    [count, rng]
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {coins.map((c) => (
        <span
          key={c.id}
          className="coin-piece flex items-center justify-center font-heading text-[13px] font-bold text-ink-900"
          style={{
            left: `${c.left}%`,
            backgroundColor: c.color,
            animationDelay: `${c.delay}s`,
          }}
        >
          L
        </span>
      ))}
    </div>
  );
}
