import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";

const BPS_DENOM = 10000n;
const SELL_COOLDOWN = 90n * 86400n;

describe("LandBatch", () => {
  async function deployFixture() {
    const [deployer, admin, farmer, investor1, investor2] = await ethers.getSigners();

    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const usdc = await MockUSDC.deploy();
    await usdc.waitForDeployment();

    const LandBatch = await ethers.getContractFactory("LandBatch");
    const supply = ethers.parseUnits("40000", 18);
    const price = ethers.parseUnits("1", 18);
    const batch = await LandBatch.deploy(
      await usdc.getAddress(),
      farmer.address,
      admin.address,
      "Saffron",
      1,
      price,
      supply,
      1000,
      1
    );
    await batch.waitForDeployment();

    for (const inv of [investor1, investor2, deployer]) {
      await usdc.mint(inv.address, 1_000_000n * 10n ** 18n);
      await usdc.connect(inv).approve(await batch.getAddress(), ethers.MaxUint256);
    }
    await usdc.mint(admin.address, 1_000_000n * 10n ** 18n);
    await usdc.mint(farmer.address, 1_000_000n * 10n ** 18n);
    await usdc.connect(admin).approve(await batch.getAddress(), ethers.MaxUint256);
    await usdc.connect(farmer).approve(await batch.getAddress(), ethers.MaxUint256);

    return { batch, usdc, deployer, admin, farmer, investor1, investor2, supply, price };
  }

  describe("buy", () => {
    it("buyer pays mUSDC and receives tokens; full amount goes to buybackReserve", async () => {
      const { batch, usdc, investor1, price } = await loadFixture(deployFixture);
      const tokenAmount = 1000n * 10n ** 18n;
      const expectedUsdc = (tokenAmount * price) / 10n ** 18n;

      const usdcBefore = await usdc.balanceOf(investor1.address);
      await batch.connect(investor1).buyTokens(tokenAmount, false);
      const usdcAfter = await usdc.balanceOf(investor1.address);

      expect(usdcBefore - usdcAfter).to.equal(expectedUsdc);
      expect(await batch.balanceOf(investor1.address)).to.equal(tokenAmount);
      expect(await batch.buybackReserve()).to.equal(expectedUsdc);
      expect(await batch.soldTokens()).to.equal(tokenAmount);
    });

    it("getAvailableTokens decreases after purchase", async () => {
      const { batch, investor1 } = await loadFixture(deployFixture);
      const availBefore = await batch.getAvailableTokens();
      const tokenAmount = 100n * 10n ** 18n;
      await batch.connect(investor1).buyTokens(tokenAmount, false);
      expect(await batch.getAvailableTokens()).to.equal(availBefore - tokenAmount);
    });

    it("price equals tokens x pricePerToken (1 mUSDC per token)", async () => {
      const { batch, usdc, investor1 } = await loadFixture(deployFixture);
      const tokenAmount = 250n * 10n ** 18n;
      const before = await usdc.balanceOf(investor1.address);
      await batch.connect(investor1).buyTokens(tokenAmount, false);
      const spent = before - (await usdc.balanceOf(investor1.address));
      expect(spent).to.equal(tokenAmount);
    });

    it("reverts if amount exceeds available", async () => {
      const { batch, investor1 } = await loadFixture(deployFixture);
      const all = 40000n * 10n ** 18n;
      await expect(batch.connect(investor1).buyTokens(all + 1n, false)).to.be.revertedWith(
        "Not enough tokens left"
      );
    });
  });

  describe("sell", () => {
    it("requestSell locks tokens and records a sell request", async () => {
      const { batch, investor1 } = await loadFixture(deployFixture);
      const tokenAmount = 100n * 10n ** 18n;
      await batch.connect(investor1).buyTokens(tokenAmount, false);

      await batch.connect(investor1).requestSell(tokenAmount);
      expect(await batch.balanceOf(investor1.address)).to.equal(0n);
      expect(await batch.lockedTokens()).to.equal(tokenAmount);

      const req = await batch.getSellRequest(investor1.address);
      expect(req.active).to.equal(true);
      expect(req.tokenAmount).to.equal(tokenAmount);
    });

    it("cannot request two sells at once", async () => {
      const { batch, investor1 } = await loadFixture(deployFixture);
      const tokenAmount = 100n * 10n ** 18n;
      await batch.connect(investor1).buyTokens(tokenAmount * 2n, false);
      await batch.connect(investor1).requestSell(tokenAmount);
      await expect(batch.connect(investor1).requestSell(1n)).to.be.revertedWith(
        "Sell already requested"
      );
    });

    it("executeSell reverts before the 90-day cooldown", async () => {
      const { batch, investor1 } = await loadFixture(deployFixture);
      const tokenAmount = 100n * 10n ** 18n;
      await batch.connect(investor1).buyTokens(tokenAmount, false);
      await batch.connect(investor1).requestSell(tokenAmount);
      await expect(batch.connect(investor1).executeSell()).to.be.revertedWith(
        "Cooldown not passed"
      );
    });

    it("after cooldown pays principal + 1%/yr and burns tokens", async () => {
      const { batch, usdc, investor1, investor2, price } = await loadFixture(deployFixture);
      const tokenAmount = 1000n * 10n ** 18n;
      await batch.connect(investor1).buyTokens(tokenAmount, false);
      await batch.connect(investor2).buyTokens(tokenAmount, false);
      const invested = (tokenAmount * price) / 10n ** 18n;
      const payoutExpected = invested + (invested * 1n) / 100n;

      await batch.connect(investor1).requestSell(tokenAmount);
      await time.increase(SELL_COOLDOWN + 1n);

      const usdcBefore = await usdc.balanceOf(investor1.address);
      await expect(batch.connect(investor1).executeSell())
        .to.emit(batch, "SellExecuted")
        .withArgs(investor1.address, payoutExpected);

      const payout = (await usdc.balanceOf(investor1.address)) - usdcBefore;
      expect(payout).to.equal(payoutExpected);
      expect(await batch.balanceOf(investor1.address)).to.equal(0n);
      expect(await batch.totalSupply()).to.equal(40000n * 10n ** 18n - tokenAmount);
    });

    it("partial sell pays only the proportional principal (anti-drain)", async () => {
      const { batch, usdc, investor1, investor2, price } = await loadFixture(deployFixture);
      const tokenAmount = 1000n * 10n ** 18n;
      await batch.connect(investor1).buyTokens(tokenAmount, false);
      await batch.connect(investor2).buyTokens(tokenAmount, false);
      const invested = (tokenAmount * price) / 10n ** 18n;

      // Sell 25% of tokens -> must only receive 25% of invested + 1%/yr on that 25%
      const sellAmount = tokenAmount / 4n;
      await batch.connect(investor1).requestSell(sellAmount);
      await time.increase(SELL_COOLDOWN + 1n);

      const principalExpected = (invested * 1n) / 4n;
      const payoutExpected = principalExpected + (principalExpected * 1n) / 100n;

      const before = await usdc.balanceOf(investor1.address);
      await expect(batch.connect(investor1).executeSell()).to.emit(batch, "SellExecuted").withArgs(
        investor1.address,
        payoutExpected
      );
      const payout = (await usdc.balanceOf(investor1.address)) - before;
      expect(payout).to.equal(payoutExpected);

      // Remaining stake is 75% of tokens AND 75% of invested
      expect(await batch.balanceOf(investor1.address)).to.equal(sellAmount * 3n);
      const info = await batch.getInvestorInfo(investor1.address);
      expect(info.totalInvested).to.equal((invested * 3n) / 4n);
    });

    it("full reserve means a single investor can always exit (no 9% brick)", async () => {
      const { batch, usdc, investor1, investor2, price } = await loadFixture(deployFixture);
      const tokenAmount = 1000n * 10n ** 18n;
      await batch.connect(investor1).buyTokens(tokenAmount, false);
      await batch.connect(investor2).buyTokens(tokenAmount, false);
      const invested = (tokenAmount * price) / 10n ** 18n;
      const payoutExpected = invested + (invested * 1n) / 100n;

      await batch.connect(investor1).requestSell(tokenAmount);
      await time.increase(SELL_COOLDOWN + 1n);

      const before = await usdc.balanceOf(investor1.address);
      await batch.connect(investor1).executeSell();
      const payout = (await usdc.balanceOf(investor1.address)) - before;
      expect(payout).to.equal(payoutExpected);
    });

    it("milestone cannot drain below the buyback reserve", async () => {
      const { batch, usdc, admin, farmer } = await loadFixture(deployFixture);
      const tokenAmount = 1000n * 10n ** 18n;
      await batch.connect(admin).buyTokens(tokenAmount, false);
      // All funds are now reserved for buybacks; a milestone cannot be claimed
      await batch.connect(admin).createMilestone("Planting complete", 1n * 10n ** 18n, 0n, 30n);
      await expect(batch.connect(admin).claimMilestone(0)).to.be.revertedWith("Insufficient funds");

      // After distributing revenue, surplus becomes claimable
      const rev = 500n * 10n ** 18n;
      await usdc.connect(admin).approve(await batch.getAddress(), rev);
      await batch.connect(admin).distributeRevenue(rev);
      const farmerBefore = await usdc.balanceOf(farmer.address);
      await expect(batch.connect(admin).claimMilestone(0)).to.emit(batch, "MilestoneClaimed");
      const farmerAfter = await usdc.balanceOf(farmer.address);
      expect(farmerAfter - farmerBefore).to.equal(1n * 10n ** 18n);
    });
  });

  describe("revenue", () => {
    it("distributes by investorShareBps (70% investors / 30% farmer)", async () => {
      const { batch, usdc, farmer, admin, investor1 } = await loadFixture(deployFixture);
      await batch.connect(investor1).buyTokens(1000n * 10n ** 18n, false);

      const rev = 1000n * 10n ** 18n;
      const farmerBefore = await usdc.balanceOf(farmer.address);
      await usdc.connect(admin).approve(await batch.getAddress(), rev);
      await expect(batch.connect(admin).distributeRevenue(rev)).to.emit(batch, "RevenueDistributed");

      const farmerAfter = await usdc.balanceOf(farmer.address);
      expect(farmerAfter - farmerBefore).to.equal((rev * 3000n) / BPS_DENOM);
      expect(await batch.totalRevenueDistributed()).to.equal(rev);
    });

    it("two investors split proportionally to invested", async () => {
      const { batch, usdc, admin, investor1, investor2 } = await loadFixture(deployFixture);
      const a = 3000n * 10n ** 18n;
      const b = 1000n * 10n ** 18n;
      await batch.connect(investor1).buyTokens(a, false);
      await batch.connect(investor2).buyTokens(b, false);

      const rev = 1000n * 10n ** 18n;
      await usdc.connect(admin).approve(await batch.getAddress(), rev);
      await batch.connect(admin).distributeRevenue(rev);

      const investorPool = (rev * 7000n) / BPS_DENOM; // 700
      const info1 = await batch.getInvestorInfo(investor1.address);
      const info2 = await batch.getInvestorInfo(investor2.address);
      expect(info1.pendingRevenue).to.equal((investorPool * a) / (a + b));
      expect(info2.pendingRevenue).to.equal((investorPool * b) / (a + b));
    });

    it("fixed-return investor is capped at fixed return", async () => {
      const { batch, usdc, admin, investor1 } = await loadFixture(deployFixture);
      const invested = 1000n * 10n ** 18n;
      await batch.connect(investor1).buyTokens(invested, true); // fixed 10% -> 100

      for (let i = 0; i < 3; i++) {
        const rev = 1000n * 10n ** 18n;
        await usdc.connect(admin).approve(await batch.getAddress(), rev);
        await batch.connect(admin).distributeRevenue(rev);
      }

      const info = await batch.getInvestorInfo(investor1.address);
      expect(info.pendingRevenue).to.be.at.most((invested * 1000n) / BPS_DENOM);
      expect(info.pendingRevenue).to.equal((invested * 1000n) / BPS_DENOM);
    });

    it("claimRevenue pays pending and zeroes it", async () => {
      const { batch, usdc, admin, investor1 } = await loadFixture(deployFixture);
      await batch.connect(investor1).buyTokens(1000n * 10n ** 18n, false);

      const rev = 1000n * 10n ** 18n;
      await usdc.connect(admin).approve(await batch.getAddress(), rev);
      await batch.connect(admin).distributeRevenue(rev);

      const info = await batch.getInvestorInfo(investor1.address);
      const pending = info.pendingRevenue;
      expect(pending).to.be.greaterThan(0n);

      const before = await usdc.balanceOf(investor1.address);
      await expect(batch.connect(investor1).claimRevenue()).to.emit(batch, "RevenueClaimed");
      expect((await usdc.balanceOf(investor1.address)) - before).to.equal(pending);

      const after = await batch.getInvestorInfo(investor1.address);
      expect(after.pendingRevenue).to.equal(0n);
      expect(after.claimedRevenue).to.equal(pending);
    });

    it("claim with nothing pending reverts", async () => {
      const { batch, investor1 } = await loadFixture(deployFixture);
      await expect(batch.connect(investor1).claimRevenue()).to.be.revertedWith(
        "No pending revenue"
      );
    });
  });

  describe("milestones", () => {
    it("only admin can create", async () => {
      const { batch, investor1 } = await loadFixture(deployFixture);
      await expect(
        batch.connect(investor1).createMilestone("m", 100n, 0n, 30n)
      ).to.be.revertedWith("Not admin");
    });

    it("create -> claim within window pays farmer", async () => {
      const { batch, usdc, admin, farmer } = await loadFixture(deployFixture);
      const amount = 1000n * 10n ** 18n;
      await batch.connect(admin).createMilestone("Planting complete", amount, 0n, 30n);
      // Fund the batch contract itself: claimMilestone pays from contract balance
      await usdc.connect(admin).transfer(await batch.getAddress(), amount);

      const farmerBefore = await usdc.balanceOf(farmer.address);
      await expect(batch.connect(admin).claimMilestone(0)).to.emit(batch, "MilestoneClaimed");
      const farmerAfter = await usdc.balanceOf(farmer.address);
      expect(farmerAfter - farmerBefore).to.equal(amount);
    });

    it("reverts before startDay", async () => {
      const { batch, admin } = await loadFixture(deployFixture);
      await batch.connect(admin).createMilestone("Later", 100n, 100n, 200n);
      await expect(batch.connect(admin).claimMilestone(0)).to.be.revertedWith("Too early");
    });

    it("cannot claim twice", async () => {
      const { batch, usdc, admin } = await loadFixture(deployFixture);
      await batch.connect(admin).createMilestone("m", 100n, 0n, 5n);
      await usdc.connect(admin).transfer(await batch.getAddress(), 100n * 10n ** 18n);
      await batch.connect(admin).claimMilestone(0);
      await expect(batch.connect(admin).claimMilestone(0)).to.be.revertedWith("Already claimed");
    });
  });

  describe("clips", () => {
    it("uploadClip appends; only farmer/admin", async () => {
      const { batch, farmer, admin, investor1 } = await loadFixture(deployFixture);
      await expect(batch.connect(investor1).uploadClip("https://x")).to.be.revertedWith(
        "Not farmer or admin"
      );
      await batch.connect(farmer).uploadClip("https://clip1");
      await batch.connect(admin).uploadClip("https://clip2");
      const clips = await batch.getClips();
      expect(clips.length).to.equal(2);
      expect(clips[0].url).to.equal("https://clip1");
      expect(clips[1].url).to.equal("https://clip2");
    });
  });

  describe("advanceYear", () => {
    it("increments year and reaches HarvestReady on a 1-year crop", async () => {
      const { batch, admin } = await loadFixture(deployFixture);
      await expect(batch.connect(admin).advanceYear()).to.emit(batch, "YearAdvanced");
      expect(await batch.currentYear()).to.equal(1n);
      expect(await batch.growthStage()).to.equal(4n); // HarvestReady
    });

    it("past cropCycleYears replants (cropNumber++, share reset to 7000)", async () => {
      const { batch, admin } = await loadFixture(deployFixture);
      await batch.connect(admin).advanceYear(); // year 1 (HarvestReady)
      await batch.connect(admin).advanceYear(); // year 2 > 1 -> replant
      expect(await batch.currentYear()).to.equal(0n);
      expect(await batch.cropNumber()).to.equal(2n);
      expect(await batch.getCurrentInvestorShare()).to.equal(7000n);
      expect(await batch.growthStage()).to.equal(0n); // Seedling
    });

    it("stage progression works for a 3-year crop", async () => {
      const { deployer, farmer } = await loadFixture(deployFixture);
      const LandBatch = await ethers.getContractFactory("LandBatch");
      const b3 = await LandBatch.deploy(
        await deployer.getAddress(),
        farmer.address,
        deployer.address,
        "Pomegranate",
        5,
        ethers.parseUnits("1", 18),
        ethers.parseUnits("60000", 18),
        900,
        3
      );
      await b3.waitForDeployment();
      await b3.advanceYear(); // year 1 -> Flowering
      expect(await b3.growthStage()).to.equal(2n);
      await b3.advanceYear(); // year 2 -> Fruiting
      expect(await b3.growthStage()).to.equal(3n);
      await b3.advanceYear(); // year 3 -> HarvestReady
      expect(await b3.growthStage()).to.equal(4n);
      await b3.advanceYear(); // year 4 > 3 -> replant
      expect(await b3.cropNumber()).to.equal(2n);
      expect(await b3.growthStage()).to.equal(0n);
    });

    it("only admin can advance year", async () => {
      const { batch, investor1 } = await loadFixture(deployFixture);
      await expect(batch.connect(investor1).advanceYear()).to.be.revertedWith("Not admin");
    });
  });

  describe("farmer", () => {
    it("setFarmer only admin, updates farmer", async () => {
      const { batch, admin, investor1, farmer } = await loadFixture(deployFixture);
      await expect(batch.connect(investor1).setFarmer(farmer.address)).to.be.revertedWith("Not admin");
      await batch.connect(admin).setFarmer(investor1.address);
      expect(await batch.farmer()).to.equal(investor1.address);
    });
  });
});
