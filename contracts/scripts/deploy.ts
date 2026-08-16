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
