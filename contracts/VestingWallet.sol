// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./EtherOwner.sol"; 

/**
 * @title VestingWallet
 * @dev This contract handles the vesting of ERC-20 tokens for a given beneficiary. Custody of multiple tokens
 * can be given to this contract, which will release the token to the beneficiary following a given vesting schedule.
 * The vesting schedule is customizable through the {vestedAmount} function.
 *
 * Any token transferred to this contract will follow the vesting schedule as if they were locked from the beginning.
 * Consequently, if the vesting has already started, any amount of tokens sent to this contract will (at least partly)
 * be immediately releasable.
 */
contract VestingWallet is EtherOwner {
    /**
     * @dev Emitted when `amount` of `token` are released.     
     */
    event TokenReleased(address indexed token, uint256 amount);

    mapping(address => uint256) private _tokenReleased;
    address private immutable _beneficiary;
    uint64 private immutable _start;
    uint64 private immutable _duration;

    /**
     * @dev Set the beneficiary, start timestamp and vesting duration of the vesting wallet.
     */
    constructor(
        address beneficiaryAddress,
        uint64 startTimestamp,
        uint64 durationSeconds
    ) EtherOwner(payable(msg.sender)) {
        require(beneficiaryAddress != address(0), "VestingWallet: beneficiary is zero address");
        _beneficiary = beneficiaryAddress;
        _start = startTimestamp;
        _duration = durationSeconds;
    }

    /**
     * @dev Getter for the beneficiary address.
     */
    function beneficiary() external view virtual returns (address) {
        return _beneficiary;
    }

    /**
     * @dev Getter for the start timestamp.
     */
    function start() external view virtual returns (uint64) {
        return _start;
    }

    /**
     * @dev Getter for the vesting duration.
     */
    function duration() external view virtual returns (uint64) {
        return _duration;
    }

    /**
     * @dev Amount of token already released
     */
    function released(address token) public view virtual returns (uint256) {
        return _tokenReleased[token];
    }

    /**
     * @dev Release the tokens that have already vested.
     *
     * Emits a {TokensReleased} event.
     */
    function release(address token) external virtual {
        uint256 releasable = vestedAmount(token, uint64(block.timestamp)) - released(token);

        if (releasable > 0) {
            _tokenReleased[token] += releasable;
            emit TokenReleased(token, releasable);

            SafeERC20.safeTransfer(IERC20(token), _beneficiary, releasable);
        }
    }

    /**
     * @dev Calculates the amount of tokens that has already vested. Default implementation is a linear vesting curve.
     */
    function vestedAmount(address token, uint64 timestamp) public view virtual returns (uint256) {
        return _vestingSchedule(IERC20(token).balanceOf(address(this)) + released(token), timestamp);
    }

    /**
     * @dev Virtual implementation of the vesting formula. This returns the amount vested, as a function of time, for
     * an asset given its total historical allocation.
     */
    function _vestingSchedule(uint256 totalAllocation, uint64 timestamp) internal view virtual returns (uint256) {
        if (timestamp < _start) {
            return 0;
        } else if (timestamp > _start + _duration) {
            return totalAllocation;
        } else {
            return (totalAllocation * (timestamp - _start)) / _duration;
        }
    }
}
