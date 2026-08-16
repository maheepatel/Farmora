# Farmora (AcreLedger)

> **Real farmland, fractionalised on-chain.** Buy tokens in a crop parcel, earn a share
> of every harvest, and watch the farmer's share grow year after year — every number on
> screen read live from contract storage, never a database.

**Monad Testnet (chain 10143)** · Next.js 16 · Solidity · wagmi + viem + RainbowKit

<!-- Add these once you have them:
[**Live demo →**](https://your-app.vercel.app)  ·  [**Demo video →**](https://...)
-->

---

## Table of contents

- [What this is](#what-this-is)
- [How the money works](#how-the-money-works)
- [Run the frontend](#run-the-frontend)
- [Run the contracts](#run-the-contracts)
- [Set up your wallet](#set-up-your-wallet)
- [Project layout](#project-layout)
- [Deployed contracts](#deployed-contracts)
- [Deploying](#deploying)
- [Project status](#project-status)
- [Team](#team)

---

## What this is

Farmland is one of the oldest, steadiest asset classes on earth, and almost nobody can
buy any. Minimums run into six figures, ownership records sit in filing cabinets, and if
you want out you have to find someone to buy an entire farm.

Farmora breaks a working farm into eight crop parcels and turns each one into an ERC-20
token. You buy `L-Saffron` or `L-Grapes` with a test stablecoin, and from then on:

- **Every harvest splits automatically.** The contract pays revenue out pro-rata to token
  holders — you claim it to your wallet whenever you like.
- **The farmer's share grows.** Investors start at 70% of harvest revenue and step down
  5 points a year. The farmer is buying back their own land with the crop, not with cash.
- **The farm has to prove it exists.** The farmer posts timestamped daily clips on-chain
  and can only draw operating budget inside time windows tied to the crop's growth stage.
- **You can go stand on it.** Each parcel has a farmhouse you can book for a weekend,
  paid in the same token. Double bookings revert on-chain.

### Why Monad

Farm economics play out over a decade, which makes them impossible to demo. Monad's
~400 ms blocks let us replay that decade live: the **Time Machine** fires hundreds of real
transactions — harvests, revenue distributions, the investor share sliding 70 → 65 → 60
→ … → 0 — while you watch the ladder tick down. Revenue distribution to every investor in
a parcel lands in parallel inside a single block. On a 12-second chain that demo is a
40-minute wait; here it is the whole pitch.

---

## How the money works

Every rule below is enforced by the contract, not by the UI.

| Rule | Value |
|---|---|
| Token price | 1 LAND token = 1 mUSDC |
| Initial investor revenue share | **70%** (`INITIAL_INVESTOR_SHARE` = 7000 bps) |
| Share step-down | **−5 points per year** (`SHARE_DECREASE_PER_YEAR` = 500 bps) |
| Buyback reserve | **10%** of every purchase is held back (`BUYBACK_RESERVE_PCT`) |
| Exit cooldown | **90 days** between requesting a sale and executing it (`SELL_COOLDOWN`) |
| Appreciation on exit | **+1% per year** held, minimum 1 year (`APPRECIATION_PCT_PER_YEAR` = 100 bps) |
| Fixed-return option | Per parcel (`fixedReturnBps`) — caps your total return, excess goes to the farmer |
| Crop cycle | Per parcel (`cropCycleYears`); replanting resets to fresh 70/30 terms |
| Stay limits | ≤ 7 nights, ≤ 8 guests, one booking per parcel per day |

**The exit path, plainly:** you request a sale → your tokens lock in the contract →
90 days pass → you execute → you get your principal back plus 1% per year of appreciation,
paid out of the buyback reserve. You stop earning harvest revenue the moment you exit.

### The eight parcels

| # | Crop | Acres | Tokens | Price/acre | First harvest | Cycle |
|---|---|---|---|---|---|---|
| 0 | Saffron | 1 | 40,000 | $40K | Oct–Nov, Y1 | Once a year |
| 1 | Cordyceps | 1 | 40,000 | $40K | Month 2 | 4–6 crops/yr |
| 2 | Mushroom | 1 | 25,000 | $25K | Month 1 | 5–6 crops/yr |
| 3 | Dragon Fruit | 2 | 30,000 | $15K | Year 2 | 2–3 flushes/yr |
| 4 | Pomegranate | 5 | 60,000 | $12K | Year 3 | Annual |
| 5 | Grapes | 5 | 100,000 | $20K | Year 3 | Annual |
| 6 | Turmeric | 5 | 40,000 | $8K | Month 9 | 1 crop/yr |
| 7 | Ginger | 5 | 50,000 | $10K | Month 9 | 1 crop/yr |

Anyone can also deploy their own parcel through the factory.

---

## Run the frontend

**You need:** [Node.js 20 or newer](https://nodejs.org) and [git](https://git-scm.com).
No database, no Docker, no API keys.

```bash
git clone https://github.com/maheepatel/Farmora.git
cd Farmora/frontend
npm install
npm run dev
```

Open **http://localhost:3000**. The app runs and you can browse every page without a
wallet or account.

> **Note:** the frontend currently runs with a simulated wallet, purchases and yield in
> the browser until the real wagmi/viem + RainbowKit wiring lands. The contract ABIs are
> already in `frontend/src/lib/abi/` and live addresses in `contracts/deployed.json`.

---

## Run the contracts

```bash
cd Farmora/contracts
npm install
npm run compile      # Solc 0.8.27
npm test             # 44 unit tests
```

---

## Set up your wallet

Only needed once real on-chain transactions are enabled. Browsing needs none of this.

**1. Install a wallet** — [MetaMask](https://metamask.io) or [Rabby](https://rabby.io).

**2. Add Monad Testnet.** Easiest way is [faucet.monad.xyz/add-network](https://faucet.monad.xyz/add-network),
which adds it in one click. To do it by hand:

| Field | Value |
|---|---|
| Network name | Monad Testnet |
| RPC URL | `https://testnet-rpc.monad.xyz` |
| Chain ID | `10143` |
| Currency symbol | `MON` |
| Block explorer | `https://testnet.monadscan.com` |

**3. Get testnet MON for gas** — [faucet.monad.xyz](https://faucet.monad.xyz). Free,
takes a few seconds, no real money involved anywhere in this project.

**4. Get mUSDC to invest with** — the `MockUSDC` contract mints **50,000 mUSDC**, once
per address.

---

## Project layout

```
Farmora/
├── contracts/                     Solidity contracts, deploy scripts, tests
│   ├── contracts/                 LandBatch, LandBatchFactory, MockUSDC, StayBooking
│   ├── test/                      44 unit tests
│   ├── scripts/                   deploy.ts, deploy-stays.ts
│   └── deployed.json              ← THE source of truth for contract addresses
├── frontend/
│   ├── src/
│   │   ├── app/                   ← Next.js App Router
│   │   │   ├── page.tsx               landing
│   │   │   ├── parcels/               marketplace
│   │   │   ├── parcels/[id]/          parcel detail + buy + yield simulator
│   │   │   └── dashboard/             portfolio, claim yield
│   │   ├── components/            ← UI
│   │   └── lib/
│   │       ├── abi/               ← contract ABIs (4 JSON files)
│   │       ├── parcels.ts         ← the 8 parcels
│   │       ├── store.ts           ← wallet + portfolio (simulated until wagmi lands)
│   │       └── format.ts          ← number/date formatting
│   ├── tests/e2e.mjs              ← E2E harness (reads contracts/deployed.json)
│   └── package.json
└── README.md                      ← you are here
```

### The contracts

| Contract | What it does |
|---|---|
| `MockUSDC` | Test stablecoin, 18 decimals, 50,000 one-time faucet per address |
| `LandBatch` | One per parcel. The whole economy: buy, sell + cooldown, revenue split and claim, milestones, clips, growth stages, year advance, replanting |
| `LandBatchFactory` | Deploys and registers new parcels (admin-only) |
| `StayBooking` | Farmhouse nights: book, cancel, refund, per-day slot locking, paid in mUSDC |

---

## Deployed contracts

**Monad Testnet · chain ID 10143 (`0x279f`) · [testnet.monadscan.com](https://testnet.monadscan.com)**

| Contract | CA (Contract Address) | Monadscan |
|---|---|---|
| MockUSDC | `0xa3849C2644cF2D478c8ABc4D4801A78a1F130dB0` | [view](https://testnet.monadscan.com/address/0xa3849C2644cF2D478c8ABc4D4801A78a1F130dB0) |
| LandBatchFactory | `0x9FC7143b8fD592464Ebc0a2cc114a533A9fAC3A6` | [view](https://testnet.monadscan.com/address/0x9FC7143b8fD592464Ebc0a2cc114a533A9fAC3A6) |
| StayBooking | `0xE6BfDaf80E3934f4c68558Ddc7104811fAe2049e` | [view](https://testnet.monadscan.com/address/0xE6BfDaf80E3934f4c68558Ddc7104811fAe2049e) |
| Batch 0 · Saffron | `0x5BeD428Eb28E13CbfF1e71C33F1e58dA7ca75DF3` | [view](https://testnet.monadscan.com/address/0x5BeD428Eb28E13CbfF1e71C33F1e58dA7ca75DF3) |
| Batch 1 · Cordyceps | `0x10e1B5d9e90e32B925aB463d39De120d0a4309A9` | [view](https://testnet.monadscan.com/address/0x10e1B5d9e90e32B925aB463d39De120d0a4309A9) |
| Batch 2 · Mushroom | `0x7809ba0628858c3F2fcB7a697808ca47E1748FCA` | [view](https://testnet.monadscan.com/address/0x7809ba0628858c3F2fcB7a697808ca47E1748FCA) |
| Batch 3 · Dragon Fruit | `0x4BA574bC1a94e1D3Bd4d462C5FF09848a6Cf08F9` | [view](https://testnet.monadscan.com/address/0x4BA574bC1a94e1D3Bd4d462C5FF09848a6Cf08F9) |
| Batch 4 · Pomegranate | `0x6303ba82426C299D0a6AC03558629707A7C6CE1e` | [view](https://testnet.monadscan.com/address/0x6303ba82426C299D0a6AC03558629707A7C6CE1e) |
| Batch 5 · Grapes | `0x6466D2D94D00c809aA325Bf3920336C1133FDEff` | [view](https://testnet.monadscan.com/address/0x6466D2D94D00c809aA325Bf3920336C1133FDEff) |
| Batch 6 · Turmeric | `0x97acc0E247A646096e1bD7C7030642b656b46297` | [view](https://testnet.monadscan.com/address/0x97acc0E247A646096e1bD7C7030642b656b46297) |
| Batch 7 · Ginger | `0x47e6560cEf1Aecf8765373E0f878D82AF7bdB364` | [view](https://testnet.monadscan.com/address/0x47e6560cEf1Aecf8765373E0f878D82AF7bdB364) |

All verified live with `eth_getCode` and visible on [testnet.monadscan.com](https://testnet.monadscan.com),
and source-verified on MonadVision (Sourcify) at `https://testnet.monadvision.com/contracts/full_match/10143/<address>`.

`contracts/deployed.json` is the machine-readable handoff file consumed by the frontend
and the E2E harness. Set `PRIVATE_KEY=0x...` in `contracts/.env` (never committed) and
run `npm run deploy` / `npm run deploy:stays` to redeploy.

---

## Deploying

### The contracts

Deploy `MockUSDC`, `LandBatchFactory`, `StayBooking` and the eight `LandBatch` parcels to
Monad Testnet, then the addresses land in `contracts/deployed.json`. Monad is fully
EVM-equivalent, so Hardhat works unchanged:

```
url: "https://testnet-rpc.monad.xyz"   chainId: 10143
```

Fund the deployer wallet from [faucet.monad.xyz](https://faucet.monad.xyz) first. Keep the
deployer key in `contracts/.env` and **never commit it** — `.env*` is already gitignored.

### The frontend

Deploy to [Vercel](https://vercel.com/new): import the repo, set **Root Directory** to
`frontend`, deploy. Nothing else to configure.

---

## Project status

Built for **[Monad Blitz Bangalore V5](https://blitz.devnads.com/events/monad-blitz-bangalore-v5)**.

**Working**
- Smart contracts: compile clean (Solc 0.8.27), **44/44 unit tests passing**, deployed +
  verified on Monad Testnet (chain 10143)
- Full frontend: landing, marketplace, parcel detail + buy + yield simulator, dashboard;
  responsive, editorial-light-luxury design system
- Contract ABIs in `frontend/src/lib/abi/`, E2E harness in `frontend/tests/`

**In progress**
- Real wallet wiring: replace the simulated `frontend/src/lib/store.ts` with wagmi/viem +
  RainbowKit calls against the deployed contracts

**Not built yet**
- The Time Machine (replaying a decade of farm economics as live transactions)
- Real IPFS pinning for clips (currently takes a URL)
- Legal title / land registry layer — this is a testnet demo with a mock stablecoin,
  not a securities offering

---

## Team

| | |
|---|---|
| **Person A** | Smart contracts (deployed + verified on Monad Testnet) |
| **Person B** | Frontend |

Built at Monad Blitz Bangalore V5.

## License

MIT
