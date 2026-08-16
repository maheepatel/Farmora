import { defineChain } from "viem";
import deployed from "./deployed.json";

export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { decimals: 18, name: "MON", symbol: "MON" },
  rpcUrls: {
    default: { http: ["https://testnet-rpc.monad.xyz"] },
    public: { http: ["https://testnet-rpc.monad.xyz"] },
    monadinfra: { http: ["https://rpc-testnet.monadinfra.com"] },
    ankr: { http: ["https://rpc.ankr.com/monad_testnet"] },
    thirdweb: { http: ["https://10143.rpc.thirdweb.com"] },
  },
  blockExplorers: {
    default: { name: "Monadscan", url: "https://testnet.monadscan.com" },
  },
  testnet: true,
});

export const RPC_URLS = [
  "https://testnet-rpc.monad.xyz",
  "https://rpc-testnet.monadinfra.com",
  "https://rpc.ankr.com/monad_testnet",
  "https://10143.rpc.thirdweb.com",
];

export const CHAIN_ID = 10143;

export const ADMIN_ADDRESS = "0x1B8Cd7Ec63D6c725AE57AB6DbC6Ea90A10a90C32" as `0x${string}`;

export function isAdminAddress(address: `0x${string}` | undefined): boolean {
  return !!address && address.toLowerCase() === ADMIN_ADDRESS.toLowerCase();
}

export const CONTRACT_ADDRESSES = {
  mockUSDC: deployed.mockUSDC as `0x${string}`,
  factory: deployed.factory as `0x${string}`,
  stayBooking: deployed.stayBooking as `0x${string}`,
};

export const BATCH_ADDRESSES: Record<number, `0x${string}`> = Object.fromEntries(
  deployed.batches.map((a: string, i: number) => [i, a as `0x${string}`]),
);

export const STAY_PRICES: Record<number, number> = Object.fromEntries(
  deployed.stayPrices.map((p: number, i: number) => [i, p]),
);

export type BatchMeta = {
  id: number;
  cropType: string;
  tokenSymbol: string;
  tokenName: string;
  acres: number;
  totalSupply: number;
  tokensPerAcre: number;
  pricePerAcre: number;
  firstHarvest: string;
  harvestCycle: string;
  cropCycleYears: number;
  emoji: string;
  color: string;
  description: string;
};

export const BATCHES: BatchMeta[] = [
  {
    id: 0,
    cropType: "Saffron",
    tokenSymbol: "L-Saffron",
    tokenName: "LAND-Saffron",
    acres: 1,
    totalSupply: 40000,
    tokensPerAcre: 40000,
    pricePerAcre: 40000,
    firstHarvest: "Oct-Nov, Y1",
    harvestCycle: "Once a year",
    cropCycleYears: 1,
    emoji: "🌸",
    color: "#E2725B",
    description:
      "Indoor aeroponic saffron unit. Produces ~3 kg dried saffron per year - blooms Oct-Nov and sells for high value per kg. The highest value-per-acre crop on the farm.",
  },
  {
    id: 1,
    cropType: "Cordyceps",
    tokenSymbol: "L-Cordyceps",
    tokenName: "LAND-Cordyceps",
    acres: 1,
    totalSupply: 40000,
    tokensPerAcre: 40000,
    pricePerAcre: 40000,
    firstHarvest: "Month 2",
    harvestCycle: "4-6 crops/yr",
    cropCycleYears: 1,
    emoji: "🍄",
    color: "#B07AA6",
    description:
      "Clean-room Cordyceps militaris unit. 4-6-week spawn batches, high-value dried yield per year. Needs sterile growing rooms.",
  },
  {
    id: 2,
    cropType: "Mushroom",
    tokenSymbol: "L-Mushroom",
    tokenName: "LAND-Mushroom",
    acres: 1,
    totalSupply: 25000,
    tokensPerAcre: 25000,
    pricePerAcre: 25000,
    firstHarvest: "Month 1",
    harvestCycle: "5-6 crops/yr",
    cropCycleYears: 1,
    emoji: "🍄",
    color: "#87A96B",
    description:
      "Indoor mushroom sheds: Oyster and Milky varieties. The fastest cash-flow crop on the farm.",
  },
  {
    id: 3,
    cropType: "Dragon Fruit",
    tokenSymbol: "L-Dragon Fruit",
    tokenName: "LAND-Dragon Fruit",
    acres: 2,
    totalSupply: 30000,
    tokensPerAcre: 15000,
    pricePerAcre: 15000,
    firstHarvest: "Year 2",
    harvestCycle: "2-3 flushes/yr",
    cropCycleYears: 2,
    emoji: "🐉",
    color: "#E2725B",
    description:
      "Trellis-grown dragon fruit. First flowers at 16-20 months, then multiple flushes per year.",
  },
  {
    id: 4,
    cropType: "Pomegranate",
    tokenSymbol: "L-Pomegranate",
    tokenName: "LAND-Pomegranate",
    acres: 5,
    totalSupply: 60000,
    tokensPerAcre: 12000,
    pricePerAcre: 12000,
    firstHarvest: "Year 3",
    harvestCycle: "Annual",
    cropCycleYears: 3,
    emoji: "🍎",
    color: "#E2725B",
    description:
      "Bhagwa pomegranate orchard. Export-grade fruit fetches a premium by year 5.",
  },
  {
    id: 5,
    cropType: "Grapes",
    tokenSymbol: "L-Grapes",
    tokenName: "LAND-Grapes",
    acres: 5,
    totalSupply: 100000,
    tokensPerAcre: 20000,
    pricePerAcre: 20000,
    firstHarvest: "Year 3",
    harvestCycle: "Annual",
    cropCycleYears: 3,
    emoji: "🍇",
    color: "#A98BC0",
    description:
      "Thompson table grape vineyard. Export-grade bunches command a premium price.",
  },
  {
    id: 6,
    cropType: "Turmeric",
    tokenSymbol: "L-Turmeric",
    tokenName: "LAND-Turmeric",
    acres: 5,
    totalSupply: 40000,
    tokensPerAcre: 8000,
    pricePerAcre: 8000,
    firstHarvest: "Month 9",
    harvestCycle: "1 crop/yr",
    cropCycleYears: 1,
    emoji: "🌾",
    color: "#F2C14E",
    description:
      "Turmeric field with a high cured-yield per acre and a strong profit margin.",
  },
  {
    id: 7,
    cropType: "Ginger",
    tokenSymbol: "L-Ginger",
    tokenName: "LAND-Ginger",
    acres: 5,
    totalSupply: 50000,
    tokensPerAcre: 10000,
    pricePerAcre: 10000,
    firstHarvest: "Month 9",
    harvestCycle: "1 crop/yr",
    cropCycleYears: 1,
    emoji: "🫚",
    color: "#8DBDD8",
    description:
      "Ginger field. Prices spike during off-season demand, adding upside to the base crop.",
  },
];

export function getBatchMeta(id: number): BatchMeta {
  return BATCHES[id] ?? BATCHES[0];
}

export function formatAddress(a: `0x${string}` | undefined): string {
  if (!a) return "Not deployed";
  return `${a.slice(0, 6)}...${a.slice(-4)}`;
}
