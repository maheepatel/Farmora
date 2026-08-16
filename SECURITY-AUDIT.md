?# Farmora Security Audit Report

**Scope:** Farmora smart contracts on Monad Testnet (chain 10143) — 4 contracts
**Date:** 2026-08-16
**Status:** For public release (testnet) — **all findings fixed, 51 tests passing**
**Auditor:** AI-assisted (gstack CSO methodology)

---

## Contracts Audited

| Contract | Address | Source |
|---|---|---|
| MockUSDC | `0x32d31E354C777775DA3090A80427f4CAD5F5bef8` | `contracts/contracts/MockUSDC.sol` |
| LandBatchFactory | `0x455dcBc5fafE62295CbA867eEc31491244fFA6a6` | `contracts/contracts/LandBatchFactory.sol` |
| LandBatch | 8 instances (Saffron, Cordyceps, Mushroom, Dragon Fruit, Pomegranate, Grapes, Turmeric, Ginger) | `contracts/contracts/LandBatch.sol` |
| StayBooking | `0x7176d465483Fc6a2A571D9389C4ffee84BA3B446` | `contracts/contracts/StayBooking.sol` |

All 11 contracts verified on **Sourcify / MonadVision** (full match).

---

## Checks Performed

### 1. Secrets & Supply-Chain
- [x] Full git history scanned for private keys / API keys — **clean**
- [x] `contracts/.env` confirmed gitignored and never committed (contains deployer `PRIVATE_KEY` + stale `ETHERSCAN_API_KEY`)
- [x] `.env.example` contains placeholder only
- [x] `frontend/tests/e2e.mjs` reads `PRIVATE_KEY` from `.env` at runtime (never hardcoded)
- [x] `deployed.json` contains only public addresses + stay prices — safe to commit
- [x] npm audit (dev tooling only): **0 critical / 17 high / 10 moderate / 19 low** — all in Hardhat/ethers test tooling, not shipped bytecode; fix requires major bump `@nomicfoundation/hardhat-toolbox` v7.0.0

### 2. Access Control
- [x] `LandBatchFactory.createBatch` — `onlyAdmin` ✔
- [x] `LandBatch` admin/farmer functions (`distributeRevenue`, `claimMilestone`, `advanceYear`, `setGrowthStage`, `setFarmer`, `createMilestone`, `uploadClip`) — `onlyFarmerOrAdmin` / `onlyAdmin` ✔
- [x] `StayBooking.setPricePerNight` — `onlyOwner` ✔
- [x] **`MockUSDC.mint()` is permissionless** — **FIXED** (see Finding L-01)

### 3. Economic / Invariant Checks
- [x] **`LandBatch.executeSell` buyback solvency** — **FIXED** (see Finding H-01)
- [x] **`StayBooking` has no withdraw path for owner** — **FIXED** (see Finding H-02)
- [x] Partial-sell payout proration (anti-drain) — **FIXED**
- [x] Fixed-vs-variable return math, BPS math — reviewed, no overflow (Solidity 0.8.27 checked arithmetic)
- [x] `advanceYear` / `stageForYear` / crop-cycle rollover logic — reviewed

### 4. Reentrancy
- [x] Checks-Effects-Interactions (CEI) reviewed:
  - `LandBatch.executeSell` — state updated before external `usdc.transfer` ✔
  - `LandBatch.claimRevenue` — `pendingRevenue` zeroed before transfer ✔
  - `LandBatch.distributeRevenue` — farmer share sent last ✔
  - `StayBooking.cancelStay` — state cleared before refund ✔
- [x] No external-call-into-untrusted-contract patterns
- [x] USDC is a plain ERC20 (no hooks) → reentrancy surface minimal
- [x] `ReentrancyGuard` added to all state-changing external functions — **FIXED** (see Finding L-02)

### 5. Overflow / Underflow
- [x] Solidity `^0.8.27` — checked arithmetic everywhere (no `unchecked` blocks)
- [x] `day + i` in StayBooking bounded by `MAX_NIGHTS = 7` ✔
- [x] `yearsHeld` uses `(block.timestamp - plantingDate)` — safe ordering (plantingDate set in constructor)

### 6. Front-Running / Griefing
- [x] `StayBooking.cancelStay` — no time cutoff — **FIXED** (see Finding L-03)
- [x] `LandBatch` fixed-price, no oracle → no sandwich vector
- [x] `LandBatch.distributeRevenue` unbounded loop — **FIXED** (see Finding M-01)

---

## Findings

### H-01 — `executeSell` could brick (buyback reserve insolvency) — **FIXED**
**Location:** `LandBatch.sol`
**Original:** `buybackReserve` accrued only **10%** of each purchase, but `executeSell` paid out **100% of invested + 1%/yr appreciation**. Beyond ~9% of total redemptions, sells reverted permanently — locking all remaining investor funds.
**Fix applied:** reserve now accrues the **full** `usdcAmount`; `executeSell` also verifies the contract's real USDC balance. Appreciation is capped at `cropCycleYears` (1%/yr, max cycle length). Milestone and revenue claims are guarded with `balance >= buybackReserve + amount`, so principal is always covered.
**Regression test:** `full reserve means a single investor can always exit (no 9% brick)`, `milestone cannot drain below the buyback reserve`.

### H-02 — `StayBooking` collected payments but had no owner withdraw — **FIXED**
**Original:** No `withdraw` existed; all booking fees were permanently trapped.
**Fix applied:** `withdraw(uint256)` (`onlyOwner`) pays from the free balance; `refundableReserve` tracks outstanding refunds so the owner can never sweep money owed to guests. `settleStay` releases refunds for stays whose check-in day has passed.
**Regression test:** `owner withdraw only from free balance (refunds protected)`, `settleStay releases refund reserve`.

### M-01 — `distributeRevenue` unbounded double loop — **FIXED**
**Original:** Two passes over an ever-growing `investorList` (never pruned).
**Fix applied:** single pass using tracked `totalInvestedSum`; zeroed investors are skipped. Loop is now O(active investors) instead of O(2×list).
**Note:** a full pull-based (merkle/checkpoint) payout is the long-term answer for very large investor counts.

### L-01 — `MockUSDC.mint` was permissionless — **FIXED**
**Fix applied:** `mint` is `onlyOwner`. `faucet()` (one-per-address) remains public for demo minting.
**Regression test:** `non-owner cannot mint (previously permissionless)`.

### L-02 — No `ReentrancyGuard` — **FIXED**
**Fix applied:** `ReentrancyGuard` added to `buyTokens`/`executeSell`/`distributeRevenue`/`claimRevenue`/`claimMilestone` in LandBatch and `bookStay`/`cancelStay`/`withdraw` in StayBooking. CEI already correct.

### L-03 — `cancelStay` had no cutoff (free griefing) — **FIXED**
**Fix applied:** cancellation is rejected on or after check-in day (`Too late to cancel`), preventing book-then-cancel blocking at no cost.
**Regression test:** `cannot cancel on or after check-in day (anti-griefing)`.

### New bug found during audit — partial-sell payout drain — **FIXED**
**Location:** `LandBatch.executeSell` (original paid out the investor's **full** `totalInvested` regardless of how many tokens were being sold).
**Fix applied:** payout is proportional to the sold fraction; `tokenAmount` is tracked per investor; sold tokens are burned and `pendingRevenue` is pro-rated.
**Regression test:** `partial sell pays only the proportional principal (anti-drain)`.

### New bug found during audit — `isFixedReturn` overwritten on each buy — **FIXED**
**Location:** `LandBatch.buyTokens` (a variable-return investor who later buys again was silently reclassified as fixed).
**Fix applied:** the flag is only set on the first purchase (when `totalInvested == 0`).

---

## Summary

| Severity | Original | Fixed |
|---|---|---|
| Critical | 0 | 0 |
| High | 2 | 0 |
| Medium | 1 | 0 |
| Low | 3 | 0 |

**Every finding has been fixed and locked in with regression tests. 51 tests passing (including 6 attack-regression tests).** No secrets exposed. All deployments are testnet-only.

**Remaining (by design, testnet):**
- Admin/farmer key is a trusted operator (can `setFarmer`, distribute revenue, advance years). Documented trust model.
- `distributeRevenue` still loops active investors — acceptable at current scale; pull-based payouts are the long-term fix.
- Appreciation (1%/yr) is paid from surplus; if a batch has a single investor and zero revenue, appreciation is capped by the contract's actual balance check.

---

*Audit performed 2026-08-16. Methodology: gstack CSO workflow — secrets archaeology, dependency audit, access-control review, OWASP/STRIDE-style analysis, reentrancy review, arithmetic/overflow review, front-running review, active source verification of every finding.*
