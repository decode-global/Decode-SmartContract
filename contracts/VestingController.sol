// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./VestingWallet.sol";
import "./IVestingController.sol";

contract VestingController is IVestingController {
    mapping(address => address[]) private _wallets;

    function getWallets(address user) 
        public
        view virtual override
        returns(address[] memory)
    {
        return _wallets[user];
    }

    function setupVestingWallet(address beneficiary, uint64 startTimestamp,
        uint64 vestingPeriod)
        public virtual override
        returns(address)
    {
        address wallet = address(new VestingWallet(beneficiary, startTimestamp, vestingPeriod));

        _wallets[beneficiary].push(wallet);

        emit Created(wallet, msg.sender, beneficiary, block.timestamp, startTimestamp, vestingPeriod);        

        return wallet;
    }
}

