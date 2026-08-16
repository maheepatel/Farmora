export const SCALE = 1_000_000_000_000_000_000n; // 1e18

export function fmtAmount(value: bigint | undefined, maxFrac = 2): string {
  if (value === undefined) return "0";
  const neg = value < 0n;
  const abs = neg ? -value : value;
  const whole = abs / SCALE;
  const frac = abs % SCALE;
  if (frac === 0n) return `${neg ? "-" : ""}${whole.toString()}`;
  const fracStr = frac.toString().padStart(18, "0").slice(0, maxFrac);
  return `${neg ? "-" : ""}${whole.toString()}.${fracStr.replace(/0+$/, "")}`;
}

export function fmtUSDC(value: bigint | undefined): string {
  const n = Number(fmtAmount(value, 4) || "0");
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function fmtTokens(value: bigint | undefined): string {
  const n = Number(fmtAmount(value, 0) || "0");
  return n.toLocaleString("en-US");
}

export function fmtWhole(value: bigint | undefined): string {
  if (value === undefined) return "0";
  return value.toLocaleString("en-US");
}

export function bpsToPct(bps: bigint | undefined): number {
  if (bps === undefined) return 0;
  return Number(bps) / 100;
}

export function pct(value: bigint | undefined): string {
  return `${bpsToPct(value).toFixed(bpsToPct(value) % 1 === 0 ? 0 : 1)}%`;
}

export function dayToDate(day: bigint): string {
  return new Date(Number(day) * 86400000).toISOString().slice(0, 10);
}

export function dateToDay(dateStr: string): bigint {
  const [y, m, d] = dateStr.split("-").map(Number);
  return BigInt(Math.floor(Date.UTC(y, m - 1, d) / 86400000));
}

export function daysLeftUntil(unixSec: bigint | undefined): number {
  if (!unixSec) return 0;
  const diff = Number(unixSec) * 1000 - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

export function timeAgo(unixSec: bigint): string {
  const s = Number(unixSec);
  const diff = Date.now() / 1000 - s;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export const GROWTH_STAGES = [
  "Seedling",
  "Vegetative",
  "Flowering",
  "Fruiting",
  "HarvestReady",
] as const;
