// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./MockUSDC.sol";

contract LandBatch is ERC20, ReentrancyGuard {
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
    uint256 public totalInvestedSum;

    enum GrowthStage { Seedling, Vegetative, Flowering, Fruiting, HarvestReady }
    GrowthStage public growthStage;

    uint256 public cropCycleYears;
    uint256 public cropNumber;

    uint256 public constant SHARE_DECREASE_PER_YEAR = 500;
    uint256 public constant INITIAL_INVESTOR_SHARE = 7000;
    uint256 public constant APPRECIATION_PCT_PER_YEAR = 100;
    uint256 public constant SELL_COOLDOWN = 90 days;
    uint256 public constant BPS_DENOM = 10000;

    struct InvestorInfo {
        bool isFixedReturn;
        uint256 totalInvested;
        uint256 tokenAmount;
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

        buybackReserve += usdcAmount;

        _transfer(address(this), msg.sender, tokenAmount);
        soldTokens += tokenAmount;

        if (!inInvestorList[msg.sender]) {
            inInvestorList[msg.sender] = true;
            investorList.push(msg.sender);
        }

        investors[msg.sender].tokenAmount += tokenAmount;
        if (investors[msg.sender].totalInvested == 0) {
            investors[msg.sender].isFixedReturn = isFixedReturn;
        }
        investors[msg.sender].totalInvested += usdcAmount;
        totalInvestedSum += usdcAmount;

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

    function executeSell() external nonReentrant {
        SellRequest storage req = sellRequests[msg.sender];
        require(req.active, "No active sell request");
        require(block.timestamp >= req.requestTime + SELL_COOLDOWN, "Cooldown not passed");

        uint256 yearsHeld = (block.timestamp - plantingDate) / 365 days;
        if (yearsHeld == 0) yearsHeld = 1;
        if (yearsHeld > cropCycleYears) yearsHeld = cropCycleYears;

        uint256 invested = investors[msg.sender].totalInvested;
        uint256 owned = investors[msg.sender].tokenAmount;
        require(owned > 0 && req.tokenAmount <= owned, "Invalid sell amount");

        uint256 principalToReturn = (invested * req.tokenAmount) / owned;
        uint256 appreciationAmount = (principalToReturn * yearsHeld * APPRECIATION_PCT_PER_YEAR) / BPS_DENOM;
        uint256 totalReturn = principalToReturn + appreciationAmount;

        require(buybackReserve >= totalReturn, "Insufficient buyback reserve");
        require(usdc.balanceOf(address(this)) >= totalReturn, "Insufficient contract balance");

        buybackReserve -= principalToReturn;
        req.active = false;
        soldTokens -= req.tokenAmount;
        lockedTokens -= req.tokenAmount;

        _burn(address(this), req.tokenAmount);

        investors[msg.sender].totalInvested = invested - principalToReturn;
        investors[msg.sender].tokenAmount = owned - req.tokenAmount;
        investors[msg.sender].pendingRevenue = (investors[msg.sender].pendingRevenue * (owned - req.tokenAmount)) / owned;
        totalInvestedSum -= principalToReturn;

        require(usdc.transfer(msg.sender, totalReturn), "USDC transfer failed");

        emit SellExecuted(msg.sender, totalReturn);
    }

    function distributeRevenue(uint256 totalRevenue) external onlyFarmerOrAdmin nonReentrant {
        require(totalRevenue > 0, "Revenue must be > 0");
        require(usdc.transferFrom(msg.sender, address(this), totalRevenue), "USDC transfer failed");

        totalRevenueDistributed += totalRevenue;

        uint256 investorPool = (totalRevenue * investorShareBps) / BPS_DENOM;
        uint256 farmerShare = totalRevenue - investorPool;

        if (totalInvestedSum > 0) {
            for (uint256 i = 0; i < investorList.length; i++) {
                address inv = investorList[i];
                if (investors[inv].totalInvested > 0) {
                    uint256 share = (investorPool * investors[inv].totalInvested) / totalInvestedSum;
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

    function claimRevenue() external nonReentrant {
        uint256 amount = investors[msg.sender].pendingRevenue;
        require(amount > 0, "No pending revenue");

        require(usdc.balanceOf(address(this)) >= buybackReserve + amount, "Insufficient funds");

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

    function claimMilestone(uint256 index) external onlyFarmerOrAdmin nonReentrant {
        require(index < milestones.length, "Invalid milestone");
        Milestone storage m = milestones[index];
        require(!m.claimed, "Already claimed");

        uint256 daysSincePlanting = (block.timestamp - plantingDate) / 1 days;
        require(daysSincePlanting >= m.startDay, "Too early");
        require(daysSincePlanting <= m.endDay || m.endDay == 0, "Too late");

        require(usdc.balanceOf(address(this)) >= buybackReserve + m.amount, "Insufficient funds");

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
