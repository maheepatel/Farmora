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
| Explorer | `https://testnet.monadvision.com` |
| Gas faucet | `https://faucet.monad.xyz` |

## Contracts

Deployed on Monad Testnet (chain 10143) — see `contracts/deployed.json` for the live addresses.

| Contract | Purpose |
|---|---|
| `MockUSDC` | mUSDC test token; one-time 50,000 faucet per address |
| `LandBatchFactory` | Deploys and registers farm LAND batches (admin-only) |
| `LandBatch` | ERC20 LAND token per crop: buy, sell (90-day cooldown), revenue distribution, milestones, growth stages |
| `StayBooking` | On-chain farm stay booking + cancellation, paid in mUSDC |

### Live contract addresses (CA) — Monad Testnet

| Contract | CA (Contract Address) | MonadVision |
|---|---|---|
| MockUSDC | `0x32d31E354C777775DA3090A80427f4CAD5F5bef8` | [view](https://testnet.monadvision.com/address/0x32d31E354C777775DA3090A80427f4CAD5F5bef8) |
| LandBatchFactory | `0x455dcBc5fafE62295CbA867eEc31491244fFA6a6` | [view](https://testnet.monadvision.com/address/0x455dcBc5fafE62295CbA867eEc31491244fFA6a6) |
| StayBooking | `0x7176d465483Fc6a2A571D9389C4ffee84BA3B446` | [view](https://testnet.monadvision.com/address/0x7176d465483Fc6a2A571D9389C4ffee84BA3B446) |
| Batch 0 · Saffron | `0x3D5008f631E3276EB8F79869808e24001Ac35a6A` | [view](https://testnet.monadvision.com/address/0x3D5008f631E3276EB8F79869808e24001Ac35a6A) |
| Batch 1 · Cordyceps | `0x450CA1d0eB6849A939f5506b108596E62F01779C` | [view](https://testnet.monadvision.com/address/0x450CA1d0eB6849A939f5506b108596E62F01779C) |
| Batch 2 · Mushroom | `0x4F95b8e426af49f75e16486fE0e4936Af096A01E` | [view](https://testnet.monadvision.com/address/0x4F95b8e426af49f75e16486fE0e4936Af096A01E) |
| Batch 3 · Dragon Fruit | `0x19E9518EC7a8CE09E4e205B2Fd4C58b0A221F46D` | [view](https://testnet.monadvision.com/address/0x19E9518EC7a8CE09E4e205B2Fd4C58b0A221F46D) |
| Batch 4 · Pomegranate | `0x820b3e38137695c54D453e2a54108C597585EBC2` | [view](https://testnet.monadvision.com/address/0x820b3e38137695c54D453e2a54108C597585EBC2) |
| Batch 5 · Grapes | `0x8fF38de96E55F57928e52B831100836B6A017382` | [view](https://testnet.monadvision.com/address/0x8fF38de96E55F57928e52B831100836B6A017382) |
| Batch 6 · Turmeric | `0x39226Bcdfc7DebB1E8627F3A5c8D3a0a668AA37c` | [view](https://testnet.monadvision.com/address/0x39226Bcdfc7DebB1E8627F3A5c8D3a0a668AA37c) |
| Batch 7 · Ginger | `0x80F955164203a59b1fd036a2FC46Eef6a444ED31` | [view](https://testnet.monadvision.com/address/0x80F955164203a59b1fd036a2FC46Eef6a444ED31) |

All verified live with `eth_getCode` and visible on [testnet.monadvision.com](https://testnet.monadvision.com). All source-verified on MonadVision (Sourcify): `https://testnet.monadvision.com/contracts/full_match/10143/<address>`.

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
npm test             # 51 unit tests
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
- ✅ 51/51 unit tests passing
- ✅ Deployed + verified on MonadVision (chain 10143)
- ⏳ E2E pending Person B frontend running on `localhost:3000`
