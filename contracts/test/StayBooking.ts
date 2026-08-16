import { expect } from "chai";
import { ethers, network } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";

const SECONDS_PER_DAY = 86400n;

describe("StayBooking", () => {
  async function deployFixture() {
    const [owner, other, guest1, guest2] = await ethers.getSigners();

    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const usdc = await MockUSDC.deploy();
    await usdc.waitForDeployment();

    const StayBooking = await ethers.getContractFactory("StayBooking");
    const booking = await StayBooking.deploy(await usdc.getAddress());
    await booking.waitForDeployment();

    // Price 350 mUSDC/night for batch 0
    await booking.setPricePerNight(0, ethers.parseUnits("350", 18));

    for (const g of [guest1, guest2]) {
      await usdc.mint(g.address, 100_000n * 10n ** 18n);
      await usdc.connect(g).approve(await booking.getAddress(), ethers.MaxUint256);
    }

    return { booking, usdc, owner, other, guest1, guest2 };
  }

  const futureDay = () => BigInt(Math.floor(Date.now() / 1000 / 86400) + 10);

  it("only owner can set price; others revert", async () => {
    const { booking, other } = await loadFixture(deployFixture);
    await expect(booking.connect(other).setPricePerNight(1, 100n)).to.be.reverted;
  });

  it("book pays mUSDC and marks nights taken", async () => {
    const { booking, usdc, guest1 } = await loadFixture(deployFixture);
    const day = futureDay();
    const before = await usdc.balanceOf(guest1.address);

    await expect(booking.connect(guest1).bookStay(0, day, 2, 3))
      .to.emit(booking, "StayBooked")
      .withArgs(0n, day, guest1.address, 2n, 3n, 700n * 10n ** 18n);

    const spent = before - (await usdc.balanceOf(guest1.address));
    expect(spent).to.equal(700n * 10n ** 18n);
    expect(await booking.isBooked(0, day)).to.equal(true);
    expect(await booking.isBooked(0, day + 1n)).to.equal(true);
    expect(await booking.isBooked(0, day + 2n)).to.equal(false);

    const stay = await booking.getStay(0, day);
    expect(stay.booker).to.equal(guest1.address);
    expect(stay.nights).to.equal(2n);
    expect(stay.guests).to.equal(3n);
    expect(stay.pricePerNight).to.equal(ethers.parseUnits("350", 18));
  });

  it("double-book same day reverts", async () => {
    const { booking, guest1, guest2 } = await loadFixture(deployFixture);
    const day = futureDay();
    await booking.connect(guest1).bookStay(0, day, 1, 1);
    await expect(booking.connect(guest2).bookStay(0, day, 1, 1)).to.be.revertedWith(
      "Stay already booked"
    );
  });

  it("overlapping nights revert", async () => {
    const { booking, guest1, guest2 } = await loadFixture(deployFixture);
    const day = futureDay();
    await booking.connect(guest1).bookStay(0, day, 3, 1);
    await expect(booking.connect(guest2).bookStay(0, day + 2n, 2, 1)).to.be.revertedWith(
      "Stay already booked"
    );
  });

  it("cancel refunds full amount and frees nights", async () => {
    const { booking, usdc, guest1 } = await loadFixture(deployFixture);
    const day = futureDay();
    await booking.connect(guest1).bookStay(0, day, 2, 2);

    const before = await usdc.balanceOf(guest1.address);
    await expect(booking.connect(guest1).cancelStay(0, day)).to.emit(booking, "StayCancelled");

    const refunded = (await usdc.balanceOf(guest1.address)) - before;
    expect(refunded).to.equal(700n * 10n ** 18n);
    expect(await booking.isBooked(0, day)).to.equal(false);
    expect(await booking.isBooked(0, day + 1n)).to.equal(false);

    const bookings = await booking.getUserBookings(guest1.address);
    expect(bookings.length).to.equal(0);
  });

  it("cannot cancel on or after check-in day (anti-griefing)", async () => {
    const { booking, guest1 } = await loadFixture(deployFixture);
    const today = BigInt(Math.floor(Date.now() / 1000 / 86400));
    await booking.connect(guest1).bookStay(0, today, 1, 1);
    await expect(booking.connect(guest1).cancelStay(0, today)).to.be.revertedWith(
      "Too late to cancel"
    );
  });

  it("owner withdraw only from free balance (refunds protected)", async () => {
    const { booking, usdc, owner, guest1 } = await loadFixture(deployFixture);
    const day = futureDay();
    await booking.connect(guest1).bookStay(0, day, 2, 2); // 700 locked for refund

    // Cannot withdraw the 700 that is refundable
    await expect(booking.withdraw(ethers.parseUnits("700", 18))).to.be.revertedWith(
      "Insufficient free balance"
    );

    // Fund surplus and withdraw it
    await usdc.connect(owner).transfer(await booking.getAddress(), ethers.parseUnits("300", 18));
    const before = await usdc.balanceOf(owner.address);
    await expect(booking.withdraw(ethers.parseUnits("300", 18))).to.emit(booking, "Withdrawn");
    expect((await usdc.balanceOf(owner.address)) - before).to.equal(ethers.parseUnits("300", 18));

    // Guest can still cancel and get the full refund
    const guestBefore = await usdc.balanceOf(guest1.address);
    await booking.connect(guest1).cancelStay(0, day);
    expect((await usdc.balanceOf(guest1.address)) - guestBefore).to.equal(ethers.parseUnits("700", 18));
  });

  it("non-owner cannot withdraw", async () => {
    const { booking, guest1 } = await loadFixture(deployFixture);
    await expect(booking.connect(guest1).withdraw(1n)).to.be.reverted;
  });

  it("settleStay releases refund reserve after the stay passes", async () => {
    const { booking, usdc, owner, guest1 } = await loadFixture(deployFixture);
    const day = futureDay();
    await booking.connect(guest1).bookStay(0, day, 1, 1); // 350 refundable

    // Free balance is 0 while the stay is unsettled
    await expect(booking.withdraw(1n)).to.be.revertedWith("Insufficient free balance");

    // Fast-forward past check-in day, then settle
    await time.increase(SECONDS_PER_DAY * (10n + 2n));
    await booking.connect(owner).settleStay(0, day);
    await expect(booking.connect(owner).withdraw(ethers.parseUnits("350", 18))).to.emit(booking, "Withdrawn");
    void usdc;
  });

  it("non-booker cannot cancel", async () => {
    const { booking, guest1, guest2 } = await loadFixture(deployFixture);
    const day = futureDay();
    await booking.connect(guest1).bookStay(0, day, 1, 1);
    await expect(booking.connect(guest2).cancelStay(0, day)).to.be.revertedWith("Not the booker");
  });

  it("night limit (7) enforced", async () => {
    const { booking, guest1 } = await loadFixture(deployFixture);
    const day = futureDay();
    await expect(booking.connect(guest1).bookStay(0, day, 8, 1)).to.be.revertedWith(
      "Nights out of range"
    );
  });

  it("guest limit (8) enforced", async () => {
    const { booking, guest1 } = await loadFixture(deployFixture);
    const day = futureDay();
    await expect(booking.connect(guest1).bookStay(0, day, 1, 9)).to.be.revertedWith(
      "Guests out of range"
    );
  });

  it("past day reverts", async () => {
    const { booking, guest1 } = await loadFixture(deployFixture);
    const pastDay = BigInt(Math.floor(Date.now() / 1000 / 86400) - 1);
    await expect(booking.connect(guest1).bookStay(0, pastDay, 1, 1)).to.be.revertedWith(
      "Day already past"
    );
  });

  it("price not set for a batch reverts", async () => {
    const { booking, guest1 } = await loadFixture(deployFixture);
    const day = futureDay();
    await expect(booking.connect(guest1).bookStay(1, day, 1, 1)).to.be.revertedWith("Price not set");
  });

  it("userBookings tracks bookings", async () => {
    const { booking, guest1 } = await loadFixture(deployFixture);
    const day = futureDay();
    await booking.connect(guest1).bookStay(0, day, 1, 1);
    const bookings = await booking.getUserBookings(guest1.address);
    expect(bookings.length).to.equal(1);
    expect(bookings[0].batchId).to.equal(0n);
    expect(bookings[0].day).to.equal(day);
  });
});
