"use client";

import { useCallback, useState } from "react";
import { Check, Plus } from "lucide-react";
import type { RegistryToken } from "@/lib/tokens";

type AddState = "idle" | "adding" | "done" | "copied" | "unsupported";

function getInjectedProvider():
  | { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> }
  | undefined {
  if (typeof window === "undefined") return undefined;
  const eth = (window as unknown as { ethereum?: { request?: (args: unknown) => Promise<unknown> } })
    .ethereum;
  if (eth && typeof eth.request === "function") {
    return eth as unknown as {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
  return undefined;
}

export function AddTokenButton({ token }: { token: RegistryToken }) {
  const [state, setState] = useState<AddState>("idle");

  const reset = useCallback(() => {
    window.setTimeout(() => setState("idle"), 2000);
  }, []);

  const add = useCallback(async () => {
    if (!token.address || token.kind === "factory") return;
    const address = token.address;
    const provider = getInjectedProvider();
    const fallbackCopy = async () => {
      try {
        await navigator.clipboard.writeText(address);
      } catch {
        // ignore clipboard failure; the registry row still shows the address
      }
      setState("copied");
      reset();
    };

    if (!provider) {
      await fallbackCopy();
      return;
    }

    setState("adding");
    try {
      const ok = (await provider.request({
        method: "wallet_watchAsset",
        params: [
          {
            type: "ERC20",
            options: {
              address,
              symbol: token.symbol,
              decimals: token.decimals,
              image: "",
            },
          },
        ],
      })) as boolean;
      setState(ok ? "done" : "unsupported");
    } catch {
      setState("unsupported");
    }
    reset();
  }, [token, reset]);

  const label = {
    idle: "Add to wallet",
    adding: "Waiting on wallet…",
    done: "Added",
    copied: "Address copied",
    unsupported: "Copied",
  }[state];

  const stateClass = {
    idle: "sticker-btn-outline",
    adding: "sticker-btn-outline opacity-60",
    done: "sticker-btn-amber",
    copied: "sticker-btn-amber",
    unsupported: "sticker-btn-outline opacity-60",
  }[state];

  const Icon =
    state === "done" || state === "copied" || state === "unsupported" ? Check : Plus;

  return (
    <button
      type="button"
      onClick={add}
      className={`sticker-btn inline-flex items-center gap-1.5 whitespace-nowrap !rounded-full !px-4 !py-2 !text-xs ${stateClass}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
