exports.address1 = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";
exports.address2 = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8";
exports.address3 = "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc";
exports.address4 = "0x15d34aaf54267db7d7c367839aaf71a00a2c6a65";
exports.address5 = "0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc";

exports.key2 = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

exports.decimalPart = "000000000000000000";

exports.tokens = (amount) => (amount === 0 ? "0" : `${amount}${exports.decimalPart}`);

exports.balanceIs = async (contract, address, amount) =>
    (await contract.balanceOf(address)).toString() === exports.tokens(amount);
