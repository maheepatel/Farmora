import type { RegistryToken } from "@/lib/tokens";
import { AddTokenButton } from "./add-token-button";
import { CopyAddress } from "../site/copy-address";

function shortAddress(address: string | undefined): string {
  if (!address) return "—";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function TokenLine({ token }: { token: RegistryToken }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-ink-100 px-4 py-4 sm:px-6">
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-heading text-base font-bold text-emerald-700">{token.symbol}</span>
        <span className="truncate text-sm font-semibold text-zinc-700">{token.name}</span>
        <span className="hidden text-xs font-semibold text-zinc-500 md:inline tabular">{shortAddress(token.address)}</span>
      </div>
      <div className="flex items-center gap-4">
        {token.address && <CopyAddress address={token.address} className="hidden sm:inline-flex" />}
        {token.kind !== "factory" && <AddTokenButton token={token} />}
      </div>
    </div>
  );
}
