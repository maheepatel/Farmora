import { CONTRACT_ADDRESSES, LAND_BATCHES, getBatchAddress } from "./config";

export type TokenKind = "mUSDC" | "LAND" | "factory";

export interface RegistryToken {
  symbol: string;
  name: string;
  kind: TokenKind;
  address: `0x${string}` | undefined;
  decimals: number;
  batchId?: number;
}

export const TOKEN_REGISTRY: RegistryToken[] = [
  {
    symbol: "mUSDC",
    name: "Mock USDC",
    kind: "mUSDC",
    address: CONTRACT_ADDRESSES.mockUSDC,
    decimals: 18,
  },
  ...LAND_BATCHES.map((batch) => ({
    symbol: "LAND",
    name: `LAND — ${batch.cropType}`,
    kind: "LAND" as const,
    address: getBatchAddress(batch),
    decimals: 18,
    batchId: batch.id,
  })),
  {
    symbol: "FACTORY",
    name: "Parcel Factory",
    kind: "factory",
    address: CONTRACT_ADDRESSES.factory,
    decimals: 0,
  },
];

export const CHAIN_INFO = {
  name: "Monad Testnet",
  id: 10143,
  explorer: "https://testnet.monadscan.com",
  rpc: "https://testnet-rpc.monad.xyz",
};
