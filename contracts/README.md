# Farmora Contracts

Smart contracts for Farmora — farm investment protocol on Monad Testnet (chain `10143`).

## Contracts

| Contract | File | Purpose |
|---|---|---|
| `MockUSDC` | `contracts/MockUSDC.sol` | mUSDC test token. 10M minted to deployer; `faucet()` mints 50,000 once per address |
| `LandBatch` | `contracts/LandBatch.sol` | ERC20 LAND token per farm batch. Buy, sell (90-day cooldown + buyback reserve), revenue distribution, milestones, clips, growth stages, year advance |
| `LandBatchFactory` | `contracts/LandBatchFactory.sol` | Admin-only factory that deploys and registers `LandBatch` contracts |
| `StayBooking` | `contracts/StayBooking.sol` | Farm stay booking/cancellation paid in mUSDC; max 7 nights, 8 guests |

Solidity `0.8.27`, OpenZeppelin `^5.0.0`, Hardhat `^2.22.0`.

## Seed batches

| id | cropType | acres | supply | fixedReturnBps | cycleYears |
|---:|----------|------:|-------:|---------------:|-----------:|
| 0 | Saffron | 1 | 40000 | 1000 | 1 |
| 1 | Cordyceps | 1 | 40000 | 1400 | 1 |
| 2 | Mushroom | 1 | 25000 | 1200 | 1 |
| 3 | Dragon Fruit | 2 | 30000 | 1200 | 2 |
| 4 | Pomegranate | 5 | 60000 | 900 | 3 |
| 5 | Grapes | 5 | 100000 | 900 | 3 |
| 6 | Turmeric | 5 | 40000 | 800 | 1 |
| 7 | Ginger | 5 | 50000 | 900 | 1 |

Price per LAND token = 1 mUSDC (`parseUnits("1", 18)`) for all batches.

## Setup

```bash
npm install
```

## Compile

```bash
npm run compile
```

## Test

```bash
npm test
```

44 tests covering: MockUSDC faucet/admin mint, buy (reserve, pricing), sell (cooldown, buyback, burn), revenue distribution + fixed-return cap, milestones, clips, `advanceYear`/growth stages, factory registry, and stays booking/cancel.

## Deploy (Monad Testnet)

1. Create `contracts/.env` (never commit):
   ```
   PRIVATE_KEY=0x<your-deployer-private-key>
   ```
2. Fund the deployer with test MON: https://faucet.monad.xyz
3. Deploy MockUSDC + Factory + 8 batches:
   ```bash
   npm run deploy
   ```
4. Deploy StayBooking + set stay prices:
   ```bash
   npm run deploy:stays
   ```

Both scripts write/update `contracts/deployed.json` — the machine-readable deployment record consumed by the frontend and the e2e harness.

## Deployed (live on chain 10143)

| Contract | Address |
|---|---|
| MockUSDC | `0xa3849C2644cF2D478c8ABc4D4801A78a1F130dB0` |
| LandBatchFactory | `0x9FC7143b8fD592464Ebc0a2cc114a533A9fAC3A6` |
| StayBooking | `0xE6BfDaf80E3934f4c68558Ddc7104811fAe2049e` |
| Batches 0–7 | see `contracts/deployed.json` |

Verify any contract on [testnet.monadscan.com](https://testnet.monadscan.com).

## Security notes

- `buyTokens` transfers 10% of payment to `buybackReserve`; sells draw principal + 1%/yr from it.
- Only admin can create batches / advance years; only farmer or admin distribute revenue / upload clips / claim milestones.
- Stays: 90-day-style guard is not used here; cancellation returns the full payment and frees nights.
- Never commit `contracts/.env`. It is gitignored.
