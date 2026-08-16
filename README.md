# 🌾 AcreLedger

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
- [Run it in 3 minutes](#run-it-in-3-minutes)
- [Set up your wallet](#set-up-your-wallet)
- [Take the tour](#take-the-tour)
- [Project layout](#project-layout)
- [Deployed contracts](#deployed-contracts)
- [Configuration](#configuration)
- [All commands](#all-commands)
- [Deploying](#deploying)
- [Troubleshooting](#troubleshooting)
- [Project status](#project-status)
- [Team](#team)

---

## What this is

Farmland is one of the oldest, steadiest asset classes on earth, and almost nobody can
buy any. Minimums run into six figures, ownership records sit in filing cabinets, and if
you want out you have to find someone to buy an entire farm.

AcreLedger breaks a working farm into eight crop parcels and turns each one into an ERC-20
token. You buy `L-Saffron` or `L-Grapes` with a test stablecoin, and from then on:

- **Every harvest splits automatically.** The contract pays revenue out pro-rata to token
  holders — you claim it to your wallet whenever you like.
- **The farmer's share grows.** Investors start at 70% of harvest revenue and step down
  5 points a year. The farmer is buying back their own land with the crop, not with cash.
- **The farm has to prove it exists.** The farmer posts timestamped daily clips on-chain
  and can only draw operating budget inside time windows tied to the crop's growth stage.
- **You can go stand on it.** Each parcel has a farmhouse you can book for a weekend,
  paid in the same token. Double bookings revert on-chain.

There is **no backend and no database.** Every figure the app renders is read straight
from contract storage. Your wallet is your login.

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
The app prints these terms at every point where they apply, because a mechanism you only
discover on the way out is not a mechanism, it's a trap.

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

## Run it in 3 minutes

**You need:** [Node.js 20 or newer](https://nodejs.org) and [git](https://git-scm.com).
That is the whole list. No database, no Docker, no API keys.

**1. Get the code**

```bash
git clone https://github.com/<your-username>/acreledger.git
```

**2. Go into the frontend**

```bash
cd acreledger/frontend
```

**3. Install**

```bash
npm install
```

**4. Start it**

```bash
npm run dev
```

Open **http://localhost:3000**. That's it — the app runs and you can browse every page
without a wallet, without an account, and without deploying anything.

> **Note on `npm run dev`:** it automatically runs `sync:contracts` first, which copies
> the deployed contract addresses from `contracts/deployed.json` into the frontend. You
> never call that script by hand.

If the parcels show **"Not deployed"**, the contracts haven't been published to the
testnet yet — see [Deployed contracts](#deployed-contracts). Browsing still works.

---

## Set up your wallet

Only needed if you want to actually buy, claim, sell or book. Browsing needs none of this.

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

**4. Get mUSDC to invest with** — connect your wallet in the app and hit the faucet
button. It mints you **50,000 mUSDC**, once per address, straight from the contract.

**5. See your tokens in your wallet** — go to `/add-tokens` and tap once per token to add
it to MetaMask. Optional, but it makes the whole thing feel real.

---

## Take the tour

The fastest path through everything the product does:

1. **`/` — Landing.** Live ledger panel showing the current investor:farmer split across
   all parcels, refreshed every 30 seconds straight from the chain.
2. **`/marketplace` — Browse.** Eight parcels with valuations and the share-slide row.
   Pick one.
3. **`/batch/[id]` — Buy.** Choose fixed-return or variable, buy tokens with mUSDC, watch
   the confetti. Tabs for the farm's proof-of-work clips and its farmhouse.
4. **`/admin` — Farm Ops.** This is the fun one. Advance time, push the crop through its
   growth stages, trigger a harvest, enter revenue and let the contract split it. Create
   and claim milestones. Upload a clip. Deploy a whole new parcel.
5. **`/portfolio` — Get paid.** Your holdings, your pending revenue, claim it. Request a
   sale and watch the 90-day cooldown count down.
6. **`/stays` — Book.** Reserve a weekend at the farmhouse on the parcel you own. Try
   double-booking a night; the chain will stop you.
7. **`/add-tokens` — Registry.** One-tap add of mUSDC and every LAND token to your wallet.

> **Demo tip:** run through `/admin` *before* showing anyone. An app with zero harvests,
> zero clips and zero bookings looks unfinished no matter how good the code is.

---

## Project layout

```
acreledger/
├── contracts/
│   └── deployed.json          ← THE source of truth for contract addresses
├── frontend/
│   ├── contracts/
│   │   └── deployed.json      ← auto-copied from above, do not edit
│   ├── scripts/
│   │   └── sync-contracts.mjs ← the copier, runs on predev/prebuild
│   ├── src/
│   │   ├── app/               ← Next.js App Router: one folder per page
│   │   │   ├── page.tsx           landing
│   │   │   ├── marketplace/       parcel list
│   │   │   ├── batch/[id]/        parcel detail + buy
│   │   │   ├── portfolio/         holdings, claim, sell
│   │   │   ├── admin/             farm ops
│   │   │   ├── stays/             farmhouse bookings
│   │   │   └── add-tokens/        wallet token registry
│   │   ├── components/        ← UI
│   │   └── lib/
│   │       ├── abi/           ← contract ABIs (4 JSON files)
│   │       ├── config.ts      ← chain config, economics, the 8 parcels
│   │       ├── wagmi.ts       ← wallet connection
│   │       ├── live.ts        ← the 30s live-read layer
│   │       ├── tx.ts          ← transaction helpers
│   │       └── format.ts      ← number/date formatting
│   └── package.json
├── PRD.md                     ← full product spec
└── README.md                  ← you are here
```

**If you only read one file**, read [`frontend/src/lib/config.ts`](frontend/src/lib/config.ts).
Chain settings, all eight parcels, and every economic constant live there.

### The contracts

| Contract | What it does |
|---|---|
| `MockUSDC` | Test stablecoin, 18 decimals, 50,000 one-time faucet per address |
| `LandBatch` | One per parcel. The whole economy: buy, sell + cooldown, revenue split and claim, milestones, clips, growth stages, year advance, replanting |
| `LandBatchFactory` | Deploys and registers new parcels |
| `StayBooking` | Farmhouse nights: book, cancel, refund, per-day slot locking |

---

## Deployed contracts

**Monad Testnet · chain ID 10143 · [testnet.monadscan.com](https://testnet.monadscan.com)**

| Contract | Address |
|---|---|
| MockUSDC | `0x…` |
| LandBatchFactory | `0x…` |
| StayBooking | `0x…` |

<details>
<summary>Parcel addresses</summary>

| # | Crop | Address |
|---|---|---|
| 0 | Saffron | `0x…` |
| 1 | Cordyceps | `0x…` |
| 2 | Mushroom | `0x…` |
| 3 | Dragon Fruit | `0x…` |
| 4 | Pomegranate | `0x…` |
| 5 | Grapes | `0x…` |
| 6 | Turmeric | `0x…` |
| 7 | Ginger | `0x…` |

</details>

### How addresses reach the app

Edit **`contracts/deployed.json` at the repo root** — that one file, nothing else:

```json
{
  "chainId": 10143,
  "chainName": "Monad Testnet",
  "mockUSDC": "0x…",
  "factory": "0x…",
  "stayBooking": "0x…",
  "batches": ["0x…", "0x…", "0x…", "0x…", "0x…", "0x…", "0x…", "0x…"],
  "stayPrices": [250, 300, 150, 400, 500, 450, 200, 200]
}
```

`npm run dev` and `npm run build` copy it into the frontend automatically. Any address
left as `0x0000…0000` makes that parcel render as **"Not deployed"** instead of crashing —
the app is built to survive a partial deployment.

---

## Configuration

There is **one** environment variable, and it is optional.

Create `frontend/.env.local`:

```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

| Variable | Required? | What it does |
|---|---|---|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Optional | Enables WalletConnect (mobile wallets, QR scanning). Get one free at [cloud.reown.com](https://cloud.reown.com). **Without it, browser wallets like MetaMask still work fine.** |

No private keys, no API keys, no secrets are needed to run this app.

### RPC endpoints

Four Monad testnet RPCs are configured with automatic failover, so a single provider
going down doesn't take the app with it:

`testnet-rpc.monad.xyz` → `rpc-testnet.monadinfra.com` → `rpc.ankr.com/monad_testnet` → `10143.rpc.thirdweb.com`

Change the list in [`frontend/src/lib/config.ts`](frontend/src/lib/config.ts).

---

## All commands

Run from `frontend/`:

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on port 3000 (syncs addresses first) |
| `npm run build` | Production build (syncs addresses first) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run sync:contracts` | Copy addresses from root into the frontend (runs automatically) |

Before you push anything, both of these should be clean:

```bash
npm run typecheck && npm run lint && npm run build
```

---

## Deploying

### The contracts

Deploy `MockUSDC`, `LandBatchFactory`, `StayBooking` and the eight `LandBatch` parcels to
Monad Testnet, then paste the addresses into `contracts/deployed.json` and restart the
dev server. Monad is fully EVM-equivalent, so Hardhat and Foundry work unchanged — the
network config is just:

```
url: "https://testnet-rpc.monad.xyz"   chainId: 10143
```

Fund the deployer wallet from [faucet.monad.xyz](https://faucet.monad.xyz) first. Keep the
deployer key in `contracts/.env` and **never commit it** — `.env*` is already gitignored.

### The frontend

Deploy to [Vercel](https://vercel.com/new): import the repo, set **Root Directory** to
`frontend`, add `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` if you have one, deploy. Nothing
else to configure.

---

## Troubleshooting

**Everything says "Not deployed"**
The contracts aren't on-chain yet, or `contracts/deployed.json` still has zero addresses.
Fill it in and restart the dev server.

**Wallet won't connect**
Check you're on Monad Testnet (chain 10143), not Ethereum. The app only supports 10143 —
that's deliberate, so you can't accidentally sign against the wrong chain.

**"Insufficient funds" when buying**
Two different tokens are involved: **MON** pays gas ([faucet.monad.xyz](https://faucet.monad.xyz))
and **mUSDC** buys land (the in-app faucet). You need both.

**Transactions hang or reads fail**
A testnet RPC is having a moment. Reload — failover picks another provider. If it
persists, reorder `RPC_URLS` in `config.ts`.

**Faucet says already claimed**
It's once per address, enforced on-chain. Use a different wallet.

**Addresses changed but the app shows the old ones**
Restart `npm run dev`. The sync only runs on startup.

**`npm install` fails**
Check `node --version` is 20 or higher. Then delete `node_modules` and
`package-lock.json` and try again.

---

## Project status

Built for **[Monad Blitz Bangalore V5](https://blitz.devnads.com/events/monad-blitz-bangalore-v5)**.

**Working**
- Full frontend: all seven pages, live-read layer, celebrations, responsive, reduced-motion aware
- Monad Testnet wired end to end with four-provider RPC failover
- Contract ABIs and the complete typed integration layer
- Graceful "not deployed" states so the app never blanks on a missing address

**In progress**
- Solidity sources land in `contracts/`; deployment to Monad Testnet pending
- The Time Machine: replaying a decade of farm economics as live transactions

**Not built yet**
- Automated contract tests and an end-to-end suite
- Real IPFS pinning for clips (currently takes a URL)
- Legal title / land registry layer — this is a testnet demo with a mock stablecoin,
  not a securities offering

**Known limitations, stated plainly**
- One wallet acts as both farmer and admin on the seed parcels. Fine for a demo, wrong
  for production; role separation is a mainnet requirement.
- The buyback reserve is 10% of purchases. It funds ordinary exits, not a bank run.
- Return estimates on parcel pages are illustrative. Actual revenue is whatever the
  farmer distributes on-chain, and only that.

---

## Team

| | |
|---|---|
| **[Your name]** | Smart contracts |
| **[Teammate's name]** | Frontend |

Built at Monad Blitz Bangalore V5. Full product spec in [`PRD.md`](PRD.md).

## License

MIT
