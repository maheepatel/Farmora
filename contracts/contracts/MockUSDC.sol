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
