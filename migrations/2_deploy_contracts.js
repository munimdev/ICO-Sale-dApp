const wUTILToken = artifacts.require("./wUTILToken.sol");
const wUTILTokenSale = artifacts.require("./wUTILTokenSale.sol");

module.exports = function(deployer) {
    deployer.deploy(wUTILToken).then(function() {
        console.log("address is", wUTILToken.address);
        return deployer.deploy(wUTILTokenSale, wUTILToken.address, 4000000, 100000000); //0.04$ per token price, 100$ minimum investment
    });
};