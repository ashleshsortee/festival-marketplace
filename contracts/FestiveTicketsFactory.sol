pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./FestivalNFT.sol";
import "./FestivalMarketplace.sol";

contract FestiveTicketsFactory {
    // mapping(address => string) activeFestsMapping;
    address[] activeFests;
    address[] marketplace;

    function createNewFest(
        FestToken token,
        string memory festName,
        string memory festSymbol,
        uint256 ticketPrice,
        uint256 totalSupply
    ) public returns (bool) {
        FestivalNFT newFest =
            new FestivalNFT(
                festName,
                festSymbol,
                ticketPrice,
                totalSupply,
                msg.sender
            );

        FestivalMarketplace newMarketplace =
            new FestivalMarketplace(token, newFest);

        activeFests.push(address(newFest));
        marketplace.push(address(newMarketplace));

        return true;
    }
}
