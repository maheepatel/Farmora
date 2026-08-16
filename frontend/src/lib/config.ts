import { defineChain } from "viem";

export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Monad",
    symbol: "MON",
  },
  rpcUrls: {
    default: { http: ["https://testnet-rpc.monad.xyz"] },
    public: { http: ["https://testnet-rpc.monad.xyz"] },
  },
  blockExplorers: {
    default: { name: "MonadScan", url: "https://testnet.monadscan.com" },
  },
  testnet: true,
});

export const RPC_URLS = ["https://testnet-rpc.monad.xyz"];

export const ADMIN_ADDRESS = "0x1B8Cd7Ec63D6c725AE57AB6DbC6Ea90A10a90C32" as `0x${string}`;

export function isAdminAddress(address: `0x${string}` | undefined): boolean {
  return !!address && address.toLowerCase() === ADMIN_ADDRESS.toLowerCase();
}

export const CONTRACT_ADDRESSES = {
  mockUSDC: "0x32d31E354C777775DA3090A80427f4CAD5F5bef8" as `0x${string}`,
  factory: "0x455dcBc5fafE62295CbA867eEc31491244fFA6a6" as `0x${string}`,
  stayBooking: "0x7176d465483Fc6a2A571D9389C4ffee84BA3B446" as `0x${string}`,
};

export const BATCH_ADDRESSES: Record<number, `0x${string}`> = {
  0: "0x3D5008f631E3276EB8F79869808e24001Ac35a6A",
  1: "0x450CA1d0eB6849A939f5506b108596E62F01779C",
  2: "0x4F95b8e426af49f75e16486fE0e4936Af096A01E",
  3: "0x19E9518EC7a8CE09E4e205B2Fd4C58b0A221F46D",
  4: "0x820b3e38137695c54D453e2a54108C597585EBC2",
  5: "0x8fF38de96E55F57928e52B831100836B6A017382",
  6: "0x39226Bcdfc7DebB1E8627F3A5c8D3a0a668AA37c",
  7: "0x80F955164203a59b1fd036a2FC46Eef6a444ED31",
};

export const STAY_PRICES: Record<number, number> = {
  0: 350,
  1: 300,
  2: 180,
  3: 300,
  4: 250,
  5: 320,
  6: 150,
  7: 150,
};

export const LAND_BATCHES = [
  {
    id: 0,
    cropType: "Saffron",
    acres: 1,
    pricePerToken: "1",
    totalSupply: "40000",
    tokensPerAcre: "40000",
    pricePerAcre: "$40,000",
    totalValue: "$40,000",
    firstHarvest: "Oct–Nov, Year 1",
    harvestCycle: "Once a year",
    cropCycleYears: 1,
    description: "Indoor aeroponic saffron unit (1 acre). Produces ~3 kg dried saffron per year — blooms Oct–Nov and sells for ₹2.5–3.5L/kg. The highest value-per-acre crop on the farm.",
    image: "/crops/unknown.jpg",
    color: "from-violet-500/20 to-purple-500/20",
    borderColor: "border-purple-500/30",
  },
  {
    id: 1,
    cropType: "Cordyceps",
    acres: 1,
    pricePerToken: "1",
    totalSupply: "40000",
    tokensPerAcre: "40000",
    pricePerAcre: "$40,000",
    totalValue: "$40,000",
    firstHarvest: "Month 2",
    harvestCycle: "4–6 crops/yr",
    cropCycleYears: 1,
    description: "Clean-room Cordyceps militaris unit (1 acre). 4–6-week spawn batches, ~100 kg dried per year at $200–400/kg wholesale. High-value crop that needs sterile growing rooms.",
    image: "/crops/unknown.jpg",
    color: "from-orange-500/20 to-amber-500/20",
    borderColor: "border-orange-500/30",
  },
  {
    id: 2,
    cropType: "Mushroom",
    acres: 1,
    pricePerToken: "1",
    totalSupply: "25000",
    tokensPerAcre: "25000",
    pricePerAcre: "$25,000",
    totalValue: "$25,000",
    firstHarvest: "Month 1",
    harvestCycle: "5–6 crops/yr",
    cropCycleYears: 1,
    description: "Indoor mushroom sheds (1 acre) growing Oyster and Milky varieties. ~10,000 kg fresh per year at ₹100–200/kg. 5–6 harvest cycles a year — the fastest cash-flow crop on the farm.",
    image: "/crops/unknown.jpg",
    color: "from-stone-500/20 to-neutral-500/20",
    borderColor: "border-stone-500/30",
  },
  {
    id: 3,
    cropType: "Dragon Fruit",
    acres: 2,
    pricePerToken: "1",
    totalSupply: "30000",
    tokensPerAcre: "15000",
    pricePerAcre: "$15,000",
    totalValue: "$30,000",
    firstHarvest: "Year 2",
    harvestCycle: "2–3 flushes/yr",
    cropCycleYears: 2,
    description: "Trellis-grown dragon fruit (2 acres). ~8 t per acre at ₹90–100/kg once mature. First flowers at 16–20 months, full production by year 3–4.",
    image: "/crops/unknown.jpg",
    color: "from-pink-500/20 to-fuchsia-500/20",
    borderColor: "border-pink-500/30",
  },
  {
    id: 4,
    cropType: "Pomegranate",
    acres: 5,
    pricePerToken: "1",
    totalSupply: "60000",
    tokensPerAcre: "12000",
    pricePerAcre: "$12,000",
    totalValue: "$60,000",
    firstHarvest: "Year 3",
    harvestCycle: "Annual",
    cropCycleYears: 3,
    description: "Bhagwa pomegranate orchard (5 acres). 4–7 t per acre by year 5 at ₹60–80/kg; export-grade fruit fetches a premium. Year-round export demand.",
    image: "/crops/unknown.jpg",
    color: "from-red-500/20 to-rose-500/20",
    borderColor: "border-red-500/30",
  },
  {
    id: 5,
    cropType: "Grapes",
    acres: 5,
    pricePerToken: "1",
    totalSupply: "100000",
    tokensPerAcre: "20000",
    pricePerAcre: "$20,000",
    totalValue: "$100,000",
    firstHarvest: "Year 3",
    harvestCycle: "Annual",
    cropCycleYears: 3,
    description: "Thompson table grape vineyard (5 acres). 8–12 t per acre at ₹50–70/kg; export-grade bunches sell at $1.5–1.7/kg. Strong fresh-export and winery demand.",
    image: "/crops/unknown.jpg",
    color: "from-purple-500/20 to-violet-500/20",
    borderColor: "border-purple-500/30",
  },
  {
    id: 6,
    cropType: "Turmeric",
    acres: 5,
    pricePerToken: "1",
    totalSupply: "40000",
    tokensPerAcre: "8000",
    pricePerAcre: "$8,000",
    totalValue: "$40,000",
    firstHarvest: "Month 9",
    harvestCycle: "1 crop/yr",
    cropCycleYears: 1,
    description: "Turmeric field (5 acres). 8–12 t fresh → ~2,000 kg cured per acre at ₹80–100/kg. 8–9-month cycle with a ~77% profit margin. One crop per year.",
    image: "/crops/unknown.jpg",
    color: "from-yellow-500/20 to-amber-500/20",
    borderColor: "border-yellow-500/30",
  },
  {
    id: 7,
    cropType: "Ginger",
    acres: 5,
    pricePerToken: "1",
    totalSupply: "50000",
    tokensPerAcre: "10000",
    pricePerAcre: "$10,000",
    totalValue: "$50,000",
    firstHarvest: "Month 9",
    harvestCycle: "1 crop/yr",
    cropCycleYears: 1,
    description: "Ginger field (5 acres). 8–12 t per acre at ₹35–60/kg fresh. 8–10-month cycle; prices spike during off-season demand. One crop per year.",
    image: "/crops/unknown.jpg",
    color: "from-amber-500/20 to-orange-500/20",
    borderColor: "border-amber-500/30",
  },
];

export type LandBatch = (typeof LAND_BATCHES)[number] & { address?: `0x${string}` };

const CREATED_BATCHES_KEY = "farmland.createdBatches";

export function getCreatedBatches(): LandBatch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CREATED_BATCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as LandBatch[];
  } catch {
    return [];
  }
}

export function saveCreatedBatch(batch: LandBatch): LandBatch[] {
  const next = [...getCreatedBatches(), batch];
  try {
    window.localStorage.setItem(CREATED_BATCHES_KEY, JSON.stringify(next));
  } catch {
    // ignore storage failures (e.g. private mode)
  }
  return next;
}

export function allBatches(): LandBatch[] {
  return [...LAND_BATCHES, ...getCreatedBatches()];
}

export function getBatchById(id: number): LandBatch | undefined {
  return allBatches().find((b) => b.id === id);
}

export function getBatchAddress(batch: LandBatch): `0x${string}` | undefined {
  return batch.address ?? BATCH_ADDRESSES[batch.id];
}

export function dateToDayNumber(isoDate: string): bigint {
  const [y, m, d] = isoDate.split("-").map(Number);
  const utcMs = Date.UTC(y, m - 1, d);
  return BigInt(Math.floor(utcMs / 86_400_000));
}

export function dayNumberToISO(day: bigint | number): string {
  const utcMs = Number(day) * 86_400_000;
  return new Date(utcMs).toISOString().slice(0, 10);
}

export function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}
