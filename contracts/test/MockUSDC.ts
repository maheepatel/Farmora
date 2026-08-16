import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { MockUSDC } from "../typechain-types";

describe("MockUSDC", () => {
  const FAUCET_AMOUNT = 50_000n * 10n ** 18n;

  async function deployFixture() {
    const [owner, other] = await ethers.getSigners();
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const usdc = (await MockUSDC.deploy()) as unknown as MockUSDC;
    await usdc.waitForDeployment();
    return { usdc, owner, other };
  }

  it("mints 10M to deployer on construction", async () => {
    const { usdc, owner } = await loadFixture(deployFixture);
    expect(await usdc.balanceOf(owner.address)).to.equal(10_000_000n * 10n ** 18n);
  });

  it("faucet mints 50,000 once per address", async () => {
    const { usdc, other } = await loadFixture(deployFixture);
    await usdc.connect(other).faucet();
    expect(await usdc.balanceOf(other.address)).to.equal(FAUCET_AMOUNT);
    expect(await usdc.hasClaimed(other.address)).to.equal(true);
  });

  it("second faucet reverts", async () => {
    const { usdc, other } = await loadFixture(deployFixture);
    await usdc.connect(other).faucet();
    await expect(usdc.connect(other).faucet()).to.be.revertedWith("Already claimed");
  });

  it("admin mint works for any address", async () => {
    const { usdc, other } = await loadFixture(deployFixture);
    await usdc.mint(other.address, 123n * 10n ** 18n);
    expect(await usdc.balanceOf(other.address)).to.equal(123n * 10n ** 18n);
  });

  it("has correct name/symbol/decimals", async () => {
    const { usdc } = await loadFixture(deployFixture);
    expect(await usdc.name()).to.equal("MockUSDC");
    expect(await usdc.symbol()).to.equal("mUSDC");
    expect(await usdc.decimals()).to.equal(18);
  });
});
