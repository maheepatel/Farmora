"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import type { WalletClient } from "viem";
import { BATCHES, CONTRACT_ADDRESSES } from "@/lib/config";
import { batchAddress, usdcAbi, useUSDCBalance } from "@/lib/contracts";
import { fmtUSDC, fmtTokens } from "@/lib/format";

export default function AddTokensPage() {
  const { address, isConnected } = useAccount();
  const { balance, hasClaimed } = useUSDCBalance(address);
  const faucet = useWriteContract();
  const faucetReceipt = useWaitForTransactionReceipt({ hash: faucet.data });
  const [watching, setWatching] = useState<string | null>(null);

  const tokens = useMemo(
    () => [
      {
        symbol: "mUSDC",
        name: "Mock USDC",
        decimals: 18,
        address: CONTRACT_ADDRESSES.mockUSDC,
        emoji: "💵",
        balance,
      },
      ...BATCHES.map((b) => ({
        symbol: b.tokenSymbol,
        name: b.tokenName,
        decimals: 18,
        address: batchAddress(b.id)!,
        emoji: b.emoji,
        balance: undefined as bigint | undefined,
      })),
    ],
    [balance],
  );

  const faucetClaimed = faucetReceipt.isSuccess;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-14 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="font-display text-5xl leading-[1.05] tracking-tight text-ink sm:text-6xl">
          Token <span className="paint">registry</span>
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-2">
          Everything you trade with, on <span className="font-semibold text-sage-2">Monad Testnet</span>.
          Grab mUSDC from the faucet, then add any token to your wallet in one tap.
        </p>
      </div>

      {!isConnected ? (
        <div className="mt-10">
          <div className="sketch mx-auto max-w-md bg-white p-8 text-center">
            <p className="text-4xl">🔑</p>
            <h2 className="mt-3 font-display text-2xl text-ink">Connect your wallet</h2>
            <p className="mt-2 text-sm text-ink-2">
              You need a wallet to claim the faucet and add tokens.
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
      ) : (
        <div>
          <div className="sketch mt-10 flex flex-wrap items-center justify-between gap-4 bg-white p-5">
            <div>
              <p className="font-display text-2xl text-ink">mUSDC faucet</p>
              <p className="text-sm text-ink-2">
                One-time 50,000 mUSDC per address on Monad Testnet.
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-ink-3">your balance</p>
              <p className="font-display text-3xl text-sage-2">{fmtUSDC(balance)} mUSDC</p>
            </div>
            <AnimatePresence mode="wait">
              {faucetClaimed ? (
                <motion.p
                  key="ok"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="chip bg-sage-50"
                >
                  Faucet claimed! +50,000 mUSDC 🎉
                </motion.p>
              ) : hasClaimed ? (
                <span className="chip bg-paper-2">
                  Already claimed, add more via any faucet
                </span>
              ) : (
                <button
                  type="button"
                  className="btn btn-sun"
                  disabled={faucet.isPending}
                  onClick={() =>
                    faucet.writeContract({
                      address: CONTRACT_ADDRESSES.mockUSDC,
                      abi: usdcAbi,
                      functionName: "faucet",
                    })
                  }
                >
                  {faucet.isPending ? "Claiming…" : "Claim 50,000 mUSDC"}
                </button>
              )}
            </AnimatePresence>
          </div>

          <div className="sketch mt-8 overflow-hidden bg-white">
            <div className="border-b-2 border-ink/20 bg-paper-2 px-5 py-4">
              <p className="font-display text-2xl text-ink">
                Registry · <span className="text-sage-2">Monad Testnet</span> (chain 10143)
              </p>
            </div>
            <div className="divide-y-2 divide-ink/10">
              {tokens.map((t) => (
                <div
                  key={t.address}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{t.emoji}</span>
                    <div>
                      <p className="font-display text-lg leading-none text-ink">
                        {t.name} <span className="text-sm font-medium text-ink-3">({t.symbol})</span>
                      </p>
                      <p className="mt-0.5 break-all font-mono text-xs text-ink-3">
                        {t.address}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {t.balance !== undefined && (
                      <span className="font-display text-ink">
                        {fmtTokens(t.balance)} {t.symbol}
                      </span>
                    )}
                    <button
                      type="button"
                      className="btn btn-sketch !rounded-full !px-3 !py-1.5 !text-sm"
                      onClick={() => watchToken(t, setWatching)}
                    >
                      {watching === t.address ? "Adding…" : "+ Add to wallet"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-ink-3">
            Need more MON for gas? Grab it from the{" "}
            <a href="https://faucet.monad.xyz" target="_blank" rel="noreferrer" className="font-semibold text-sage-2 underline decoration-2 underline-offset-2">
              Monad faucet
            </a>{" "}
            · every write above costs gas.
          </p>
        </div>
      )}
    </div>
  );
}

async function watchToken(
  t: { address: `0x${string}`; symbol: string; name: string; decimals: number },
  setWatching: (a: string | null) => void,
) {
  setWatching(t.address);
  try {
    const { getWalletClient } = await import("@wagmi/core/actions");
    const { wagmiConfig } = await import("@/lib/wagmi");
    const client: WalletClient = await getWalletClient(wagmiConfig as never);
    await client.watchAsset({
      type: "ERC20",
      options: {
        address: t.address,
        symbol: t.symbol,
        decimals: t.decimals,
        image: "https://raw.githubusercontent.com/maheepatel/Farmora/main/frontend/public/icon.svg",
      },
    });
  } catch {
    /* user rejected or wallet lacks watchAsset */
  }
  setWatching(null);
}
