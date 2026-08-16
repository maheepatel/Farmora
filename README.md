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

### Live contract addresses (CA) — Monad Testnet

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

All verified live with `eth_getCode` and visible on [testnet.monadscan.com](https://testnet.monadscan.com). All source-verified on MonadVision (Sourcify): `https://testnet.monadvision.com/contracts/full_match/10143/<address>`.

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
