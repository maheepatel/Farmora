import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("LandBatchFactory", () => {
  async function deployFixture() {
    const [deployer, other, farmer] = await ethers.getSigners();

    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const usdc = await MockUSDC.deploy();
    await usdc.waitForDeployment();

    const Factory = await ethers.getContractFactory("LandBatchFactory");
    const factory = await Factory.deploy(await usdc.getAddress());
    await factory.waitForDeployment();

    return { factory, usdc, deployer, other, farmer };
  }

  it("only admin (deployer) can create batches", async () => {
    const { factory, other, farmer } = await loadFixture(deployFixture);
    await expect(
      factory.connect(other).createBatch(
        farmer.address,
        "Saffron",
        1,
        ethers.parseUnits("1", 18),
        ethers.parseUnits("40000", 18),
        1000,
        1
      )
    ).to.be.revertedWith("Only admin");
  });

  it("creates a batch with correct params and registers it", async () => {
    const { factory, deployer, farmer } = await loadFixture(deployFixture);
    const tx = await factory.createBatch(
      farmer.address,
      "Saffron",
      1,
      ethers.parseUnits("1", 18),
      ethers.parseUnits("40000", 18),
      1000,
      1
    );
    const rcpt = await tx.wait();

    expect(await factory.getBatchCount()).to.equal(1n);
    const batches = await factory.getBatches();
    expect(batches.length).to.equal(1);

    const batch = await ethers.getContractAt("LandBatch", batches[0]);
    expect(await batch.cropType()).to.equal("Saffron");
    expect(await batch.totalAcres()).to.equal(1n);
    expect(await batch.farmer()).to.equal(farmer.address);
    expect(await batch.admin()).to.equal(deployer.address);
    expect(await batch.totalSupply()).to.equal(ethers.parseUnits("40000", 18));

    // BatchCreated event carries batch address + index
    await expect(tx).to.emit(factory, "BatchCreated").withArgs(batches[0], 0, "Saffron", 1);
    void rcpt;
  });

  it("registry order is preserved across multiple batches", async () => {
    const { factory, farmer } = await loadFixture(deployFixture);
    const crops = ["Cordyceps", "Mushroom"];
    for (const c of crops) {
      await factory.createBatch(
        farmer.address,
        c,
        1,
        ethers.parseUnits("1", 18),
        ethers.parseUnits("25000", 18),
        1200,
        1
      );
    }
    const batches = await factory.getBatches();
    expect(await factory.getBatchCount()).to.equal(2n);
    expect(batches.length).to.equal(2);
    expect(await (await ethers.getContractAt("LandBatch", batches[0])).cropType()).to.equal("Cordyceps");
    expect(await (await ethers.getContractAt("LandBatch", batches[1])).cropType()).to.equal("Mushroom");
  });

  it("admin is set to deployer", async () => {
    const { factory, deployer } = await loadFixture(deployFixture);
    expect(await factory.admin()).to.equal(deployer.address);
  });
});
