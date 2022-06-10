const { ethers } = require("hardhat");
const { expect } = require("chai");

const settings = require("./lib/settings");

// Test suite
describe("BVT", function () {
    let Contract;
    let contract;

    // Deploy the contract before testing
    before(async function () {
        Contract = await ethers.getContractFactory("DecodeGlobal");
        contract = await Contract.deploy();
        await contract.deployed();
    });

    it("Get signer", async function () {
        const signer = contract.signer.address.toLowerCase();
        expect(signer).to.equal(settings.address1);
    });

    it("Get balance", async function () {
        const balance = await contract.balanceOf(contract.signer.address);
        expect(balance.toString()).to.equal(settings.tokens(100000000000));
    });

    it("Transfer", async function () {
        let balance2 = await contract.balanceOf(settings.address2);
        expect(balance2.toString()).to.equal("0");

        await contract.transfer(settings.address2, settings.tokens(10));

        balance2 = await contract.balanceOf(settings.address2);
        expect(balance2.toString()).to.equal(settings.tokens(10));
    });
});
