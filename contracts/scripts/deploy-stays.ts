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
