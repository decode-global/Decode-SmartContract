const { ethers } = require("hardhat");
const chai = require("chai");

const settings = require("./lib/settings");

chai.use(require("chai-as-promised"));
const { expect } = chai;

// Test suite
describe("approve", function () {
    let Contract;
    let contract;

    // Deploy the contract before each testing
    beforeEach(async function () {
        Contract = await ethers.getContractFactory("DecodeGlobal");
        contract = await Contract.deploy();
        await contract.deployed();
    });

    it("Transfer with 0 balance", async function () {
        let balance2 = await contract.balanceOf(settings.address2);
        expect(balance2.toString()).to.equal("0");

        const [_, addr2] = await ethers.getSigners();

        expect(contract.connect(addr2).transfer(settings.address3, settings.tokens(10))).to.be.rejectedWith(
            /transfer amount exceeds balance/
        );
    });

    it("Transfer from allowed wallet", async function () {
        const [addr1, addr2] = await ethers.getSigners();

        let allowance = await contract.allowance(settings.address1, settings.address2);
        expect(allowance.toString()).to.equal("0");

        expect(
            contract.connect(addr2).transferFrom(settings.address1, settings.address3, settings.tokens(10))
        ).to.be.rejectedWith(/insufficient allowance/);

        await contract.connect(addr1).approve(settings.address2, settings.tokens(10));

        allowance = await contract.allowance(settings.address1, settings.address2);
        expect(allowance.toString()).to.equal(settings.tokens(10));

        expect(settings.balanceIs(contract, settings.address3, 0)).to.eventually.be.true;

        await contract.connect(addr2).transferFrom(settings.address1, settings.address3, settings.tokens(10));

        expect(settings.balanceIs(contract, settings.address3, 10)).to.eventually.be.true;

        allowance = await contract.allowance(settings.address1, settings.address2);
        expect(allowance.toString()).to.equal("0");
    });
});
