"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { waitForTransactionReceipt } from "@wagmi/core/actions";
import { AnimatePresence, animate, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { landBatchAbi, usdcAbi, useUSDCBalance } from "@/lib/contracts";
import { BATCH_ADDRESSES, CONTRACT_ADDRESSES, getBatchMeta } from "@/lib/config";
import { fmtUSDC, fmtTokens } from "@/lib/format";
import { toBigIntTokens, tokenCost } from "@/lib/estimator";
import { wagmiConfig } from "@/lib/wagmi";

type Step = "input" | "approving" | "buying" | "success" | "error";

export function BuyPanel({
  batchId,
  pricePerToken,
  soldTokens,
  totalSupply,
}: {
  batchId: number;
  pricePerToken: bigint;
  soldTokens: bigint;
  totalSupply: bigint;
}) {
  const { address, isConnected } = useAccount();
  const meta = getBatchMeta(batchId);
  const [acres, setAcres] = useState("");
  const [isFixed, setIsFixed] = useState(true);
  const [step, setStep] = useState<Step>("input");
  const [error, setError] = useState("");
  const [countUp, setCountUp] = useState(0);

  const { balance: usdcBalance } = useUSDCBalance(address);

  const { data: allowance } = useReadContract({
    address: CONTRACT_ADDRESSES.mockUSDC,
    abi: usdcAbi,
    functionName: "allowance",
    args: address ? [address, BATCH_ADDRESSES[batchId]] : undefined,
    query: { enabled: !!address, refetchInterval: 10_000 },
  });

  const tokens = useMemo(() => {
    const n = Number(acres || "0");
    if (!Number.isFinite(n) || n <= 0) return 0;
    return Math.floor(n * meta.tokensPerAcre);
  }, [acres, meta]);

  const cost = useMemo(
    () => tokenCost(tokens, pricePerToken || 1000000000000000000n),
    [tokens, pricePerToken],
  );
  const price = pricePerToken || 1000000000000000000n;
  const needsApproval = ((allowance as bigint) ?? 0n) < cost;

  const approve = useWriteContract();
  const buy = useWriteContract();

  const handleBuy = async () => {
    if (tokens <= 0) return;
    setError("");
    setStep("approving");
    try {
      const batchAddr = BATCH_ADDRESSES[batchId];
      const tokenAmount = toBigIntTokens(tokens);
      if (needsApproval) {
        const approveHash = await approve.writeContractAsync({
          address: CONTRACT_ADDRESSES.mockUSDC,
          abi: usdcAbi,
          functionName: "approve",
          args: [batchAddr, cost],
        });
        await waitForTransactionReceipt(wagmiConfig, { hash: approveHash });
      }
      setStep("buying");
      const buyHash = await buy.writeContractAsync({
        address: batchAddr,
        abi: landBatchAbi,
        functionName: "buyTokens",
        args: [tokenAmount, isFixed],
      });
      await waitForTransactionReceipt(wagmiConfig, { hash: buyHash });
      setStep("success");
      const controls = animate(0, tokens, {
        duration: 1.4,
        ease: "easeOut",
        onUpdate: (v) => setCountUp(Math.round(v)),
      });
      return () => controls.stop();
    } catch {
      setStep("error");
      setError("The transaction was rejected or failed.");
    }
  };

  const running = step === "approving" || step === "buying";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="sketch sticky top-20 z-10 flex flex-col gap-4 bg-white p-5"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display text-2xl text-ink">Buy {meta.tokenSymbol}</h3>
        <span className="chip bg-sage-50">
          {fmtUSDC(price)} mUSDC/token
        </span>
      </div>

      <div>
        <label htmlFor="acres" className="text-sm font-semibold text-ink-2">Acres to buy</label>
        <input
          id="acres"
          type="number"
          min="1"
          inputMode="decimal"
          placeholder="1"
          value={acres}
          onChange={(e) => setAcres(e.target.value)}
          className="input-sketch mt-1 text-xl"
        />
        <p className="mt-1 text-xs text-ink-3">
          {meta.tokensPerAcre} tokens per acre · {fmtTokens(BigInt(tokens))} tokens
        </p>
      </div>

      <div className="sketch-soft bg-paper-2 p-3">
        <p className="text-xs font-semibold text-ink-3">return type</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setIsFixed(true)}
            className={`rounded-full border-2 px-2 py-1.5 text-sm font-semibold transition-all ${
              isFixed
                ? "border-ink bg-ink text-paper shadow-[2px_2px_0_rgba(43,38,29,0.2)]"
                : "border-transparent text-ink-2 hover:bg-white"
            }`}
          >
            Fixed return
          </button>
          <button
            type="button"
            onClick={() => setIsFixed(false)}
            className={`rounded-full border-2 px-2 py-1.5 text-sm font-semibold transition-all ${
              !isFixed
                ? "border-ink bg-ink text-paper shadow-[2px_2px_0_rgba(43,38,29,0.2)]"
                : "border-transparent text-ink-2 hover:bg-white"
            }`}
          >
            Variable return
          </button>
        </div>
        <p className="mt-2 text-xs text-ink-3">
          {isFixed
            ? "Fixed caps your return at the batch's fixed rate."
            : "Variable tracks the harvest, stepped down as the investor share declines."}
        </p>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-ink-2">cost</span>
        <span className="font-display text-3xl text-sage-2">
          {fmtUSDC(cost)} mUSDC
        </span>
      </div>
      <p className="text-xs text-ink-3">
        Every purchase funds the buyback reserve. 1 token = 1 mUSDC.
      </p>

      <AnimatePresence mode="wait">
        {step === "success" ? (
          <motion.div
            key="success"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="sketch-soft bg-sage-50 p-4 text-center"
          >
            <p className="text-3xl">🎉</p>
            <p className="font-display text-2xl text-sage-2">Purchase successful!</p>
            <p className="mt-1 font-display text-xl text-ink">
              <AnimatedCount value={countUp} /> {meta.tokenSymbol} minted
            </p>
            <a href="/portfolio" className="btn btn-sketch mt-3 !text-sm">
              See it in my Cropfolio
            </a>
          </motion.div>
        ) : !isConnected ? (
          <ConnectButton.Custom key="connect">
            {({ openConnectModal }) => (
              <button
                type="button"
                onClick={openConnectModal}
                className="btn btn-fill w-full"
              >
                Connect wallet to buy
              </button>
            )}
          </ConnectButton.Custom>
        ) : (
          <motion.div key="actions" className="flex flex-col gap-2">
            {step === "error" && (
              <p className="font-display text-sm text-tomato">{error}</p>
            )}
            <button
              type="button"
              onClick={handleBuy}
              disabled={tokens <= 0 || running}
              className="btn btn-fill w-full"
            >
              {running ? (
                step === "approving" ? "Approving…" : "Buying…"
              ) : needsApproval ? (
                "Approve & Buy"
              ) : (
                "Buy Tokens"
              )}
            </button>
            {running && (
              <p className="text-center text-xs text-ink-3">
                Confirm in your wallet, then it lands on-chain.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between text-xs text-ink-3">
        <span>USDC balance: {fmtUSDC(usdcBalance)}</span>
        <span>{fmtTokens(soldTokens)}/{fmtTokens(totalSupply)} sold</span>
      </div>
    </motion.div>
  );
}

function AnimatedCount({ value }: { value: number }) {
  return (
    <motion.span key={value} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }}>
      {value.toLocaleString("en-US")}
    </motion.span>
  );
}
