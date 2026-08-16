# AcreLedger — PRD for Person B: Frontend / Web App (Monad Testnet)

> **Role:** Person B builds the entire web app in `frontend/`: Next.js 16 + Tailwind v4 + RainbowKit + wagmi/viem, wired to Monad Testnet contracts.
> **Chain:** Monad Testnet — chain ID `10143`, native token `MON` (gas only), explorer `testnet.monadscan.com`, RPC `https://testnet-rpc.monad.xyz`, faucet `https://faucet.monad.xyz`.
> **Self-sufficient:** everything in this file is enough for an AI agent to build your part perfectly.
> **Parallel partner:** Person A (contracts) hands you `contracts/deployed.json` + ABIs — see §3 and §10. You never edit contracts.
> **Design is deferred:** function-first, minimal clean styling. Pixel design is a later phase.

---

## 1. What You Deliver

1. A working Next.js 16 App Router app at `frontend/` with 7 pages:
   `/`, `/marketplace`, `/batch/[id]`, `/portfolio`, `/admin`, `/stays`, `/add-tokens`.
2. Wallet connect (RainbowKit + wagmi) on **Monad Testnet (10143)**.
3. All reads live from contract storage; all writes are wallet-signed transactions.
4. `config.ts` that reads Person A's `deployed.json` (structure below).
5. `npm run build` + `npm run lint` clean; e2e suite (owned by A) passes against your pages.

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) — **READ `node_modules/next/dist/docs/` FIRST; this version has breaking changes vs older Next** |
| Styling | Tailwind v4 (`@tailwindcss/postcss`), `tailwindcss`, `postcss.config.mjs` |
| UI primitives | Base UI (`@base-ui/react`), shadcn-style `components.json`, `clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react` |
| Wallet/data | `@rainbow-me/rainbowkit`, `wagmi`, `viem`, `@tanstack/react-query` |
| Animation | `tw-animate-css` |
| Dev deps | `typescript`, `eslint` + `eslint-config-next`, `puppeteer-core` (for the e2e harness A runs) |

Scaffold: `npx create-next-app@latest` (TypeScript, App Router, Tailwind, ESLint), then add the deps above.

## 3. Chain Config — `frontend/src/lib/config.ts`

```ts
import { defineChain } from "viem";
import deployed from "../../../contracts/deployed.json"; // Person A's handoff

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
  blockExplorers: { default: { name: "Monadscan", url: "https://testnet.monadscan.com" } },
  testnet: true,
});

export const RPC_URLS = [
  "https://testnet-rpc.monad.xyz",
  "https://rpc-testnet.monadinfra.com",
  "https://rpc.ankr.com/monad_testnet",
  "https://10143.rpc.thirdweb.com",
];

export const CONTRACT_ADDRESSES = {
  mockUSDC: deployed.mockUSDC as `0x${string}`,
  factory: deployed.factory as `0x${string}`,
  stayBooking: deployed.stayBooking as `0x${string}`,
};

export const BATCH_ADDRESSES: Record<number, `0x${string}`> = Object.fromEntries(
  deployed.batches.map((a: string, i: number) => [i, a as `0x${string}`])
);

export const STAY_PRICES: Record<number, number> = Object.fromEntries(
  deployed.stayPrices.map((p: number, i: number) => [i, p])
);
```

If `deployed.json` is missing during development, fall back to a local Hardhat node deployment with the same schema (Person A can share it).

### Seed batch metadata (display) — also in `config.ts`

| id | cropType | acres | totalSupply | tokensPerAcre | pricePerAcre | firstHarvest | harvestCycle | cropCycleYears | description |
|---:|----------|------:|------------:|--------------:|-------------:|--------------|--------------|---------------:|-------------|
| 0 | Saffron | 1 | 40000 | 40000 | $40,000 | Oct–Nov, Y1 | Once a year | 1 | Indoor aeroponic saffron unit (1 acre). Produces ~3 kg dried saffron per year — blooms Oct–Nov and sells for ₹2.5–3.5L/kg. Highest value-per-acre crop on the farm. |
| 1 | Cordyceps | 1 | 40000 | 40000 | $40,000 | Month 2 | 4–6 crops/yr | 1 | Clean-room Cordyceps militaris unit (1 acre). 4–6-week spawn batches, ~100 kg dried per year at $200–400/kg wholesale. High-value crop needing sterile growing rooms. |
| 2 | Mushroom | 1 | 25000 | 25000 | $25,000 | Month 1 | 5–6 crops/yr | 1 | Indoor mushroom sheds (1 acre): Oyster and Milky varieties. ~10,000 kg fresh per year at ₹100–200/kg. Fastest cash-flow crop on the farm. |
| 3 | Dragon Fruit | 2 | 30000 | 15000 | $15,000 | Year 2 | 2–3 flushes/yr | 2 | Trellis-grown dragon fruit (2 acres). ~8 t/acre at ₹90–100/kg once mature. First flowers at 16–20 months. |
| 4 | Pomegranate | 5 | 60000 | 12000 | $12,000 | Year 3 | Annual | 3 | Bhagwa pomegranate orchard (5 acres). 4–7 t/acre by year 5 at ₹60–80/kg; export-grade fruit fetches a premium. |
| 5 | Grapes | 5 | 100000 | 20000 | $20,000 | Year 3 | Annual | 3 | Thompson table grape vineyard (5 acres). 8–12 t/acre at ₹50–70/kg; export-grade bunches at $1.5–1.7/kg. |
| 6 | Turmeric | 5 | 40000 | 8000 | $8,000 | Month 9 | 1 crop/yr | 1 | Turmeric field (5 acres). 8–12 t fresh → ~2,000 kg cured/acre at ₹80–100/kg; ~77% profit margin. |
| 7 | Ginger | 5 | 50000 | 10000 | $10,000 | Month 9 | 1 crop/yr | 1 | Ginger field (5 acres). 8–12 t/acre at ₹35–60/kg fresh; prices spike during off-season demand. |

Each batch: `pricePerToken = 1` mUSDC, token symbol `L-<cropType>`, name `LAND-<cropType>`.

## 4. Contract ABIs & Call Surface

Import the ABIs Person A hands you into `frontend/src/lib/abi/{LandBatch,LandBatchFactory,MockUSDC,StayBooking}.json` (exact JSON from Hardhat artifacts). Full surface:

**MockUSDC** — `faucet()`, `mint(address,uint256)`, `balanceOf`, `approve`, `transferFrom`, `FAUCET_AMOUNT()` (50,000 mUSDC), `hasClaimed(address)`.

**LandBatch** —
- Writes: `buyTokens(uint256,bool)`, `requestSell(uint256)`, `executeSell()`, `claimRevenue()`, `distributeRevenue(uint256)` [farmer/admin], `advanceYear()` [admin], `setGrowthStage(uint8)` [admin], `createMilestone(string,uint256,uint256,uint256)` [admin], `claimMilestone(uint256)` [farmer/admin], `uploadClip(string)` [farmer/admin], `setFarmer(address)` [admin].
- Reads: `getAvailableTokens()`, `getCurrentInvestorShare()`, `getInvestorInfo(address)` → `{isFixedReturn, totalInvested, claimedRevenue, pendingRevenue}`, `getSellRequest(address)` → `{tokenAmount, requestTime, active}`, `getMilestones()` → `[{name, amount, startDay, endDay, claimed}]`, `getClips()` → `[{url, timestamp}]`, `stageForYear(uint256)`, plus public state: `investorShareBps`, `buybackReserve`, `currentYear`, `growthStage` (0–4), `cropNumber`, `cropCycleYears`, `plantingDate`, `totalRevenueDistributed`, `soldTokens`, `lockedTokens`, `investors`, `pricePerToken`, `fixedReturnBps`, `totalAcres`, `cropType`, `farmer`, `admin`.
- GrowthStage enum: 0 Seedling, 1 Vegetative, 2 Flowering, 3 Fruiting, 4 HarvestReady.

**LandBatchFactory** — `createBatch(farmer,cropType,acres,pricePerToken,totalSupply,fixedReturnBps,cropCycleYears)` [admin], `getBatchCount()`, `getBatches()`.

**StayBooking** — `bookStay(uint256 batchId,uint256 day,uint256 nights,uint256 guests)` (day = unix day number UTC; nights ≤ 7; guests ≤ 8; each night must be free or the tx reverts), `cancelStay(uint256,uint256)` (full refund), `setPricePerNight(uint256,uint256)` [owner], reads: `isBooked(batchId,day)`, `getStay(batchId,day)`, `getUserBookings(address)` → `[{batchId, day}]`, `pricePerNight(batchId)`.

Day conversion: `day = BigInt(Math.floor(Date.UTC(y,m-1,d)/86400000))`; display back via `new Date(Number(day)*86400000).toISOString().slice(0,10)`.

## 5. Wallet Integration

- RainbowKit + wagmi, configured with **only** the Monad Testnet chain (auto-switches wallets to 10143).
- The connected wallet is both farmer and admin for the seed batches (roles set at factory creation). Admin page requires a connected wallet; gate admin actions by address (admin = the deployer wallet from `contracts/.env` — display it in the UI as the operator).
- **No login**: authentication is wallet connection only.
- mUSDC funding UX: a faucet button on pages that need funds → calls `faucet()` (one-time 50K). Guide visitors to `https://faucet.monad.xyz` for test MON gas.

## 6. Live Data Layer

- On mount + every 30s, read all batches: `getAvailableTokens()`, `getCurrentInvestorShare()`, `getInvestorInfo(wallet)`, `getSellRequest(wallet)`, `getMilestones()`, `getClips()`, `growthStage`, `currentYear`, `buybackReserve`, `soldTokens`.
- **Three-state reads:** each value renders as **live** (read succeeded), **noAddress** ("Not deployed" when a batch address is missing), or **unavailable** (RPC read failed — show a muted "unavailable" state, keep the rest of the page usable).
- Read failures must never crash a page.

## 7. Pages — Functional Spec

> Each page must render the **exact UI strings** noted in **bold** — the e2e harness asserts them.

### 7.1 `/` — Landing
- Hero with farm artwork (placeholder graphic OK) + a live ledger panel showing the supply-weighted investor share (label "**The farm is real**" somewhere above the fold).
- A harvests section titled "**The harvests, as they stand now**".
- Two primary actions: **Invest** (→ /marketplace) and **Stay** (→ /stays).
- Stats strip: live supply-weighted investor share %, total acres, live parcels count.
- The economics model as 4 numbered steps: 70% → 0% over 14 years, −5 pts/yr, 90-day cooldown, +1%/yr appreciation paid from the 10% buyback reserve.
- A stay band with the line "**Own the land. Sleep on it.**" (used by wallet-off check).
- Token registry preview linking to /add-tokens.
- Must render fully **wallet-off** (no injected provider) with live data.

### 7.2 `/marketplace` — Marketplace
- Heading "**Farm Marketplace**".
- Cards for all 8 batches: crop name, acres, price/acre, total value, first harvest, live available tokens + tokens sold, current investor share, buy button → `/batch/[id]`.

### 7.3 `/batch/[id]` — Batch Detail
- Crop name as heading (e.g. "**Saffron**"), live badges (stage, live/not-deployed/unavailable).
- Live panels: growth stage + year progress (advanceYear-aware), investor share slide (70% → 0%), tokens sold / available, buyback reserve.
- **Return estimator** — a table with columns **2023, 2024, 2025, 2026**, a row labeled "**4-yr total**", and a line "**estimated next year**". Values are estimates from crop economics (price/acre × realistic yield × share); the math may be a documented simplification — the **labels must match exactly**.
- **Buy card:** acres input (placeholder `1`), computes tokens + mUSDC cost (1 token = 1 mUSDC) + 10% buyback note, a fixed/variable return toggle (fixed caps return at `fixedReturnBps`), and a buy button labeled "**Approve & Buy**" (falls back to "**Buy Tokens**") that: approves mUSDC if needed, then calls `buyTokens(amount, isFixed)`. On success show "**Purchase successful!**" with a count-up of tokens minted. (Confetti/coin rain animation optional — deferred design phase.)
- Clips tab: list `getClips()` URLs + timestamps. Stays tab: per-night price + link to /stays.

### 7.4 `/portfolio` — Portfolio
- Heading "**Cropfolio**".
- Per-batch holdings cards: tokens held, invested mUSDC, claimed revenue, **Pending Revenue** (label must appear), claim button matching `Claim <amount> mUSDC` (e.g. "Claim 1,234 mUSDC"). On success show "**Revenue claimed!**".
- Sell flow: **Request Sell** (locks tokens, starts 90-day cooldown, shows countdown from `getSellRequest().requestTime`), then **Execute Sell** once cooldown passed (pays principal + 1%/yr appreciation from buyback reserve). On success show "Tokens sold!".
- Sell-terms notice strip: 90-day cooldown, +1%/yr appreciation, no harvest after exit, −5 pts/yr slide on mid-stream sale.

### 7.5 `/admin` — Farm Ops
- Heading "**Farm Ops**", with "**Tokens Sold**" summary shown for the selected batch.
- Batch selector across all 8 batches.
- Time controls: Advance Year (calls `advanceYear()`), Set Growth Stage (0–4), Advance by days (local display only — the contract's cooldown uses real block time; no on-chain day-travel exists beyond year advance).
- Harvest / revenue: input with placeholder "**Revenue (mUSDC)**" + button "**Distribute Revenue**". Flow: step 1 approve mUSDC (UI shows "Step 1/2"), step 2 the distribute tx (UI shows "**Step 2/2**" while pending), then "**Done.**" on success.
- Milestones: list, create (name, amount, startDay, endDay), claim within window.
- Clips: upload (IPFS/Pinata URL input) → `uploadClip(url)`.
- Create batch: form → `factory.createBatch(...)` (admin only), then reload config.

### 7.6 `/stays` — Farm Stays
- Heading "**Farm Stays**".
- Cards per batch: farmstead, price per night, per-batch **Check availability** button.
- Booking modal: date input `input[type="date"]`, nights (1–7), guests (1–8). On date select, query `isBooked` per night; if free the confirm button reads "**Confirm booking**", if taken it reads "**Pick another date**".
- Confirm → `bookStay(batchId, day, nights, guests)`. On success show "**Stay booked on-chain!**" inside the modal, with a "**Done**" button to close.
- "My stays" list from `getUserBookings(wallet)` → per stay: crop, check-in date, nights, price, Cancel (→ `cancelStay`, full refund message).

### 7.7 `/add-tokens` — Token Registry
- Heading containing "**token registry**".
- Lists **mUSDC** and every `LAND-<crop>` batch token + the factory, for chain 10143, labeled "**Monad Testnet**".
- One-tap `wallet_watchAsset` per token (triggered only by click); fallback to copy-address when no injected provider.

## 8. UX / Error Handling

- Every write: optimistic button states (pending/disabled), on-chain revert messages surfaced readably, success message per flow (§7 strings).
- Wallet-off: all read pages fully browsable; write actions prompt connect.
- No images required: simple CSS/SVG placeholders for crops are fine (design phase later).

## 9. Development Workflow

1. `cd frontend && npm install && npm run dev` → http://localhost:3000.
2. Test against Person A's Monad Testnet deployment once `contracts/deployed.json` exists. Until then, A can share a local Hardhat-node deployment with the same schema.
3. Fund test wallet: mUSDC via on-page faucet button; MON gas via `https://faucet.monad.xyz`.
4. `npm run build` and `npm run lint` must pass.
5. Run A's e2e: `node tests/e2e.mjs` (dev server running; A's scripted wallet).

## 10. Interface Contract with Person A

1. You read `contracts/deployed.json` (never hand-edit addresses). Schema:
   `{ chainId: 10143, chainName, mockUSDC, factory, stayBooking, batches: [8 addresses], stayPrices: [8 prices] }`.
2. A gives you the 4 ABI JSON files — copy into `frontend/src/lib/abi/`. Do not rename functions.
3. **You must render these exact strings** (A's e2e asserts them):
   - Landing: "The farm is real", "The harvests, as they stand now", "Own the land. Sleep on it."
   - Marketplace: "Farm Marketplace", crop names incl. "Saffron"
   - Portfolio: "Cropfolio", "Pending Revenue", claim button `Claim <amount> mUSDC`, success "Revenue claimed!"
   - Batch detail: crop name, "return estimator", years "2023".."2026", "4-yr total", "estimated next year"; buy input placeholder `1`, buttons "Approve & Buy"/"Buy Tokens", success "Purchase successful!"
   - Admin: "Farm Ops", "Tokens Sold", revenue placeholder "Revenue (mUSDC)", button "Distribute Revenue", progress "Step 2/2", success "Done."
   - Stays: "Farm Stays", "Check availability", date input, "Confirm booking"/"Pick another date", success "Stay booked on-chain!", "Done"
   - Add-tokens: "token registry", "mUSDC", "Monad Testnet"
4. You never edit `contracts/`.

## 11. Acceptance Criteria (done = all true)

- [ ] `npm run build` clean; `npm run lint` clean.
- [ ] All 7 pages render on Monad Testnet with live contract data (3-state reads working).
- [ ] Wallet connects; RainbowKit shows Monad Testnet 10143.
- [ ] Buy (fixed + variable) → "Purchase successful!"; tokens appear in portfolio.
- [ ] Portfolio shows Pending Revenue; claim works → "Revenue claimed!".
- [ ] Request Sell → cooldown countdown → Execute Sell works (verify via admin Advance Year + time).
- [ ] Admin: Advance Year, Distribute Revenue ("Step 2/2" → "Done."), milestones CRUD, clip upload, create batch all functional.
- [ ] Stays: availability check, book → "Stay booked on-chain!", My stays, cancel → refund.
- [ ] `/add-tokens` shows Monad Testnet + all tokens; watch-asset one-tap.
- [ ] Wallet-off browsing works on landing/marketplace.
- [ ] Person A's e2e suite reports **ALL TESTS PASSED** against your pages.
- [ ] No ARC Testnet references remain in `frontend/src/`.
