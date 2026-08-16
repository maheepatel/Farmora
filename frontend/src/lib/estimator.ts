import { getBatchMeta } from "./config";
import { SCALE } from "./format";

export const ESTIMATE_YEARS = ["2023", "2024", "2025", "2026"] as const;

const BASE_YIELD_PCT: Record<number, number> = {
  0: 23, // saffron
  1: 26, // cordyceps
  2: 22, // mushroom
  3: 18, // dragon fruit
  4: 20, // pomegranate
  5: 21, // grapes
  6: 19, // turmeric
  7: 21, // ginger
};

export const APPRECIATION_PCT = 1; // ~1% per year

type Estimator = {
  years: { year: string; variable: number; fixed: number }[];
  totalVariable: number;
  totalFixed: number;
  nextYear: number;
};

export function estimateReturns(
  id: number,
  investorShareBps: bigint | undefined,
  fixedReturnBps: bigint | undefined,
): Estimator {
  const baseYield = BASE_YIELD_PCT[id] ?? 20;
  const shareBps = investorShareBps ?? BigInt(7000);
  const fixedBps = fixedReturnBps ?? BigInt(1500);

  const step = 500n; // 5 percentage points per year
  const years = ESTIMATE_YEARS.map((year, i) => {
    const y = i + 1;
    const shareYear = shareBps - step * BigInt(y - 1);
    const shareClamped =
      shareYear < 0n ? 0n : shareYear < 10000n ? shareYear : 10000n;
    const variable =
      (baseYield * Number(shareClamped)) / 10000 *
      Math.pow(1 + APPRECIATION_PCT / 100, y - 1);
    const fixed = Number(fixedBps) / 100;
    return { year, variable, fixed };
  });

  const appreciationTotal = APPRECIATION_PCT * 4;
  return {
    years,
    totalVariable:
      Math.round(years.reduce((s, y) => s + y.variable, 0) * 10) / 10 +
      appreciationTotal,
    totalFixed:
      Math.round(years.reduce((s, y) => s + y.fixed, 0) * 10) / 10 +
      appreciationTotal,
    nextYear: Math.round(years[0].variable * 10) / 10,
  };
}

export function tokenCost(tokens: number, pricePerToken: bigint): bigint {
  return BigInt(Math.round(tokens * 10000)) * (pricePerToken / 10000n);
}

export function tokensPerAcre(id: number): number {
  return getBatchMeta(id).tokensPerAcre;
}

export function toBigIntTokens(tokens: number): bigint {
  return BigInt(Math.round(tokens * Number(SCALE)));
}
