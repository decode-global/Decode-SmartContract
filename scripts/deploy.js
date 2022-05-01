const {
    Starters: { startWorker },
} = require("@genx/app");

startWorker(
    async (app) => {
        // get the contract to deploy
        const DecodeGlobal = await ethers.getContractFactory("DecodeGlobal");
        app.log("info", "Deploying DECODE...");

        // deploy
        const decode = await DecodeGlobal.deploy();
        await decode.deployed();
        app.log("info", `DECODE deployed to: ${decode.address}`);
    }
);
