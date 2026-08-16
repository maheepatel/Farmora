# 🌾 Farmora

Tokenized farmland on Monad. Buy tokens in a crop parcel, earn a cut of every harvest,
and watch the farmer's share climb year after year. Every figure in the app is read live
from contract storage.

**Monad Testnet (chain 10143)** · Next.js 16 · Solidity · wagmi + viem + RainbowKit

<!-- Add these once you have them:
[Live demo](https://your-app.vercel.app) · [Demo video](https://...)
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

Farmland has been a solid asset class for about as long as there have been assets, but
almost nobody gets to own any of it. Minimums run into six figures. Ownership records sit
in filing cabinets. If you want out, you have to find a buyer for an entire farm.

Farmora splits a working farm into eight crop parcels and turns each one into an ERC-20
token. You buy `L-Saffron` or `L-Grapes` with a test stablecoin, and after that:

- Harvest revenue splits automatically. The contract pays token holders pro-rata and you
  claim yours to your wallet whenever you want.
- The farmer's share grows over time. Investors start at 70% of harvest revenue and step
  down 5 points a year, so the farm gets paid back in crops rather than cash.
- The farm has to show its work. The farmer posts timestamped daily clips on-chain, and
  operating budget can only be drawn inside time windows tied to the crop's growth stage.
- There's a farmhouse on every parcel that you can book for a weekend, paid in the same
  token. The contract rejects double bookings.

No backend, no database. Everything the app displays comes out of contract storage. Your
wallet is your login.

### Why Monad

Farm economics play out over a decade, which makes them very hard to demo. Monad's 400ms
blocks let us replay that decade live. The Time Machine fires off hundreds of real
transactions (harvests, revenue distributions, the investor share dropping 70, 65, 60,
all the way to 0) while you watch the ladder tick down on screen. Revenue distribution to
every investor in a parcel lands in parallel inside one block. On a 12-second chain that
demo is a 40-minute wait. Here it's the whole pitch.

---

## How the money works

Every rule below is enforced by the contract, not the UI.

| Rule | Value |
|---|---|
| Token price | 1 LAND token = 1 mUSDC |
| Initial investor revenue share | 70% (`INITIAL_INVESTOR_SHARE` = 7000 bps) |
| Share step-down | 5 points per year (`SHARE_DECREASE_PER_YEAR` = 500 bps) |
| Buyback reserve | 10% of every purchase is held back (`BUYBACK_RESERVE_PCT`) |
| Exit cooldown | 90 days between requesting a sale and executing it (`SELL_COOLDOWN`) |
| Appreciation on exit | 1% per year held, minimum 1 year (`APPRECIATION_PCT_PER_YEAR` = 100 bps) |
| Fixed-return option | Set per parcel (`fixedReturnBps`), caps your total return and sends the excess to the farmer |
| Crop cycle | Set per parcel (`cropCycleYears`), replanting resets to fresh 70/30 terms |
| Stay limits | 7 nights max, 8 guests max, one booking per parcel per day |

The exit path works like this. You request a sale, your tokens lock in the contract, 90
days pass, then you execute and get your principal back plus 1% per year of appreciation,
paid out of the buyback reserve. Once you exit you stop earning harvest revenue. The app
prints these terms everywhere they apply, because nobody should be finding out about a
cooldown on the way out the door.

### The eight parcels

| # | Crop | Acres | Tokens | Price/acre | First harvest | Cycle |
|---|---|---|---|---|---|---|
| 0 | Saffron | 1 | 40,000 | $40K | Oct/Nov, Y1 | Once a year |
| 1 | Cordyceps | 1 | 40,000 | $40K | Month 2 | 4 to 6 crops/yr |
| 2 | Mushroom | 1 | 25,000 | $25K | Month 1 | 5 to 6 crops/yr |
| 3 | Dragon Fruit | 2 | 30,000 | $15K | Year 2 | 2 to 3 flushes/yr |
| 4 | Pomegranate | 5 | 60,000 | $12K | Year 3 | Annual |
| 5 | Grapes | 5 | 100,000 | $20K | Year 3 | Annual |
| 6 | Turmeric | 5 | 40,000 | $8K | Month 9 | 1 crop/yr |
| 7 | Ginger | 5 | 50,000 | $10K | Month 9 | 1 crop/yr |

You can also deploy your own parcel through the factory.

---

## Run it in 3 minutes

You need [Node.js 20 or newer](https://nodejs.org) and [git](https://git-scm.com).
Nothing else. No database, no Docker, no API keys.

**1. Get the code**

```bash
git clone https://github.com/<your-username>/farmora.git
```

**2. Go into the frontend**

```bash
cd farmora/frontend
```

**3. Install**

```bash
npm install
```

**4. Start it**

```bash
npm run dev
```

Open **http://localhost:3000**. The app runs and you can browse every page without a
wallet, without an account, and without deploying anything.

One thing worth knowing about `npm run dev`: it runs `sync:contracts` first, which copies
contract addresses from `contracts/deployed.json` into the frontend. You never need to
call that script yourself.

If the parcels all say **"Not deployed"**, the contracts aren't on the testnet yet. See
[Deployed contracts](#deployed-contracts) below. Browsing still works either way.

---

## Set up your wallet

You only need this if you want to buy, claim, sell or book. Browsing needs none of it.

**1. Install a wallet.** [MetaMask](https://metamask.io) or [Rabby](https://rabby.io).

**2. Add Monad Testnet.** The quickest way is
[faucet.monad.xyz/add-network](https://faucet.monad.xyz/add-network), which does it in one
click. By hand:

| Field | Value |
|---|---|
| Network name | Monad Testnet |
| RPC URL | `https://testnet-rpc.monad.xyz` |
| Chain ID | `10143` |
| Currency symbol | `MON` |
| Block explorer | `https://testnet.monadscan.com` |

**3. Get testnet MON for gas** from [faucet.monad.xyz](https://faucet.monad.xyz). It's
free and takes a few seconds. No real money is involved anywhere in this project.

**4. Get mUSDC to invest with.** Connect your wallet in the app and hit the faucet button.
You get 50,000 mUSDC, once per address, straight from the contract.

**5. See your tokens in your wallet.** Go to `/add-tokens` and tap once per token to add
it to MetaMask. Optional, but it makes the whole thing feel a lot more real.

---

## Take the tour

Fastest path through everything the product does:

1. **`/`** Landing page. Live ledger panel showing the current investor/farmer split
   across all parcels, refreshed every 30 seconds from the chain.
2. **`/marketplace`** All eight parcels with valuations and the share-slide row. Pick one.
3. **`/batch/[id]`** Choose fixed-return or variable, buy tokens with mUSDC, get confetti.
   Tabs here for the farm's proof-of-work clips and its farmhouse.
4. **`/admin`** Farm Ops. Advance time, push the crop through its growth stages, trigger a
   harvest, enter revenue and let the contract split it. Create and claim milestones,
   upload a clip, deploy a whole new parcel.
5. **`/portfolio`** Your holdings and pending revenue. Claim it. Request a sale and watch
   the 90-day cooldown count down.
6. **`/stays`** Book a weekend at the farmhouse on a parcel you own. Try double-booking a
   night and the chain will stop you.
7. **`/add-tokens`** One-tap add of mUSDC and every LAND token to your wallet.

If you're demoing this to someone, run through `/admin` first. An app with no harvests, no
clips and no bookings in it looks half-finished however good the code underneath is.

---

## Project layout

```
farmora/
├── contracts/
│   └── deployed.json          the source of truth for contract addresses
├── frontend/
│   ├── scripts/
│   │   └── sync-contracts.mjs the copier, runs on predev and prebuild
│   ├── src/
│   │   ├── app/               Next.js App Router, one folder per page
│   │   │   ├── page.tsx           landing
│   │   │   ├── marketplace/       parcel list
│   │   │   ├── batch/[id]/        parcel detail and buy
│   │   │   ├── portfolio/         holdings, claim, sell
│   │   │   ├── admin/             farm ops
│   │   │   ├── stays/             farmhouse bookings
│   │   │   └── add-tokens/        wallet token registry
│   │   ├── components/        UI
│   │   └── lib/
│   │       ├── abi/           contract ABIs, 4 JSON files
│   │       ├── config.ts      chain config, economics, the 8 parcels
│   │       ├── deployed.json  auto-copied from contracts/deployed.json, don't edit this one
│   │       ├── wagmi.ts       wallet connection
│   │       ├── live.ts        the 30s live-read layer
│   │       ├── tx.ts          transaction helpers
│   │       └── format.ts      number and date formatting
│   └── package.json
├── PRD.md                     full product spec
└── README.md                  you are here
```

The one file worth reading first is
[`frontend/src/lib/config.ts`](frontend/src/lib/config.ts). Chain settings, all eight
parcels and every economic constant live in there.

### The contracts

| Contract | What it does |
|---|---|
| `MockUSDC` | Test stablecoin, 18 decimals, 50,000 one-time faucet per address |
| `LandBatch` | One per parcel, and it holds the whole economy: buy, sell with cooldown, revenue split and claim, milestones, clips, growth stages, year advance, replanting |
| `LandBatchFactory` | Deploys and registers new parcels |
| `StayBooking` | Farmhouse nights: book, cancel, refund, per-day slot locking |

---

## Deployed contracts

Monad Testnet, chain ID 10143. Explorer at
[testnet.monadscan.com](https://testnet.monadscan.com).

| Contract | Address |
|---|---|
| MockUSDC | `0x32d31E354C777775DA3090A80427f4CAD5F5bef8` |
| LandBatchFactory | `0x455dcBc5fafE62295CbA867eEc31491244fFA6a6` |
| StayBooking | `0x7176d465483Fc6a2A571D9389C4ffee84BA3B446` |

<details>
<summary>Parcel addresses</summary>

| # | Crop | Address |
|---|---|---|
| 0 | Saffron | `0x3D5008f631E3276EB8F79869808e24001Ac35a6A` |
| 1 | Cordyceps | `0x450CA1d0eB6849A939f5506b108596E62F01779C` |
| 2 | Mushroom | `0x4F95b8e426af49f75e16486fE0e4936Af096A01E` |
| 3 | Dragon Fruit | `0x19E9518EC7a8CE09E4e205B2Fd4C58b0A221F46D` |
| 4 | Pomegranate | `0x820b3e38137695c54D453e2a54108C597585EBC2` |
| 5 | Grapes | `0x8fF38de96E55F57928e52B831100836B6A017382` |
| 6 | Turmeric | `0x39226Bcdfc7DebB1E8627F3A5c8D3a0a668AA37c` |
| 7 | Ginger | `0x80F955164203a59b1fd036a2FC46Eef6a444ED31` |

</details>

### How addresses get into the app

Edit `contracts/deployed.json` at the repo root. That one file, nothing else:

```json
{
  "chainId": 10143,
  "chainName": "Monad Testnet",
  "mockUSDC": "0x32d31E354C777775DA3090A80427f4CAD5F5bef8",
  "factory": "0x455dcBc5fafE62295CbA867eEc31491244fFA6a6",
  "stayBooking": "0x7176d465483Fc6a2A571D9389C4ffee84BA3B446",
  "batches": ["0x3D5008f631E3276EB8F79869808e24001Ac35a6A", "0x450CA1d0eB6849A939f5506b108596E62F01779C", "0x4F95b8e426af49f75e16486fE0e4936Af096A01E", "0x19E9518EC7a8CE09E4e205B2Fd4C58b0A221F46D", "0x820b3e38137695c54D453e2a54108C597585EBC2", "0x8fF38de96E55F57928e52B831100836B6A017382", "0x39226Bcdfc7DebB1E8627F3A5c8D3a0a668AA37c", "0x80F955164203a59b1fd036a2FC46Eef6a444ED31"],
  "stayPrices": [350, 300, 180, 300, 250, 320, 150, 150]
}
```

`npm run dev` and `npm run build` copy it into the frontend for you. Any address still set
to `0x0000000000000000000000000000000000000000` renders that parcel as "Not deployed"
rather than crashing, so a partial deployment won't take the app down.

---

## Configuration

There's one environment variable and it's optional.

Create `frontend/.env.local`:

```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

| Variable | Required? | What it does |
|---|---|---|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | No | Turns on WalletConnect for mobile wallets and QR scanning. Free at [cloud.reown.com](https://cloud.reown.com). Browser wallets like MetaMask work fine without it. |

You don't need any private keys, API keys or secrets to run the app.

### RPC endpoints

Four Monad testnet RPCs are configured with automatic failover so one provider going down
doesn't take the app with it:

`testnet-rpc.monad.xyz`, then `rpc-testnet.monadinfra.com`, then
`rpc.ankr.com/monad_testnet`, then `10143.rpc.thirdweb.com`.

The list lives in [`frontend/src/lib/config.ts`](frontend/src/lib/config.ts).

---

## All commands

Run these from `frontend/`:

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on port 3000, syncs addresses first |
| `npm run build` | Production build, syncs addresses first |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run sync:contracts` | Copy addresses from root into the frontend, runs automatically |

Before pushing, both of these should come back clean:

```bash
npm run typecheck && npm run lint && npm run build
```

---

## Deploying

### The contracts

Deploy `MockUSDC`, `LandBatchFactory`, `StayBooking` and the eight `LandBatch` parcels to
Monad Testnet, paste the addresses into `contracts/deployed.json`, restart the dev server.
Monad is fully EVM-equivalent so Hardhat and Foundry work unchanged. The network config is
just:

```
url: "https://testnet-rpc.monad.xyz"   chainId: 10143
```

Fund the deployer wallet from [faucet.monad.xyz](https://faucet.monad.xyz) first. Keep the
deployer key in `contracts/.env` and don't commit it. `.env*` is already gitignored.

### The frontend

Deploy on [Vercel](https://vercel.com/new). Import the repo, set Root Directory to
`frontend`, add `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` if you have one, deploy. There's
nothing else to configure.

---

## Troubleshooting

**Everything says "Not deployed."**
The contracts aren't on-chain yet, or `contracts/deployed.json` still has zero addresses in
it. Fill it in and restart the dev server.

**Wallet won't connect.**
Check you're on Monad Testnet (chain 10143) and not Ethereum. The app only supports 10143,
which is deliberate so you can't sign against the wrong chain by accident.

**"Insufficient funds" when buying.**
There are two tokens in play. MON pays for gas and comes from
[faucet.monad.xyz](https://faucet.monad.xyz). mUSDC buys land and comes from the in-app
faucet. You need both.

**Transactions hang or reads fail.**
Usually a testnet RPC having a bad minute. Reload and failover picks another provider. If
it keeps happening, reorder `RPC_URLS` in `config.ts`.

**Faucet says already claimed.**
It's once per address and enforced on-chain. Use a different wallet.

**Addresses changed but the app shows the old ones.**
Restart `npm run dev`. The sync only runs at startup.

**`npm install` fails.**
Check `node --version` is 20 or higher, then delete `node_modules` and `package-lock.json`
and try again.

---

## Project status

Built for [Monad Blitz Bangalore V5](https://blitz.devnads.com/events/monad-blitz-bangalore-v5).

**Working**

- Full frontend: all seven pages, live-read layer, celebrations, responsive, respects
  reduced-motion
- Monad Testnet wired end to end with four-provider RPC failover
- Contract ABIs and the typed integration layer around them
- Graceful "not deployed" states so a missing address never blanks the app
- Contracts deployed and verified on Monad Testnet (chain 10143), see
  [Deployed contracts](#deployed-contracts)
- 8 security findings patched and re-verified, see `SECURITY-AUDIT.md`

**In progress**

- The Time Machine, replaying a decade of farm economics as live transactions

**Not built yet**

- An automated end to end suite
- Real IPFS pinning for clips, currently it takes a URL
- Legal title and land registry. This is a testnet demo with a mock stablecoin, not a
  securities offering.

**Known limitations**

- One wallet acts as both farmer and admin on the seed parcels. That's fine for a demo but
  role separation is a hard requirement before mainnet.
- The buyback reserve is 10% of purchases. Enough for normal exits, not for a bank run.
- Return estimates on parcel pages are illustrative. Real revenue is whatever the farmer
  actually distributes on-chain.

---

## Team

| | |
|---|---|
| **[Your name]** | Smart contracts |
| **[Teammate's name]** | Frontend |

Built at Monad Blitz Bangalore V5. Full product spec is in [`PRD.md`](PRD.md).

## License

MIT
