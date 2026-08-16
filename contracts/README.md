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

All confirmed deployed with `eth_getCode` (bytecode present) and visible on [testnet.monadvision.com](https://testnet.monadvision.com). All source-verified on MonadVision (Sourcify) — view the code at `https://testnet.monadvision.com/contracts/full_match/10143/<address>`. (MonadVision verification requires an Etherscan V2 API key; the deprecated V1 endpoint is no longer accepted.)

## Security notes

- `buyTokens` transfers 10% of payment to `buybackReserve`; sells draw principal + 1%/yr from it.
- Only admin can create batches / advance years; only farmer or admin distribute revenue / upload clips / claim milestones.
- Stays: 90-day-style guard is not used here; cancellation returns the full payment and frees nights.
- Never commit `contracts/.env`. It is gitignored.
