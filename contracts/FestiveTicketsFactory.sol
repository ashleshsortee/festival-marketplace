pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./FestivalNFT.sol";
import "./FestivalMarketplace.sol";
import "./CloneFactory.sol";

contract FestiveTicketsFactory is Ownable, CloneFactory {
    struct Festival {
        string festName;
        string festSymbol;
        uint256 ticketPrice;
        uint256 totalSupply;
        address marketplace;
    }

    address nftMasterContract;
    address marketplaceMasterContract;
    address[] private activeFests;
    mapping(address => Festival) private activeFestsMapping;

    event Created(address ntfAddress, address marketplaceAddress);

    constructor(address _nftMasterContract, address _marketplaceMasterContract)
        public
    {
        nftMasterContract = _nftMasterContract;
        marketplaceMasterContract = _marketplaceMasterContract;
    }

    // Creates new NFT and a marketplace for its purchase
    function createNewFest(
        FestToken token,
        string memory festName,
        string memory festSymbol,
        uint256 ticketPrice,
        uint256 totalSupply
    ) public onlyOwner returns (address) {
        // FestivalNFT newFest =
        //     new FestivalNFT(
        // festName,
        // festSymbol,
        // ticketPrice,
        // totalSupply,
        // msg.sender
        //     );

        FestivalNFT newFest = FestivalNFT(createClone(nftMasterContract));
        newFest.init(
            festName,
            festSymbol,
            ticketPrice,
            totalSupply,
            msg.sender
        );

        // FestivalMarketplace newMarketplace =
        //     new FestivalMarketplace(token, newFest);

        FestivalMarketplace newMarketplace =
            FestivalMarketplace(createClone(marketplaceMasterContract));

        newMarketplace.init(token, newFest);

        address newFestAddress = address(newFest);

        activeFests.push(newFestAddress);
        activeFestsMapping[newFestAddress] = Festival({
            festName: festName,
            festSymbol: festSymbol,
            ticketPrice: ticketPrice,
            totalSupply: totalSupply,
            marketplace: address(newMarketplace)
        });

        emit Created(newFestAddress, address(newMarketplace));

        return newFestAddress;
    }

    // Get all active fests
    function getActiveFests() public view returns (address[] memory) {
        return activeFests;
    }

    // Get fest's details
    function getFestDetails(address festAddress)
        public
        view
        returns (
            string memory,
            string memory,
            uint256,
            uint256,
            address
        )
    {
        return (
            activeFestsMapping[festAddress].festName,
            activeFestsMapping[festAddress].festSymbol,
            activeFestsMapping[festAddress].ticketPrice,
            activeFestsMapping[festAddress].totalSupply,
            activeFestsMapping[festAddress].marketplace
        );
    }
}
