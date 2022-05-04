const { ethers } = require("hardhat");
const chai = require("chai");
const { eachAsync_ } = require('@genx/july');

const settings = require("./lib/settings");

chai.use(require("chai-as-promised"));
const { expect } = chai;

// Test suite
describe("vesting", function () {
    let Contract;
    let contract;

    // Deploy the contract before each testing
    beforeEach(async function () {
        Contract = await ethers.getContractFactory("DecodeGlobal");
        contract = await Contract.deploy();
        await contract.deployed();
    });

    it.skip("setup", async function () {
        expect(await settings.balanceIs(contract, settings.address2, 0)).to.be.true;
        expect(await settings.balanceIs(contract, settings.address3, 0)).to.be.true;
        expect(await settings.balanceIs(contract, settings.address4, 0)).to.be.true;

        const list = [
            settings.address2,
            settings.address3,
            settings.address4
        ];
        
        /*
        await eachAsync_(list, async address => {


            await contract.grantVesting(address, settings.tokens(100), )
        });
        */
    });
    
});
