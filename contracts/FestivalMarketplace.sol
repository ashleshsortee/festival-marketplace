pragma solidity ^0.6.0;

import "./FestivalNFT.sol";
import "./FestToken.sol";

contract FestivalMarketplace {
    FestToken private _token;
    FestivalNFT private _festival;

    address private _organiser;

    constructor(FestToken token, FestivalNFT festival) public {
        _token = token;
        _festival = festival;
        _organiser = _festival.getOrganiser();
    }

    function purchaseTicket() public {
        address buyer = msg.sender;

        _token.transferFrom(buyer, _organiser, _festival.getTicketPrice());

        _festival.transferTicket(buyer);
    }

    function secondaryPurchase(uint256 ticketId) public {
        address seller = _festival.ownerOf(ticketId);
        address buyer = msg.sender;
        uint256 sellingPrice = _festival.getSellingPrice(ticketId);
        uint256 commision = (sellingPrice * 10) / 100;

        // 1. Seller approve deligate approval to address(this) for amount sellingPrice + commision
        // 2. address.this transfers commision to organiser
        // 3. address(this) transfers sellingPrice to buyer

        _token.transferFrom(buyer, seller, sellingPrice);
        _token.transferFrom(buyer, _organiser, commision);

        _festival.secondaryTransferTicket(buyer, ticketId);
    }
}
