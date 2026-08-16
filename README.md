# Farmora

Farmora is a farm investment protocol built on the **Monad blockchain**. Investors buy on-chain LAND tokens backed by real farm batches, earn revenue distributed automatically from harvests, and can book farm stays in mUSDC.

This repository contains the **smart contract layer** (Person A scope), deployed to Monad Testnet.

## Chain

| Item | Value |
|---|---|
| Chain | Monad Testnet |
| Chain ID | `10143` (`0x279f`) |
| Native token | `MON` (gas only — product money stays in mUSDC) |
| RPC | `https://testnet-rpc.monad.xyz` |
| Explorer | `https://testnet.monadscan.com` |
| Gas faucet | `https://faucet.monad.xyz` |

## Contracts

Deployed on Monad Testnet (chain 10143) — see `contracts/deployed.json` for the live addresses.

| Contract | Purpose |
|---|---|
| `MockUSDC` | mUSDC test token; one-time 50,000 faucet per address |
| `LandBatchFactory` | Deploys and registers farm LAND batches (admin-only) |
| `LandBatch` | ERC20 LAND token per crop: buy, sell (90-day cooldown), revenue distribution, milestones, growth stages |
| `StayBooking` | On-chain farm stay booking + cancellation, paid in mUSDC |

### Seed batches

8 batches are live: Saffron, Cordyceps, Mushroom, Dragon Fruit, Pomegranate, Grapes, Turmeric, Ginger — each with its own LAND token, price, fixed return, and crop cycle.

## Layout

```
contracts/           Solidity contracts, deploy scripts, tests, deployed.json
frontend/tests/      E2E harness (reads contracts/deployed.json)
frontend/src/lib/abi/ Contract ABIs for the frontend
PRD-A-FARMORA.md     Person A spec: chain / smart contracts
```

## Quick start (contracts)

```bash
cd contracts
npm install
npm run compile      # Solc 0.8.27
npm test             # 44 unit tests
```

## Deploy to Monad Testnet

```bash
cd contracts
# set PRIVATE_KEY=0x... in contracts/.env (never commit this file)
npm run deploy       # MockUSDC + Factory + 8 batches → writes deployed.json
npm run deploy:stays # StayBooking + stay prices → updates deployed.json
```

`contracts/deployed.json` is the machine-readable handoff file consumed by the frontend.

## Status

- ✅ Compile clean (Solc 0.8.27)
- ✅ 44/44 unit tests passing
- ✅ Deployed + verified on Monadscan (chain 10143)
- ⏳ E2E pending Person B frontend running on `localhost:3000`
