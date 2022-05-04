const { ethers } = require("hardhat");
const chai = require("chai");
const { eachAsync_ } = require('@genx/july');

const settings = require("./lib/settings");

chai.use(require("chai-as-promised"));
const { expect } = chai;

// Test suite
describe("batch & evenDrop", function () {
    let Contract;
    let contract;

    // Deploy the contract before each testing
    beforeEach(async function () {
        Contract = await ethers.getContractFactory("DecodeGlobal");
        contract = await Contract.deploy();
        await contract.deployed();
    });

    it("even drop", async function () {
        expect(await settings.balanceIs(contract, settings.address2, 0)).to.be.true;
        expect(await settings.balanceIs(contract, settings.address3, 0)).to.be.true;
        expect(await settings.balanceIs(contract, settings.address4, 0)).to.be.true;

        const list = [
            settings.address2,
            settings.address3,
            settings.address4
        ];
        
        const tx1 = await contract.evenDrop(list, settings.tokens(100));
        const receipt = await tx1.wait();        
        const gasUsed1 = parseInt(receipt.gasUsed.toString());

        console.log('3x batch gas:', gasUsed1);

        expect(await settings.balanceIs(contract, settings.address2, 100)).to.be.true;
        expect(await settings.balanceIs(contract, settings.address3, 100)).to.be.true;
        expect(await settings.balanceIs(contract, settings.address4, 100)).to.be.true;

        let gasUsed2 = 0;

        await eachAsync_(list, async addr => {
            const tx = await contract.transfer(addr, settings.tokens(100));
            gasUsed2 += parseInt((await tx.wait()).gasUsed.toString());
        });

        expect(await settings.balanceIs(contract, settings.address2, 200)).to.be.true;
        expect(await settings.balanceIs(contract, settings.address3, 200)).to.be.true;
        expect(await settings.balanceIs(contract, settings.address4, 200)).to.be.true;

        console.log('3x single gas:', gasUsed2);

        expect(gasUsed2).to.greaterThan(gasUsed1);
    });

    it("batch", async function () {
        expect(await settings.balanceIs(contract, settings.address2, 0)).to.be.true;
        expect(await settings.balanceIs(contract, settings.address3, 0)).to.be.true;
        expect(await settings.balanceIs(contract, settings.address4, 0)).to.be.true;

        const list = [
            settings.address2,
            settings.address3,
            settings.address4
        ];

        const amounts = [
            settings.tokens(100),
            settings.tokens(200),
            settings.tokens(300),
        ];
        
        const tx1 = await contract.batch(list, amounts);
        const receipt1 = await tx1.wait();        
        const gasUsed1 = parseInt(receipt1.gasUsed.toString());

        console.log('3x batch gas:', gasUsed1);

        expect(await settings.balanceIs(contract, settings.address2, 100)).to.be.true;
        expect(await settings.balanceIs(contract, settings.address3, 200)).to.be.true;
        expect(await settings.balanceIs(contract, settings.address4, 300)).to.be.true;

        let gasUsed2 = 0;

        await eachAsync_(list, async (addr, i) => {
            const tx = await contract.transfer(addr, amounts[i]);
            const receipt = await tx.wait();      
            gasUsed2 += parseInt(receipt.gasUsed.toString());
        });

        expect(await settings.balanceIs(contract, settings.address2, 200)).to.be.true;
        expect(await settings.balanceIs(contract, settings.address3, 400)).to.be.true;
        expect(await settings.balanceIs(contract, settings.address4, 600)).to.be.true;

        console.log('3x single gas:', gasUsed2);
    });

    it("batch overflow", async function () {
        expect(await settings.balanceIs(contract, settings.address2, 0)).to.be.true;
        expect(await settings.balanceIs(contract, settings.address3, 0)).to.be.true;
        expect(await settings.balanceIs(contract, settings.address4, 0)).to.be.true;
        expect(await settings.balanceIs(contract, settings.address5, 0)).to.be.true;

        const list = [
            settings.address3,
            settings.address4,
            settings.address5
        ];

        const amounts = [
            settings.tokens(100),
            settings.tokens(200),
            settings.tokens(300),
        ];

        await contract.transfer(settings.address2, settings.tokens(400));
        expect(await settings.balanceIs(contract, settings.address2, 400)).to.be.true;

        const [_, addr2] = await ethers.getSigners();
        
        expect(contract.connect(addr2).batch(list, amounts)).to.be.rejectedWith(/Arithmetic operation underflowed or overflowed outside of an unchecked block/);

        expect(await settings.balanceIs(contract, settings.address2, 400)).to.be.true;
        expect(await settings.balanceIs(contract, settings.address3, 0)).to.be.true;
        expect(await settings.balanceIs(contract, settings.address4, 0)).to.be.true;
        expect(await settings.balanceIs(contract, settings.address5, 0)).to.be.true;
    });

    
});
