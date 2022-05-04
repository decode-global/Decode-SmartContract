const { ethers } = require("hardhat");
const { expect } = require("chai");

const settings = require("./lib/settings");

// Test suite
describe("ether", function () {
    let Contract;
    let contract;

    // Deploy the contract before testing
    before(async function () {
        Contract = await ethers.getContractFactory("DecodeGlobal");
        contract = await Contract.deploy();
        await contract.deployed();
    });

    it("Get etherOwner", async function () {
        const etherOwner = await contract.etherOwner();
        
        const signer = contract.signer.address.toLowerCase();
        expect(etherOwner.toLowerCase()).to.equal(signer);
    });

    it("Receive & withdraw", async function () {
        const [ addr1 ] = await ethers.getSigners(); 

        let bal = await contract.balance();
        expect(bal.toString()).to.equal('0');

        let balAddr1 = await addr1.getBalance();

        const transaction = await addr1.sendTransaction({
            to: contract.address,
            value: ethers.utils.parseEther("2"), // Sends exactly 1.0 ether
        });

        await transaction.wait();

        balAddr1 = await addr1.getBalance();

        bal = await contract.balance();
        expect(bal.toString()).to.equal(settings.tokens(2));

        await contract.withdraw(ethers.utils.parseEther("1"));

        bal = await contract.balance();
        expect(bal.toString()).to.equal(settings.tokens(1));

        const bal2Addr1 = await addr1.getBalance();
        expect(bal2Addr1.gt(balAddr1)).to.be.true;
    });

});
