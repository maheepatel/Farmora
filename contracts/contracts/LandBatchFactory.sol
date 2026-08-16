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
