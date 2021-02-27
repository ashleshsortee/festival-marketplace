const FestToken = artifacts.require("FestToken");
const FestiveTicketsFactory = artifacts.require("FestiveTicketsFactory");

module.exports = function (deployer) {
  deployer.deploy(FestToken);
  deployer.deploy(FestiveTicketsFactory);
};
