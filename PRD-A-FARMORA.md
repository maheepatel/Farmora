# Farmora — PRD for Person A: Chain / Smart Contracts (Monad Testnet)

> **Role:** Person A builds everything on-chain: contracts, deploy to Monad Testnet, unit tests, and the e2e harness.
> **Chain:** Monad Testnet — EVM-equivalent, chain ID `10143`, native token `MON`, explorer `testnet.monadscan.com`, RPC `https://testnet-rpc.monad.xyz`, faucet `https://faucet.monad.xyz`.
> **Self-sufficient:** everything in this file is enough for an AI agent to build your part perfectly. No other files needed.
> **Parallel partner:** Person B (frontend) — see interface contract §10. You never edit frontend files.

---

## 1. What You Deliver

1. `contracts/` repo: 4 Solidity contracts + Hardhat config + deploy scripts + unit tests.
2. **Deployment to Monad Testnet (chain 10143)** of MockUSDC, LandBatchFactory, 8 seed LandBatches, StayBooking — verified on Monadscan.
3. `contracts/deployed.json` — the machine-readable deployment record (Person B consumes it).
4. `frontend/tests/e2e.mjs` — the end-to-end test harness (adapted to Monad).
5. Updated `frontend/src/lib/config.ts` values ONLY via `deployed.json` (structure owned by B).

## 2. Monad Testnet Reference (for this build)

| Item | Value |
|---|---|
| Chain ID | `10143` (hex `0x279f`) |
| Native token | `MON` (gas only — product money stays in mUSDC) |
| Primary RPC | `https://testnet-rpc.monad.xyz` |
| Alt RPCs | `https://rpc-testnet.monadinfra.com`, `https://rpc.ankr.com/monad_testnet`, `https://10143.rpc.thirdweb.com` |
| Explorer | `https://testnet.monadscan.com` |
| Gas faucet | `https://faucet.monad.xyz` (fallbacks: QuickNode faucet, OpenBuild faucet) |
| Mainnet (NOT now) | chain `143`, `https://rpc.monad.xyz` |

## 3. contracts/package.json

```json
{
  "name": "farmland-contracts",
  "version": "1.0.0",
  "scripts": {
    "compile": "hardhat compile",
    "test": "hardhat test",
    "deploy": "hardhat run scripts/deploy.ts --network monadTestnet",
    "deploy:stays": "hardhat run scripts/deploy-stays.ts --network monadTestnet"
  },
  "devDependencies": {
    "@nomicfoundation/hardhat-toolbox": "^5.0.0",
    "@types/node": "^20.0.0",
    "hardhat": "^2.22.0",
    "ts-node": "^10.9.0",
    "typescript": "^5.4.0"
  },
  "dependencies": {
    "@openzeppelin/contracts": "^5.0.0",
    "dotenv": "^17.4.2"
  }
}
```

`contracts/.env` (never commit):
```
PRIVATE_KEY=0x<your-deployer-private-key>
```

## 4. contracts/hardhat.config.ts

```ts
import { config as dotenvConfig } from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

dotenvConfig();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.27",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  networks: {
    monadTestnet: {
      url: "https://testnet-rpc.monad.xyz",
      chainId: 10143,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 10143,
    },
  },
};

export default config;
```

## 5. Smart Contract Sources (verbatim — do not change)

### 5.1 contracts/MockUSDC.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20 {
    uint256 public constant FAUCET_AMOUNT = 50_000 * 10 ** 18;
    mapping(address => bool) public hasClaimed;

    constructor() ERC20("MockUSDC", "mUSDC") {
        _mint(msg.sender, 10_000_000 * 10 ** 18);
    }

    function faucet() external {
        require(!hasClaimed[msg.sender], "Already claimed");
        hasClaimed[msg.sender] = true;
        _mint(msg.sender, FAUCET_AMOUNT);
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
```

### 5.2 contracts/LandBatch.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./MockUSDC.sol";

contract LandBatch is ERC20 {
    MockUSDC public usdc;

    address public farmer;
    address public admin;

    string public cropType;
    uint256 public totalAcres;
    uint256 public pricePerToken;
    uint256 public plantingDate;
    uint256 public currentYear;
    uint256 public investorShareBps;
    uint256 public buybackReserve;
    uint256 public fixedReturnBps;
    uint256 public totalRevenueDistributed;

    enum GrowthStage { Seedling, Vegetative, Flowering, Fruiting, HarvestReady }
    GrowthStage public growthStage;

    uint256 public cropCycleYears;
    uint256 public cropNumber;

    uint256 public constant SHARE_DECREASE_PER_YEAR = 500;
    uint256 public constant INITIAL_INVESTOR_SHARE = 7000;
    uint256 public constant BUYBACK_RESERVE_PCT = 10;
    uint256 public constant APPRECIATION_PCT_PER_YEAR = 100;
    uint256 public constant SELL_COOLDOWN = 90 days;
    uint256 public constant BPS_DENOM = 10000;

    struct InvestorInfo {
        bool isFixedReturn;
        uint256 totalInvested;
        uint256 claimedRevenue;
        uint256 pendingRevenue;
    }

    struct SellRequest {
        uint256 tokenAmount;
        uint256 requestTime;
        bool active;
    }

    struct Milestone {
        string name;
        uint256 amount;
        uint256 startDay;
        uint256 endDay;
        bool claimed;
    }

    struct DailyClip {
        string url;
        uint256 timestamp;
    }

    mapping(address => InvestorInfo) public investors;
    mapping(address => SellRequest) public sellRequests;
    Milestone[] public milestones;
    DailyClip[] public clips;

    uint256 public soldTokens;
    uint256 public lockedTokens;
    address[] public investorList;
    mapping(address => bool) private inInvestorList;

    event TokensPurchased(address indexed buyer, uint256 amount, uint256 usdcAmount, bool isFixed);
    event SellRequested(address indexed seller, uint256 amount);
    event SellExecuted(address indexed seller, uint256 usdcAmount);
    event RevenueDistributed(uint256 totalAmount);
    event RevenueClaimed(address indexed investor, uint256 amount);
    event YearAdvanced(uint256 newYear, uint256 newInvestorShare);
    event CropPlanted(uint256 cropNumber);
    event GrowthStageUpdated(GrowthStage stage);
    event MilestoneCreated(uint256 index, string name, uint256 amount);
    event MilestoneClaimed(uint256 index, uint256 amount);
    event ClipUploaded(uint256 index, string url);
    event FarmerUpdated(address farmer);

    constructor(
        address _usdc,
        address _farmer,
        address _admin,
        string memory _cropType,
        uint256 _totalAcres,
        uint256 _pricePerToken,
        uint256 _totalSupply,
        uint256 _fixedReturnBps,
        uint256 _cropCycleYears
    ) ERC20(string(abi.encodePacked("LAND-", _cropType)), string(abi.encodePacked("L-", _cropType))) {
        require(_cropCycleYears > 0, "Cycle must be > 0");
        usdc = MockUSDC(_usdc);
        farmer = _farmer;
        admin = _admin;
        cropType = _cropType;
        totalAcres = _totalAcres;
        pricePerToken = _pricePerToken;
        plantingDate = block.timestamp;
        currentYear = 0;
        investorShareBps = INITIAL_INVESTOR_SHARE;
        growthStage = GrowthStage.Seedling;
        fixedReturnBps = _fixedReturnBps;
        cropCycleYears = _cropCycleYears;
        cropNumber = 1;

        _mint(address(this), _totalSupply);
    }

    modifier onlyFarmerOrAdmin() {
        require(msg.sender == farmer || msg.sender == admin, "Not farmer or admin");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    function buyTokens(uint256 tokenAmount, bool isFixedReturn) external {
        require(tokenAmount > 0, "Amount must be > 0");
        require(tokenAmount <= balanceOf(address(this)) - lockedTokens, "Not enough tokens left");

        uint256 usdcAmount = (tokenAmount * pricePerToken) / 1e18;
        require(usdc.transferFrom(msg.sender, address(this), usdcAmount), "USDC transfer failed");

        uint256 reserveAmount = (usdcAmount * BUYBACK_RESERVE_PCT) / 100;
        buybackReserve += reserveAmount;

        _transfer(address(this), msg.sender, tokenAmount);
        soldTokens += tokenAmount;

        if (!inInvestorList[msg.sender]) {
            inInvestorList[msg.sender] = true;
            investorList.push(msg.sender);
        }

        investors[msg.sender].isFixedReturn = isFixedReturn;
        investors[msg.sender].totalInvested += usdcAmount;

        emit TokensPurchased(msg.sender, tokenAmount, usdcAmount, isFixedReturn);
    }

    function requestSell(uint256 tokenAmount) external {
        require(tokenAmount > 0, "Amount must be > 0");
        require(balanceOf(msg.sender) >= tokenAmount, "Insufficient balance");
        require(!sellRequests[msg.sender].active, "Sell already requested");

        sellRequests[msg.sender] = SellRequest({
            tokenAmount: tokenAmount,
            requestTime: block.timestamp,
            active: true
        });

        _transfer(msg.sender, address(this), tokenAmount);
        lockedTokens += tokenAmount;

        emit SellRequested(msg.sender, tokenAmount);
    }

    function executeSell() external {
        SellRequest storage req = sellRequests[msg.sender];
        require(req.active, "No active sell request");
        require(block.timestamp >= req.requestTime + SELL_COOLDOWN, "Cooldown not passed");

        uint256 yearsHeld = (block.timestamp - plantingDate) / 365 days;
        if (yearsHeld == 0) yearsHeld = 1;

        uint256 invested = investors[msg.sender].totalInvested;
        uint256 appreciationAmount = (invested * yearsHeld * APPRECIATION_PCT_PER_YEAR) / BPS_DENOM;
        uint256 totalReturn = invested + appreciationAmount;

        require(buybackReserve >= totalReturn, "Insufficient buyback reserve");

        buybackReserve -= totalReturn;
        req.active = false;
        soldTokens -= req.tokenAmount;
        lockedTokens -= req.tokenAmount;

        _burn(address(this), req.tokenAmount);

        investors[msg.sender].totalInvested = 0;
        investors[msg.sender].pendingRevenue = 0;

        require(usdc.transfer(msg.sender, totalReturn), "USDC transfer failed");

        emit SellExecuted(msg.sender, totalReturn);
    }

    function distributeRevenue(uint256 totalRevenue) external onlyFarmerOrAdmin {
        require(totalRevenue > 0, "Revenue must be > 0");
        require(usdc.transferFrom(msg.sender, address(this), totalRevenue), "USDC transfer failed");

        totalRevenueDistributed += totalRevenue;

        uint256 investorPool = (totalRevenue * investorShareBps) / BPS_DENOM;
        uint256 farmerShare = totalRevenue - investorPool;

        uint256 totalInvested = 0;
        for (uint256 i = 0; i < investorList.length; i++) {
            totalInvested += investors[investorList[i]].totalInvested;
        }

        if (totalInvested > 0) {
            for (uint256 i = 0; i < investorList.length; i++) {
                address inv = investorList[i];
                if (investors[inv].totalInvested > 0) {
                    uint256 share = (investorPool * investors[inv].totalInvested) / totalInvested;
                    investors[inv].pendingRevenue += share;

                    if (investors[inv].isFixedReturn) {
                        uint256 fixedReturn = (investors[inv].totalInvested * fixedReturnBps) / BPS_DENOM;
                        uint256 totalEarned = investors[inv].claimedRevenue + investors[inv].pendingRevenue;
                        if (totalEarned > fixedReturn) {
                            uint256 excess = totalEarned - fixedReturn;
                            if (excess > investors[inv].pendingRevenue) {
                                excess = investors[inv].pendingRevenue;
                            }
                            investors[inv].pendingRevenue -= excess;
                            farmerShare += excess;
                        }
                    }
                }
            }
        }

        require(usdc.transfer(farmer, farmerShare), "Farmer USDC transfer failed");

        emit RevenueDistributed(totalRevenue);
    }

    function claimRevenue() external {
        uint256 amount = investors[msg.sender].pendingRevenue;
        require(amount > 0, "No pending revenue");

        investors[msg.sender].pendingRevenue = 0;
        investors[msg.sender].claimedRevenue += amount;

        require(usdc.transfer(msg.sender, amount), "USDC transfer failed");

        emit RevenueClaimed(msg.sender, amount);
    }

    function advanceYear() external onlyAdmin {
        currentYear++;
        if (currentYear > cropCycleYears) {
            currentYear = 0;
            cropNumber++;
            investorShareBps = INITIAL_INVESTOR_SHARE;
            growthStage = GrowthStage.Seedling;
            plantingDate = block.timestamp;
            emit CropPlanted(cropNumber);
            emit GrowthStageUpdated(growthStage);
            emit YearAdvanced(currentYear, investorShareBps);
            return;
        }
        growthStage = stageForYear(currentYear);
        emit GrowthStageUpdated(growthStage);
        emit YearAdvanced(currentYear, investorShareBps);
    }

    function stageForYear(uint256 year) public view returns (GrowthStage) {
        if (year == 0) return GrowthStage.Seedling;
        if (year >= cropCycleYears) return GrowthStage.HarvestReady;
        uint256 mid = (year * 3) / cropCycleYears;
        if (mid == 0) return GrowthStage.Vegetative;
        if (mid == 1) return GrowthStage.Flowering;
        return GrowthStage.Fruiting;
    }

    function setGrowthStage(GrowthStage _stage) external onlyAdmin {
        growthStage = _stage;
        emit GrowthStageUpdated(_stage);
    }

    function createMilestone(string calldata _name, uint256 _amount, uint256 _startDay, uint256 _endDay) external onlyAdmin {
        milestones.push(Milestone({
            name: _name,
            amount: _amount,
            startDay: _startDay,
            endDay: _endDay,
            claimed: false
        }));
        emit MilestoneCreated(milestones.length - 1, _name, _amount);
    }

    function claimMilestone(uint256 index) external onlyFarmerOrAdmin {
        require(index < milestones.length, "Invalid milestone");
        Milestone storage m = milestones[index];
        require(!m.claimed, "Already claimed");

        uint256 daysSincePlanting = (block.timestamp - plantingDate) / 1 days;
        require(daysSincePlanting >= m.startDay, "Too early");
        require(daysSincePlanting <= m.endDay || m.endDay == 0, "Too late");

        m.claimed = true;
        require(usdc.transfer(farmer, m.amount), "USDC transfer failed");

        emit MilestoneClaimed(index, m.amount);
    }

    function uploadClip(string calldata _url) external onlyFarmerOrAdmin {
        clips.push(DailyClip({ url: _url, timestamp: block.timestamp }));
        emit ClipUploaded(clips.length - 1, _url);
    }

    function setFarmer(address _farmer) external onlyAdmin {
        require(_farmer != address(0), "Invalid address");
        farmer = _farmer;
        emit FarmerUpdated(_farmer);
    }

    function getClips() external view returns (DailyClip[] memory) {
        return clips;
    }

    function getMilestones() external view returns (Milestone[] memory) {
        return milestones;
    }

    function getInvestorInfo(address _investor) external view returns (InvestorInfo memory) {
        return investors[_investor];
    }

    function getCurrentInvestorShare() external view returns (uint256) {
        return investorShareBps;
    }

    function getAvailableTokens() external view returns (uint256) {
        return balanceOf(address(this)) - lockedTokens;
    }

    function getSellRequest(address _investor) external view returns (SellRequest memory) {
        return sellRequests[_investor];
    }
}
```

### 5.3 contracts/LandBatchFactory.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "./LandBatch.sol";

contract LandBatchFactory {
    address public admin;
    address public usdc;

    LandBatch[] public batches;

    event BatchCreated(address indexed batchAddress, uint256 index, string cropType, uint256 totalAcres);

    constructor(address _usdc) {
        admin = msg.sender;
        usdc = _usdc;
    }

    function createBatch(
        address _farmer,
        string memory _cropType,
        uint256 _totalAcres,
        uint256 _pricePerToken,
        uint256 _totalSupply,
        uint256 _fixedReturnBps,
        uint256 _cropCycleYears
    ) external returns (address) {
        require(msg.sender == admin, "Only admin");

        LandBatch batch = new LandBatch(
            usdc,
            _farmer,
            msg.sender,
            _cropType,
            _totalAcres,
            _pricePerToken,
            _totalSupply,
            _fixedReturnBps,
            _cropCycleYears
        );

        batches.push(batch);
        emit BatchCreated(address(batch), batches.length - 1, _cropType, _totalAcres);

        return address(batch);
    }

    function getBatchCount() external view returns (uint256) {
        return batches.length;
    }

    function getBatches() external view returns (LandBatch[] memory) {
        return batches;
    }
}
```

### 5.4 contracts/StayBooking.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./MockUSDC.sol";

contract StayBooking is Ownable {
    struct Stay {
        address booker;
        uint256 nights;
        uint256 guests;
        uint256 pricePerNight;
        uint256 bookedAt;
    }

    struct UserStay {
        uint256 batchId;
        uint256 day;
    }

    MockUSDC public usdc;

    mapping(uint256 => mapping(uint256 => Stay)) public stays;
    mapping(uint256 => mapping(uint256 => bool)) public nightTaken;
    mapping(uint256 => uint256) public pricePerNight;
    mapping(address => UserStay[]) public userBookings;

    uint256 public constant MAX_NIGHTS = 7;
    uint256 public constant MAX_GUESTS = 8;

    event StayBooked(
        uint256 indexed batchId,
        uint256 indexed day,
        address indexed booker,
        uint256 nights,
        uint256 guests,
        uint256 total
    );
    event StayCancelled(uint256 indexed batchId, uint256 indexed day, address indexed booker);
    event StayPriceSet(uint256 indexed batchId, uint256 price);

    constructor(address _usdc) Ownable(msg.sender) {
        usdc = MockUSDC(_usdc);
    }

    function bookStay(uint256 batchId, uint256 day, uint256 nights, uint256 guests) external {
        require(day >= block.timestamp / 1 days, "Day already past");
        require(nights > 0 && nights <= MAX_NIGHTS, "Nights out of range");
        require(guests > 0 && guests <= MAX_GUESTS, "Guests out of range");

        uint256 price = pricePerNight[batchId];
        require(price > 0, "Price not set");

        require(!nightTaken[batchId][day], "Stay already booked");
        for (uint256 i = 1; i < nights; i++) {
            require(!nightTaken[batchId][day + i], "Stay already booked");
        }

        uint256 total = price * nights;
        require(usdc.transferFrom(msg.sender, address(this), total), "USDC transfer failed");

        for (uint256 i = 0; i < nights; i++) {
            nightTaken[batchId][day + i] = true;
        }

        stays[batchId][day] = Stay({
            booker: msg.sender,
            nights: nights,
            guests: guests,
            pricePerNight: price,
            bookedAt: block.timestamp
        });

        userBookings[msg.sender].push(UserStay({ batchId: batchId, day: day }));

        emit StayBooked(batchId, day, msg.sender, nights, guests, total);
    }

    function cancelStay(uint256 batchId, uint256 day) external {
        Stay memory s = stays[batchId][day];
        require(s.booker == msg.sender, "Not the booker");
        require(s.bookedAt > 0, "No stay to cancel");

        for (uint256 i = 0; i < s.nights; i++) {
            nightTaken[batchId][day + i] = false;
        }

        uint256 refund = s.pricePerNight * s.nights;

        UserStay[] storage mine = userBookings[msg.sender];
        for (uint256 i = 0; i < mine.length; i++) {
            if (mine[i].batchId == batchId && mine[i].day == day) {
                mine[i] = mine[mine.length - 1];
                mine.pop();
                break;
            }
        }

        delete stays[batchId][day];
        require(usdc.transfer(msg.sender, refund), "USDC transfer failed");

        emit StayCancelled(batchId, day, msg.sender);
    }

    function isBooked(uint256 batchId, uint256 day) external view returns (bool) {
        return nightTaken[batchId][day];
    }

    function getBooker(uint256 batchId, uint256 day) external view returns (address) {
        return stays[batchId][day].booker;
    }

    function getStay(uint256 batchId, uint256 day) external view returns (Stay memory) {
        return stays[batchId][day];
    }

    function getUserBookings(address booker) external view returns (UserStay[] memory) {
        return userBookings[booker];
    }

    function setPricePerNight(uint256 batchId, uint256 price) external onlyOwner {
        pricePerNight[batchId] = price;
        emit StayPriceSet(batchId, price);
    }
}
```

## 6. Seed Batch Configuration (single source of truth)

| id | cropType | acres | totalSupply (tokens) | pricePerToken (mUSDC) | fixedReturnBps | cropCycleYears |
|---:|----------|------:|---------------------:|----------------------:|---------------:|---------------:|
| 0 | Saffron | 1 | 40000 | 1 | 1000 | 1 |
| 1 | Cordyceps | 1 | 40000 | 1 | 1400 | 1 |
| 2 | Mushroom | 1 | 25000 | 1 | 1200 | 1 |
| 3 | Dragon Fruit | 2 | 30000 | 1 | 1200 | 2 |
| 4 | Pomegranate | 5 | 60000 | 1 | 900 | 3 |
| 5 | Grapes | 5 | 100000 | 1 | 900 | 3 |
| 6 | Turmeric | 5 | 40000 | 1 | 800 | 1 |
| 7 | Ginger | 5 | 50000 | 1 | 900 | 1 |

`pricePerToken = 1` means 1 mUSDC per LAND token (18 decimals, `parseUnits("1", 18)`). Total supply uses `parseUnits(String(supply), 18)`.

Stay prices per night (mUSDC, 18 decimals), set on StayBooking after deploy:
`[350, 300, 180, 300, 250, 320, 150, 150]` for batches 0–7.

## 7. Deploy Scripts

### 7.1 contracts/scripts/deploy.ts (deploys MockUSDC + Factory + 8 batches, writes deployed.json)

```ts
import { ethers } from "hardhat";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const BATCHES = [
  { cropType: "Saffron",      acres: 1, supply: "40000",  fixedReturnBps: 1000, cropCycleYears: 1 },
  { cropType: "Cordyceps",    acres: 1, supply: "40000",  fixedReturnBps: 1400, cropCycleYears: 1 },
  { cropType: "Mushroom",     acres: 1, supply: "25000",  fixedReturnBps: 1200, cropCycleYears: 1 },
  { cropType: "Dragon Fruit", acres: 2, supply: "30000",  fixedReturnBps: 1200, cropCycleYears: 2 },
  { cropType: "Pomegranate",  acres: 5, supply: "60000",  fixedReturnBps: 900,  cropCycleYears: 3 },
  { cropType: "Grapes",       acres: 5, supply: "100000", fixedReturnBps: 900,  cropCycleYears: 3 },
  { cropType: "Turmeric",     acres: 5, supply: "40000",  fixedReturnBps: 800,  cropCycleYears: 1 },
  { cropType: "Ginger",       acres: 5, supply: "50000",  fixedReturnBps: 900,  cropCycleYears: 1 },
];

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log("MockUSDC:", usdcAddress);

  const Factory = await ethers.getContractFactory("LandBatchFactory");
  const factory = await Factory.deploy(usdcAddress);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("Factory:", factoryAddress);

  const batchAddresses: string[] = [];
  for (const b of BATCHES) {
    const tx = await factory.createBatch(
      deployer.address,
      b.cropType,
      b.acres,
      ethers.parseUnits("1", 18),
      ethers.parseUnits(b.supply, 18),
      b.fixedReturnBps,
      b.cropCycleYears
    );
    await tx.wait();
    const count = await factory.getBatchCount();
    const addr = await factory.batches(count - 1n);
    batchAddresses.push(addr);
    console.log(`Batch ${batchAddresses.length - 1}: ${b.cropType} @ ${addr}`);
  }

  const record = {
    chainId: 10143,
    chainName: "Monad Testnet",
    deployedAt: new Date().toISOString(),
    mockUSDC: usdcAddress,
    factory: factoryAddress,
    stayBooking: "", // filled by deploy-stays.ts
    batches: batchAddresses,
    stayPrices: [350, 300, 180, 300, 250, 320, 150, 150],
  };

  mkdirSync(join(__dirname, ".."), { recursive: true });
  writeFileSync(join(__dirname, "..", "deployed.json"), JSON.stringify(record, null, 2));
  console.log("\nWrote contracts/deployed.json");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
```

### 7.2 contracts/scripts/deploy-stays.ts (deploys StayBooking, sets prices, updates deployed.json)

```ts
import { ethers } from "hardhat";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

async function main() {
  const recordPath = join(__dirname, "..", "deployed.json");
  const record = JSON.parse(readFileSync(recordPath, "utf8"));

  const [deployer] = await ethers.getSigners();
  console.log("Deploying StayBooking with account:", deployer.address);

  const StayBooking = await ethers.getContractFactory("StayBooking");
  const booking = await StayBooking.deploy(record.mockUSDC);
  await booking.waitForDeployment();
  const bookingAddress = await booking.getAddress();
  console.log("StayBooking:", bookingAddress);

  for (let i = 0; i < record.stayPrices.length; i++) {
    const price = ethers.parseUnits(String(record.stayPrices[i]), 18);
    const tx = await booking.setPricePerNight(i, price);
    await tx.wait();
    console.log(`Price batch ${i}: ${record.stayPrices[i]} mUSDC/night`);
  }

  record.stayBooking = bookingAddress;
  writeFileSync(recordPath, JSON.stringify(record, null, 2));
  console.log("\nUpdated contracts/deployed.json");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
```

### 7.3 Deployment Runbook (Monad Testnet)

1. `cd contracts && npm install`
2. `npx hardhat compile` → must succeed with no errors (Solc 0.8.27).
3. Get test MON for gas: visit `https://faucet.monad.xyz` (or QuickNode/OpenBuild faucets), send to the deployer address. Verify with `eth_getBalance` on the RPC.
4. `npm run deploy` → deploys MockUSDC, Factory, 8 batches; writes `deployed.json`.
5. `npm run deploy:stays` → deploys StayBooking + prices; updates `deployed.json`.
6. Verify every address on `https://testnet.monadscan.com` (chain 10143): contract creation, correct constructor args, token symbols (`LAND-Saffron`/`L-Saffron`, etc.), batch registry (`factory.batches(0..7)`), stay prices.
7. **Commit `deployed.json`** — Person B consumes it.

## 8. Unit Tests (contracts/test/) — required coverage

Write Hardhat tests (chai + ethers) covering at minimum:

1. **MockUSDC**: faucet mints 50,000 once per address; second faucet reverts; admin mint works.
2. **Buy**: buyer pays mUSDC → receives tokens; 10% goes to buybackReserve; `getAvailableTokens` decreases; price = tokens × pricePerToken.
3. **Sell**: requestSell locks tokens + sets cooldown; executeSell reverts before 90 days; after time advance, pays principal + 1%/yr and burns tokens; insufficient reserve reverts.
4. **Revenue**: distribute splits by investorShareBps; two investors split proportionally to invested; fixed-return investor is capped; claimRevenue pays pending and zeroes it.
5. **Milestones**: create → claim within window → reverts before startDay/after endDay → cannot claim twice.
6. **Clips**: uploadClip appends; only farmer/admin.
7. **advanceYear**: increments year + stage; past cropCycleYears replants (cropNumber++, share reset to 7000).
8. **Factory**: only admin creates batches; registry correct.
9. **Stays**: book pays mUSDC + marks nights; double-book same day reverts; cancel refunds full amount + frees nights; guest/night limits.

Use `network.increaseTime` / `evm_increaseTime` for the 90-day cooldown.

## 9. E2E Harness (frontend/tests/e2e.mjs)

> Owned by Person A. Requires the dev server running on `http://localhost:3000` (Person B) and reads addresses from `contracts/deployed.json`. Adapt the reference below: replace the RPC/chain constants with Monad values and the address constants with `deployed.json` values.

`contracts/deployed.json` is consumed by the script — constants become:
- `RPC = "https://testnet-rpc.monad.xyz"`, `CHAIN_ID = 10143`, `chainId hex "0x279f"`.
- `USDC_ADDR`, batch addresses, `STAY_ADDR` from `deployed.json`.
- Page check for `/add-tokens` changes `"Arc Testnet"` → `"Monad Testnet"`.

Full harness (reference — the current ARC one with Monad adaptation applied; edit only the constants):

```js
/**
 * E2E for Farmora on Monad Testnet (chain 10143).
 * Requires dev server on http://localhost:3000 and contracts/deployed.json.
 * Run: node frontend/tests/e2e.mjs
 */
import puppeteer from "puppeteer-core";
import { privateKeyToAccount } from "viem/accounts";
import { encodeFunctionData, toFunctionSelector } from "viem";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RPC = "https://testnet-rpc.monad.xyz";
const CHAIN_ID = 10143;
const CHAIN_ID_HEX = "0x279f";
const NET_VERSION = String(10143);

const deployed = JSON.parse(readFileSync(join(__dirname, "..", "..", "contracts", "deployed.json"), "utf8"));
const USDC_ADDR = deployed.mockUSDC;
const BATCH_ADDRESSES = deployed.batches;
const STAY_ADDR = deployed.stayBooking;

const env = readFileSync(join(__dirname, "..", "..", "contracts", ".env"), "utf8");
const privKeyMatch = env.match(/PRIVATE_KEY\s*=\s*(0x[0-9a-fA-F]{64})/);
if (!privKeyMatch) { console.error("PRIVATE_KEY not found in contracts/.env"); process.exit(1); }
const account = privateKeyToAccount(privKeyMatch[1]);
const WALLET = account.address;
console.log(`Testing as wallet: ${WALLET}`);

const USDC_BAL_SEL = "0x70a08231000000000000000000000000" + WALLET.slice(2).toLowerCase();
const FAUCET_SEL = "0x3d7d3f5a";

const rpc = async (method, params = []) => {
  const r = await fetch(RPC, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const j = await r.json();
  if (j.error) throw new Error(`${method}: ${j.error.message}`);
  return j.result;
};

const bridge = async (method, params) => {
  if (method === "eth_chainId") return CHAIN_ID_HEX;
  if (method === "net_version") return NET_VERSION;
  if (method === "eth_accounts" || method === "eth_requestAccounts" || method === "eth_coinbase")
    return method === "eth_coinbase" ? WALLET : [WALLET];
  if (method === "wallet_switchEthereumChain" || method === "wallet_addEthereumChain") return null;
  if (method === "eth_feeHistory")
    return { oldestBlock: "0x1", baseFeePerGas: ["0x3b9aca00"], reward: [["0x0"]] };
  if (method === "eth_sendTransaction") {
    const tx = params[0];
    const nonce = tx.nonce ?? (await rpc("eth_getTransactionCount", [WALLET, "pending"]));
    const gasPrice = tx.gasPrice ?? (await rpc("eth_gasPrice", []));
    let gas = tx.gas;
    if (!gas) {
      try {
        gas = await rpc("eth_estimateGas", [{ from: WALLET, to: tx.to, data: tx.data, value: tx.value ?? "0x0" }]);
      } catch { gas = "0x5208"; }
    }
    const signed = await account.signTransaction({
      type: "legacy", chainId: CHAIN_ID, to: tx.to, data: tx.data,
      value: tx.value ? BigInt(tx.value) : 0n, gasPrice: BigInt(gasPrice),
      gas: BigInt(gas), nonce: BigInt(nonce),
    });
    console.log(`  [SIGNED ${tx.data.slice(0, 10)}... -> ${tx.to.slice(0, 8)}]`);
    return rpc("eth_sendRawTransaction", [signed]);
  }
  return rpc(method, params);
};

async function injectWallet(page) {
  await page.exposeFunction("__rpcBridge", bridge);
  await page.evaluateOnNewDocument(({ wallet, chainIdHex, netVer }) => {
    window.ethereum = {
      isMetaMask: true, chainId: chainIdHex, networkVersion: netVer, selectedAddress: wallet,
      on: () => {}, removeListener: () => {},
      request: async ({ method, params }) => window.__rpcBridge(method, params),
      _state: { accounts: [], initialized: true, isConnected: true, isPermanentlyDisconnected: false },
      _emit: () => {},
    };
  }, { wallet: WALLET, chainIdHex: CHAIN_ID_HEX, netVer: NET_VERSION });
}

async function typeInto(page, selector, value) {
  await page.evaluate(({ selector, value }) => {
    const el = document.querySelector(selector);
    if (!el) throw new Error(`input not found: ${selector}`);
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    setter.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }, { selector, value });
}

async function waitForText(page, substr, timeoutMs = 150000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const text = await page.evaluate(() => document.body?.innerText ?? "");
    if (text.includes(substr)) return true;
    await new Promise((r) => setTimeout(r, 3000));
  }
  return false;
}

async function waitForSelector(page, selector, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const found = await page.evaluate((sel) => !!document.querySelector(sel), selector);
    if (found) return true;
    await new Promise((r) => setTimeout(r, 2000));
  }
  return false;
}

const isHmrNoise = (text) => text.includes("_next/webpack-hmr");

async function ensureFunded(minUnits = 1000n) {
  const balHex = await rpc("eth_call", [{ to: USDC_ADDR, data: USDC_BAL_SEL }, "latest"]);
  const bal = BigInt(balHex || "0x0");
  if (bal >= minUnits * BigInt(10) ** BigInt(18)) return;
  const gasPrice = await rpc("eth_gasPrice", []);
  const nonce = await rpc("eth_getTransactionCount", [WALLET, "pending"]);
  const signed = await account.signTransaction({
    type: "legacy", chainId: CHAIN_ID, to: USDC_ADDR, data: FAUCET_SEL,
    value: 0n, gasPrice: BigInt(gasPrice), gas: 100000n, nonce: BigInt(nonce),
  });
  const hash = await rpc("eth_sendRawTransaction", [signed]);
  const t0 = Date.now();
  while (Date.now() - t0 < 30000) {
    const rc = await rpc("eth_getTransactionReceipt", [hash]).catch(() => null);
    if (rc && rc.status === "0x1") break;
    await new Promise((r) => setTimeout(r, 2000));
  }
  console.log("  [FAUCET minted mUSDC]");
}

let failed = 0;
const report = (name, ok, extra = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? " — " + extra : ""}`);
  if (!ok) failed++;
};

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox"] });

// Test 1: pages render, no console errors
const pages = [
  { path: "/", checks: ["The farm is real", "The harvests, as they stand now"] },
  { path: "/marketplace", checks: ["Farm Marketplace", "Saffron"] },
  { path: "/portfolio", checks: ["Cropfolio"] },
  { path: "/batch/0", checks: ["Saffron"] },
  { path: "/admin", checks: ["Farm Ops", "Tokens Sold"] },
  { path: "/stays", checks: ["Farm Stays"] },
  { path: "/add-tokens", checks: ["token registry", "mUSDC", "Monad Testnet"] },
];
for (const { path, checks } of pages) {
  const page = await browser.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error" && !isHmrNoise(m.text())) errors.push(m.text().slice(0, 200)); });
  page.on("pageerror", (e) => errors.push("PAGEERROR: " + String(e).slice(0, 200)));
  await injectWallet(page);
  await page.goto(`http://localhost:3000${path}`, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 6000));
  const text = (await page.evaluate(() => document.body.innerText)).toLowerCase();
  const all = checks.every((c) => text.includes(c.toLowerCase()));
  report(`page ${path} renders`, all, checks.filter((c) => !text.includes(c.toLowerCase())).join(", "));
  report(`page ${path} no console errors`, errors.length === 0, errors[0] || "");
  await page.close();
}

// Test 1b: landing renders wallet-off
{
  const page = await browser.newPage();
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 6000));
  const text = (await page.evaluate(() => document.body.innerText)).toLowerCase();
  report("landing renders wallet-off", text.includes("the farm is real"), "");
  await page.close();
}

// Test 1c: return estimator on all 8 batch pages
const BATCH_CROPS = ["Saffron", "Cordyceps", "Mushroom", "Dragon Fruit", "Pomegranate", "Grapes", "Turmeric", "Ginger"];
for (let i = 0; i < BATCH_CROPS.length; i++) {
  const page = await browser.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error" && !isHmrNoise(m.text())) errors.push(m.text().slice(0, 200)); });
  page.on("pageerror", (e) => errors.push("PAGEERROR: " + String(e).slice(0, 200)));
  await injectWallet(page);
  await page.goto(`http://localhost:3000/batch/${i}`, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 6000));
  const lower = (await page.evaluate(() => document.body.innerText)).toLowerCase();
  const titleOk = lower.includes(BATCH_CROPS[i].toLowerCase());
  const estOk = lower.includes("return estimator") && ["2023", "2024", "2025", "2026"].every((y) => lower.includes(y))
    && lower.includes("4-yr total") && lower.includes("estimated next year");
  report(`estimator ${BATCH_CROPS[i]} (batch/${i})`, titleOk && estOk, `${titleOk ? "" : "title "}${estOk ? "" : "estimator/table"}`);
  report(`estimator ${BATCH_CROPS[i]} no console errors`, errors.length === 0, errors[0] || "");
  await page.close();
}

// Test 2: buy flow (pick a batch with available tokens)
const BATCH_TPA = [40000, 40000, 25000, 15000, 12000, 20000, 8000, 10000];
const availSel = toFunctionSelector("getAvailableTokens()");
let buyBatchId = -1;
for (let i = 0; i < BATCH_ADDRESSES.length; i++) {
  const availHex = await rpc("eth_call", [{ to: BATCH_ADDRESSES[i], data: availSel }, "latest"]);
  if (BigInt(availHex || "0x0") > 1n * BigInt(10) ** BigInt(18)) { buyBatchId = i; break; }
}
report("buy: found a batch with tokens available", buyBatchId >= 0, buyBatchId >= 0 ? `batch/${buyBatchId}` : "all sold out");
if (buyBatchId >= 0) {
  const buyPage = await browser.newPage();
  const buyErrors = [];
  buyPage.on("console", (m) => { if (m.type() === "error" && !isHmrNoise(m.text())) buyErrors.push(m.text().slice(0, 200)); });
  buyPage.on("pageerror", (e) => buyErrors.push("PAGEERROR: " + String(e).slice(0, 200)));
  await injectWallet(buyPage);
  await ensureFunded(1n);
  const buyAcres = (1.5 / BATCH_TPA[buyBatchId]).toString();
  await buyPage.goto(`http://localhost:3000/batch/${buyBatchId}`, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 6000));
  await typeInto(buyPage, 'input[placeholder="1"]', buyAcres);
  await new Promise((r) => setTimeout(r, 1500));
  const buyBtn = await buyPage.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) =>
      ["Approve & Buy", "Buy Tokens", "Approving...", "Buying..."].some((t) => b.innerText.trim().startsWith(t)) && !b.disabled);
    if (btn) { btn.click(); return btn.innerText.trim(); }
    return null;
  });
  report("buy button clicked", !!buyBtn, buyBtn || "");
  const buyDone = await waitForText(buyPage, "Purchase successful!");
  report("buy flow completes", buyDone);
  report("buy page no console errors", buyErrors.length === 0, buyErrors[0] || "");
  await buyPage.close();
}

// Test 3: distribute revenue (auto-approve in UI)
const adminPage = await browser.newPage();
const adminErrors = [];
adminPage.on("console", (m) => { if (m.type() === "error" && !isHmrNoise(m.text())) adminErrors.push(m.text().slice(0, 200)); });
adminPage.on("pageerror", (e) => adminErrors.push("PAGEERROR: " + String(e).slice(0, 200)));
await injectWallet(adminPage);
await adminPage.goto("http://localhost:3000/admin", { waitUntil: "networkidle2", timeout: 60000 });
await new Promise((r) => setTimeout(r, 6000));
await typeInto(adminPage, 'input[placeholder="Revenue (mUSDC)"]', "1000");
await new Promise((r) => setTimeout(r, 1000));
const distClicked = await adminPage.evaluate(() => {
  const btn = [...document.querySelectorAll("button")].find((b) => b.innerText.trim() === "Distribute Revenue" && !b.disabled);
  if (btn) { btn.click(); return true; }
  return false;
});
report("distribute button clicked", distClicked);
await waitForText(adminPage, "Step 2/2", 30000).catch(() => {});
await waitForText(adminPage, "Done.", 180000);
report("distribute revenue completes", (await adminPage.evaluate(() => document.body.innerText)).includes("Done."));
report("admin no console errors", adminErrors.length === 0, adminErrors[0] || "");
await adminPage.close();

// Test 4: claim revenue
const portPage = await browser.newPage();
await injectWallet(portPage);
await portPage.goto("http://localhost:3000/portfolio", { waitUntil: "networkidle2", timeout: 60000 });
await new Promise((r) => setTimeout(r, 7000));
report("portfolio shows pending revenue", /Pending Revenue/.test(await portPage.evaluate(() => document.body.innerText)), "");
const claimClicked = await portPage.evaluate(() => {
  const btn = [...document.querySelectorAll("button")].find((b) => /Claim [\d,.]+ mUSDC/.test(b.innerText.trim()) && !b.disabled);
  if (btn) { btn.click(); return btn.innerText.trim(); }
  return null;
});
report("claim button clicked", !!claimClicked, claimClicked || "");
await waitForText(portPage, "Revenue claimed!", 180000);
report("claim completes", (await portPage.evaluate(() => document.body.innerText)).includes("Revenue claimed!"), "");
await portPage.close();

// Test 5: book a farm stay (on-chain)
const isoFromOffset = (offset) => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);
await ensureFunded(700n);
const staysPage = await browser.newPage();
const staysErrors = [];
staysPage.on("console", (m) => { if (m.type() === "error" && !isHmrNoise(m.text())) staysErrors.push(m.text().slice(0, 200)); });
staysPage.on("pageerror", (e) => staysErrors.push("PAGEERROR: " + String(e).slice(0, 200)));
await injectWallet(staysPage);
await staysPage.goto("http://localhost:3000/stays", { waitUntil: "networkidle2", timeout: 60000 });
await new Promise((r) => setTimeout(r, 6000));
const availClicked = await staysPage.evaluate(() => {
  const btn = [...document.querySelectorAll("button")].find((b) => b.innerText.includes("Check availability") && !b.disabled);
  if (btn) { btn.click(); return true; }
  return false;
});
report("stays: check availability clicked", availClicked);
const modalOpened = await waitForSelector(staysPage, 'input[type="date"]', 30000);
report("stays: booking modal opens", modalOpened);
let freeWeekend = false;
let bookedISO = null;
for (let offset = 10; offset <= 45 && !freeWeekend; offset++) {
  bookedISO = isoFromOffset(offset);
  await typeInto(staysPage, 'input[type="date"]', bookedISO);
  await new Promise((r) => setTimeout(r, 3500));
  const btnText = await staysPage.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => x.innerText.startsWith("Confirm booking") || x.innerText.startsWith("Pick another date"));
    return b ? b.innerText : "";
  });
  if (btnText.startsWith("Confirm booking")) freeWeekend = true;
}
report("stays: found a free weekend", freeWeekend, bookedISO || "");
const confirmClicked = await staysPage.evaluate(() => {
  const btn = [...document.querySelectorAll("button")].find((b) => b.innerText.startsWith("Confirm booking") && !b.disabled);
  if (btn) { btn.click(); return true; }
  return false;
});
report("stays: confirm booking clicked", confirmClicked);
const booked = await waitForText(staysPage, "Stay booked on-chain!", 180000);
report("stays: booking completes on-chain", booked);
report("stays: no console errors", staysErrors.length === 0, staysErrors[0] || "");
if (bookedISO) {
  const bookedDayNum = Math.floor(Date.parse(bookedISO + "T00:00:00Z") / 86400000);
  const isBookedSel = toFunctionSelector("isBooked(uint256,uint256)");
  const callData = encodeFunctionData({ abi: [{ name: "isBooked", type: "function", stateMutability: "view", inputs: [{ name: "batchId", type: "uint256" }, { name: "day", type: "uint256" }], outputs: [{ name: "", type: "bool" }] }], functionName: "isBooked", args: [0, BigInt(bookedDayNum)] });
  const takenHex = await rpc("eth_call", [{ to: STAY_ADDR, data: callData }, "latest"]).catch(() => "0x0");
  report("stays: night taken on-chain (double-book guard)", BigInt(takenHex || "0x0") === 1n);
  const bookData = encodeFunctionData({ abi: [{ name: "bookStay", type: "function", stateMutability: "nonpayable", inputs: [{ name: "batchId", type: "uint256" }, { name: "day", type: "uint256" }, { name: "nights", type: "uint256" }, { name: "guests", type: "uint256" }], outputs: [] }], functionName: "bookStay", args: [0, BigInt(bookedDayNum), 2, 2] });
  let doubleBookReverts = false;
  try { await rpc("eth_call", [{ from: WALLET, to: STAY_ADDR, data: bookData }, "latest"]); }
  catch (e) { doubleBookReverts = String(e.message).toLowerCase().includes("stay already booked"); }
  report("stays: second bookStay reverts on-chain", doubleBookReverts);
}
await staysPage.close();

await browser.close();
console.log(failed === 0 ? "\nALL TESTS PASSED" : `\n${failed} TEST(S) FAILED`);
process.exit(failed === 0 ? 0 : 1);
```

> **Note on the e2e UI strings:** the tests assert exact page copy ("The farm is real", "Cropfolio", "Distribute Revenue", "Revenue (mUSDC)" placeholder, "Confirm booking", etc.). These are the **interface contract** with Person B — B must render them exactly (see PRD-B §10).

## 10. Interface Contract with Person B

1. **`contracts/deployed.json`** — your handoff file. Schema:
   ```json
   { "chainId": 10143, "chainName": "Monad Testnet", "mockUSDC": "0x…", "factory": "0x…", "stayBooking": "0x…", "batches": ["0x…","0x…","0x…","0x…","0x…","0x…","0x…","0x…"], "stayPrices": [350,300,180,300,250,320,150,150] }
   ```
2. **ABI files** — compile with Hardhat; give B `frontend/src/lib/abi/{LandBatch,LandBatchFactory,MockUSDC,StayBooking}.json` (exact ABIs from `artifacts/contracts/**/*.json`). Never rename functions.
3. **Monad chain facts** — chain id 10143, MON, RPCs, Monadscan — B uses these too.
4. **UI strings** the e2e depends on (B must render them) — listed in §9 note and PRD-B §10.
5. You never edit `frontend/src/lib/config.ts` structure — only its values, via `deployed.json`.

## 11. Acceptance Criteria (done = all true)

- [ ] `npx hardhat compile` clean on Solc 0.8.27.
- [ ] All unit tests pass (coverage in §8).
- [ ] MockUSDC + Factory + 8 batches + StayBooking verified on Monadscan (chain 10143) with correct state.
- [ ] `contracts/deployed.json` committed with all addresses + prices.
- [ ] e2e harness adapted to Monad runs green with Person B's frontend (all PASS).
- [ ] Zero uncaught on-chain reverts across the 5 flows when driven via e2e.
- [ ] No ARC Testnet addresses remain in any file you own.
