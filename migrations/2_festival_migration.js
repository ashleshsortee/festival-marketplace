const FestToken = artifacts.require("FestToken");
const FestiveTicketsFactory = artifacts.require("FestiveTicketsFactory");
const FestivalMarketplace = artifacts.require("FestivalMarketplace");
const FestivalNFT = artifacts.require("FestivalNFT");

module.exports = function (deployer) {
  deployer.deploy(FestToken);
  // deployer.deploy(FestiveTicketsFactory);

  // deployer.deploy(FestivalMarketplace)
  //   .then(() => deployer.deploy(FestivalMarketplace))
  //   .then((marketplace) => deployer.deploy(FestiveTicketsFactory, marketplace.address));



  const marketplace = deployer.deploy(FestivalMarketplace);
  const nft = deployer.deploy(FestivalNFT);

  Promise.all([nft, marketplace])
    .then(([nft, marketplace]) => deployer.deploy(FestiveTicketsFactory, nft.address, marketplace.address));
};
