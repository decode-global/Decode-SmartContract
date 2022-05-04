const { ethers } = require("hardhat");
const chai = require("chai");
const { eachAsync_, sleep_ } = require('@genx/july');

const settings = require("./lib/settings");

chai.use(require("chai-as-promised"));
const { expect } = chai;

// Test suite
describe("vesting", function () {
    let Contract;
    let contract;

    let VestingWallet;
    let VestingController;

    // Deploy the contract before each testing
    beforeEach(async function () {
        Contract = await ethers.getContractFactory("DecodeGlobal");
        contract = await Contract.deploy();
        await contract.deployed();

        VestingWallet = await ethers.getContractFactory("VestingWallet");
        VestingController = await ethers.getContractFactory("VestingController");
    });

    it("setup", async function () {
        expect(await settings.balanceIs(contract, settings.address2, 0)).to.be.true;
        expect(await settings.balanceIs(contract, settings.address3, 0)).to.be.true;
        expect(await settings.balanceIs(contract, settings.address4, 0)).to.be.true;

        const list = [
            settings.address2,
            //settings.address3,
            //settings.address4
        ];        

        const vestingController = VestingController.attach(await contract.vestingController());  
        
        await eachAsync_(list, async address => {
            const wallets = await vestingController.getWallets(address);
            expect(wallets.length).to.equal(0);
        });

        const block = await ethers.provider.getBlock("latest");     
        
        const startAfterSec = 3;
        const duration = 5;

        const startedAt = block.timestamp + startAfterSec;

        const bal1 = await contract.balanceOf(settings.address1);

        const wallets = await eachAsync_(list, async address => {           
            const walletTx = await contract.grantVesting(address, settings.tokens(100), startedAt, duration);            
            await walletTx.wait();

            const wallets = await vestingController.getWallets(address);
            expect(wallets.length).to.equal(1);
            return wallets[0];
        });

        const bal2 = await contract.balanceOf(settings.address1);
        expect(bal1.sub(bal2).toString()).to.equal(settings.tokens(list.length * 100));

        // before vesting
        await eachAsync_(wallets, async (wallet, i)  => {
            const vestingWallet = VestingWallet.attach(wallet);

            await vestingWallet.release(contract.address);

            const released = await vestingWallet.released(contract.address);
            expect(released.toString()).to.equal('0');

            expect(await settings.balanceIs(contract, wallet, 100)).to.be.true;

            const owner = await vestingWallet.beneficiary();
            expect(owner.toLowerCase()).to.equal(list[i]);

            const start = await vestingWallet.start();
            expect(start.toString()).to.equal(startedAt.toString());
        });

        await sleep_(startAfterSec*1000);

        // after the starting point of vesting
        await eachAsync_(wallets, async (wallet, i)  => {
            const vestingWallet = VestingWallet.attach(wallet);

            await vestingWallet.release(contract.address);

            const released = await vestingWallet.released(contract.address);
            expect(released.gt('0')).to.be.true;
            expect(released.lt(settings.tokens(100))).to.be.true;

            const balWallet = await contract.balanceOf(wallet);
            expect(balWallet.lt(settings.tokens(100))).to.be.true;

            expect(balWallet.add(released).toString()).to.equal(settings.tokens(100));            
        });

        // after fully vested
        for (let i = 0; i < duration; i++) {
            const blockLastest = await ethers.provider.getBlock("latest");    

            await eachAsync_(wallets, async (wallet, i)  => {
                const vestingWallet = VestingWallet.attach(wallet);                

                const vested = await vestingWallet.vestedAmount(contract.address, blockLastest.timestamp);
                console.log('vested:', vested.div(settings.tokens(1)).toString());
    
                await vestingWallet.release(contract.address);
    
                const released = await vestingWallet.released(contract.address);
                console.log('released:', released.div(settings.tokens(1)).toString());
    
                const targetBal = await contract.balanceOf(list[i]);
                console.log('beneficiary balance:', targetBal.div(settings.tokens(1)).toString());           
            });

            await sleep_(1000);
        }

        // finally, get all the tokens
        await eachAsync_(wallets, async (wallet, i)  => {
            const targetBal = await contract.balanceOf(list[i]);
            expect(targetBal.toString()).to.equal(settings.tokens(100));       
        });

    });
    
});
