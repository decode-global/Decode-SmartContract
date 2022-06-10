// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IVestingController {
    event Created(address wallet, address from, address to, uint256 createdAt, uint64 vestingStartedAt, uint64 vestingPeriod);

    function getWallets(address user) 
        external
        view 
        returns(address[] memory);

    function setupVestingWallet(address beneficiary, uint64 startTimestamp,
        uint64 vestingPeriod)
        external 
        returns(address wallet);
}

