"use client";

import { useCallback, useSyncExternalStore } from "react";

export type Holding = {
  parcelId: string;
  shares: number;
  boughtAt: number;
};

export type Transaction = {
  id: string;
  type: "buy" | "stake" | "claim";
  parcelId: string;
  shares: number;
  amount: number;
  at: number;
};

export type WalletState = {
  address: string | null;
  balance: number;
  holdings: Holding[];
  transactions: Transaction[];
  pendingYield: number;
};

const initialState: WalletState = {
  address: null,
  balance: 50000,
  holdings: [],
  transactions: [],
  pendingYield: 0,
};

const WALLET_KEY = "farmora.wallet";
const PORTFOLIO_KEY = "farmora.portfolio";

function loadState(): WalletState {
  if (typeof window === "undefined") return initialState;
  try {
    const wallet = window.localStorage.getItem(WALLET_KEY);
    const portfolio = window.localStorage.getItem(PORTFOLIO_KEY);
    const address = wallet ? JSON.parse(wallet).address : null;
    const stored = portfolio ? JSON.parse(portfolio) : null;
    if (stored) return { ...initialState, address, ...stored };
    return { ...initialState, address };
  } catch {
    return initialState;
  }
}

// Module-level external store, read via useSyncExternalStore.
// Keeps wallet state out of the React render cycle and safe for SSR hydration.
let cache: WalletState | null = null;
const listeners = new Set<() => void>();

function snapshot(): WalletState {
  if (cache === null) cache = loadState();
  return cache;
}

function set(next: WalletState) {
  cache = next;
  window.localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(next));
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useWallet() {
  const state = useSyncExternalStore(subscribe, snapshot, () => initialState);

  const connect = useCallback(() => {
    const current = snapshot();
    if (current.address) return;
    const address = `0x${Math.random().toString(16).slice(2, 10)}a`;
    window.localStorage.setItem(WALLET_KEY, JSON.stringify({ address }));
    set({ ...current, address });
  }, []);

  const disconnect = useCallback(() => {
    const current = snapshot();
    window.localStorage.removeItem(WALLET_KEY);
    set({ ...current, address: null });
  }, []);

  const buyShares = useCallback(
    (parcelId: string, shares: number, price: number) => {
      const current = snapshot();
      const cost = Math.round(shares * price);
      if (!current.address || current.balance < cost || shares <= 0) return;
      const holdings = [...current.holdings];
      const existing = holdings.find((h) => h.parcelId === parcelId);
      if (existing) existing.shares += shares;
      else holdings.push({ parcelId, shares, boughtAt: Date.now() });
      set({
        ...current,
        balance: current.balance - cost,
        holdings,
        transactions: [
          {
            id: `${Date.now()}-buy`,
            type: "buy" as const,
            parcelId,
            shares,
            amount: cost,
            at: Date.now(),
          },
          ...current.transactions,
        ].slice(0, 30),
      });
    },
    [],
  );

  const stakeAll = useCallback(() => {
    const current = snapshot();
    const totalShares = current.holdings.reduce(
      (sum, h) => sum + h.shares,
      0,
    );
    const yieldAt10 = Math.round(totalShares * 0.1);
    set({
      ...current,
      pendingYield: current.pendingYield + yieldAt10,
      transactions: [
        {
          id: `${Date.now()}-stake`,
          type: "stake" as const,
          parcelId: "all",
          shares: 0,
          amount: yieldAt10,
          at: Date.now(),
        },
        ...current.transactions,
      ].slice(0, 30),
    });
  }, []);

  const claimYield = useCallback(() => {
    const current = snapshot();
    set({
      ...current,
      balance: current.balance + current.pendingYield,
      pendingYield: 0,
      transactions: [
        {
          id: `${Date.now()}-claim`,
          type: "claim" as const,
          parcelId: "all",
          shares: 0,
          amount: current.pendingYield,
          at: Date.now(),
        },
        ...current.transactions,
      ].slice(0, 30),
    });
  }, []);

  return { state, connect, disconnect, buyShares, stakeAll, claimYield };
}
