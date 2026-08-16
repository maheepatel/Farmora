import type { RegistryToken } from "@/lib/tokens";
import { AddTokenButton } from "./add-token-button";
import { CopyAddress } from "../site/copy-address";

const kindLabel: Record<RegistryToken["kind"], string> = {
  mUSDC: "Fungible · 18 decimals",
  LAND: "Parcel token · 18 decimals",
  factory: "Deployer contract",
};

export function TokenRow({ token }: { token: RegistryToken }) {
  return (
    <div className="grid items-center gap-3 border-b-2 border-ink-100 px-4 py-5 sm:px-6 md:grid-cols-[1.4fr_1.8fr_auto] md:gap-6">
      <div>
        <div className="flex flex-wrap items-baseline gap-2.5">
          <span className="font-heading text-base font-bold text-emerald-700">{token.symbol}</span>
          {token.kind === "LAND" && token.batchId !== undefined && (
            <span className="text-xs font-semibold text-zinc-500 tabular">Batch {token.batchId}</span>
          )}
          <span className="font-heading text-base font-bold text-ink-900">{token.name}</span>
        </div>
        <p className="mt-0.5 text-xs font-semibold text-zinc-500">{kindLabel[token.kind]}</p>
      </div>
      <div className="flex min-w-0 flex-col items-start gap-2">
        {token.address ? (
          <>
            <code className="truncate text-xs font-semibold text-zinc-600 tabular">{token.address}</code>
            <CopyAddress address={token.address} label="Copy address" />
          </>
        ) : (
          <span className="text-xs font-semibold text-zinc-500">Address pending</span>
        )}
      </div>
      <div className="flex justify-start md:justify-end">
        {token.kind === "factory" ? (
          <span className="text-xs font-semibold text-zinc-500">Copy only · not a token</span>
        ) : (
          <AddTokenButton token={token} />
        )}
      </div>
    </div>
  );
}
