// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract EtherOwner {
    address payable private _owner;

    /**
     * @dev Emitted when the owner is changed from `previousOwner` to `newOwner`.     
     */
    event EtherOwnerTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Emitted when `value` ether are moved from the contract to another (`to`).     
     */
    event Withdrew(address indexed to, uint256 value);

    /**
     * @dev Emitted when `value` ether are received by the contract from another (`from`).     
     */
    event Received(address indexed from, uint256 value);

    constructor(address owner_)  {
        _owner = payable(owner_);
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyEtherOwner() {
        require(_owner == msg.sender, "EtherOwner: caller is not the owner");
        _;
    }

    /**
     * @dev Returns the ether owner.
     */
    function etherOwner() external view returns (address) {
        return _owner;
    }

    /**
     * @dev Returns the ether balance.
     */
    function balance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Transfers ownership of the ether withdraw right to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferEtherOwner(address newOwner) public onlyEtherOwner {
        require(newOwner != address(0), "EtherOwner: new owner is the zero address");

        address oldOwner = _owner;
        _owner = payable(newOwner);
        emit EtherOwnerTransferred(oldOwner, newOwner);
    }

    /**
     * @dev Make the contract ETH receivable.
     */
    receive() payable external { 
        emit Received(msg.sender, msg.value);
    }

    /**
     * @dev Withdraw `amount` of ether from `contract` to the `owner`.
     */
    function withdraw(uint256 amount) external onlyEtherOwner {
        require(amount <= address(this).balance, "EtherOwner: withdraw amount exceeds contract balance");

        _owner.transfer(amount);
        emit Withdrew(_owner, amount);
    }    
}