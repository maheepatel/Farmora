// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./MockUSDC.sol";

contract StayBooking is Ownable, ReentrancyGuard {
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
    uint256 public refundableReserve;

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
    event Withdrawn(address indexed owner, uint256 amount);

    constructor(address _usdc) Ownable(msg.sender) {
        usdc = MockUSDC(_usdc);
    }

    function bookStay(uint256 batchId, uint256 day, uint256 nights, uint256 guests) external nonReentrant {
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

        refundableReserve += total;

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

    function cancelStay(uint256 batchId, uint256 day) external nonReentrant {
        Stay memory s = stays[batchId][day];
        require(s.booker == msg.sender, "Not the booker");
        require(s.bookedAt > 0, "No stay to cancel");
        require(day > block.timestamp / 1 days, "Too late to cancel");

        for (uint256 i = 0; i < s.nights; i++) {
            nightTaken[batchId][day + i] = false;
        }

        uint256 refund = s.pricePerNight * s.nights;
        refundableReserve -= refund;

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

    function withdraw(uint256 amount) external onlyOwner nonReentrant {
        require(amount > 0, "Amount must be > 0");
        uint256 freeBalance = usdc.balanceOf(address(this));
        require(freeBalance >= refundableReserve, "Refund reserve underfunded");
        require(freeBalance - refundableReserve >= amount, "Insufficient free balance");

        require(usdc.transfer(msg.sender, amount), "USDC transfer failed");

        emit Withdrawn(msg.sender, amount);
    }

    function settleStay(uint256 batchId, uint256 day) external onlyOwner {
        Stay storage s = stays[batchId][day];
        require(s.bookedAt > 0, "No stay to settle");
        require(day < block.timestamp / 1 days, "Stay has not passed");

        uint256 value = s.pricePerNight * s.nights;
        refundableReserve -= value;

        for (uint256 i = 0; i < s.nights; i++) {
            nightTaken[batchId][day + i] = false;
        }
        delete stays[batchId][day];
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
