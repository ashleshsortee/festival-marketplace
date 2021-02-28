pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./FestToken.sol";

contract FestivalNFT is Context, AccessControl, ERC721 {
    using Counters for Counters.Counter;

    Counters.Counter private _ticketIds;
    Counters.Counter private _saleTicketId;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    struct TicketDetails {
        uint256 purchasePrice;
        uint256 sellingPrice;
        bool forSale;
    }

    address private _organiser;
    address[] private customers;
    uint256[] private ticketsForSale;
    uint256 private _ticketPrice;
    uint256 private _totalSupply;

    mapping(uint256 => TicketDetails) private _ticketDetails;
    mapping(address => uint256[]) private purchasedTickets;

    // 1. Fetch all tickets for user
    // 2. List all tickets for sale

    constructor(
        string memory festName,
        string memory FestSymbol,
        uint256 ticketPrice,
        uint256 totalSupply,
        address organiser
    ) public ERC721(festName, FestSymbol) {
        _setupRole(MINTER_ROLE, organiser);

        _ticketPrice = ticketPrice;
        _totalSupply = totalSupply;
        _organiser = organiser;
    }

    modifier isValidTicketCount {
        require(
            _ticketIds.current() < _totalSupply,
            "Maximum ticket limit exceeded!"
        );
        _;
    }

    modifier isMinterRole {
        require(
            hasRole(MINTER_ROLE, _msgSender()),
            "User must have minter role to mint"
        );
        _;
    }

    modifier isValidSellAmount(uint256 ticketId) {
        uint256 purchasePrice = _ticketDetails[ticketId].purchasePrice;
        uint256 sellingPrice = _ticketDetails[ticketId].sellingPrice;

        require(
            purchasePrice + ((purchasePrice * 110) / 100) > sellingPrice,
            "Re-selling price is more than 110%"
        );
        _;
    }

    modifier isSecondaryPurchaseEnable(uint256 ticketId) {
        require(
            _ticketDetails[ticketId].forSale == true,
            "Ticket is not for sale!"
        );
        _;
    }

    function mint(address operator)
        internal
        virtual
        isMinterRole
        returns (uint256)
    {
        _ticketIds.increment();
        uint256 newTicketId = _ticketIds.current();
        _mint(operator, newTicketId);

        // approve(operator, newTicketId);

        _ticketDetails[newTicketId] = TicketDetails({
            purchasePrice: _ticketPrice,
            sellingPrice: 0,
            forSale: false
        });

        return newTicketId;
    }

    function bulkMintTickets(uint256 numOfTickets, address operator)
        public
        virtual
        isValidTicketCount
    {
        require(
            (ticketCounts() + numOfTickets) <= 1000,
            "Number of tickets exceeds maximum ticket count"
        );

        for (uint256 i = 0; i < numOfTickets; i++) {
            mint(operator);
        }
    }

    function transferTicket(address buyer) public {
        _saleTicketId.increment();
        uint256 saleTicketId = _saleTicketId.current();

        require(
            msg.sender == ownerOf(saleTicketId),
            "Only initial purchase allowed"
        );

        transferFrom(ownerOf(saleTicketId), buyer, saleTicketId);

        if (!isCustomerExist(buyer)) {
            customers.push(buyer);
        }
        purchasedTickets[buyer].push(saleTicketId);
    }

    function secondaryTransferTicket(address buyer, uint256 saleTicketId)
        public
        // isSecondaryPurchaseEnable(saleTicketId)
        isValidSellAmount(saleTicketId)
    {
        address seller = ownerOf(saleTicketId);
        uint256 sellingPrice = _ticketDetails[saleTicketId].sellingPrice;

        transferFrom(seller, buyer, saleTicketId);

        if (!isCustomerExist(buyer)) {
            customers.push(buyer);
        }

        purchasedTickets[buyer].push(saleTicketId);

        removeTicketFromCustomer(seller, saleTicketId);
        removeTicketFromSale(saleTicketId);

        _ticketDetails[saleTicketId] = TicketDetails({
            purchasePrice: sellingPrice,
            sellingPrice: 0,
            forSale: false
        });
    }

    function setSaleDetails(
        uint256 ticketId,
        uint256 sellingPrice,
        address operator
    ) public {
        uint256 purchasePrice = _ticketDetails[ticketId].purchasePrice;

        require(
            purchasePrice + ((purchasePrice * 110) / 100) > sellingPrice,
            "Re-selling price is more than 110%"
        );

        // Should not be an organiser
        require(
            !hasRole(MINTER_ROLE, _msgSender()),
            "Functionality only allowed for secondary market"
        );

        _ticketDetails[ticketId].sellingPrice = sellingPrice;
        _ticketDetails[ticketId].forSale = true;

        if (!isSaleTicketAvailable(ticketId)) {
            ticketsForSale.push(ticketId);
        }

        approve(operator, ticketId);
    }

    function getTicketPrice() public view returns (uint256) {
        return _ticketPrice;
    }

    function getOrganiser() public view returns (address) {
        return _organiser;
    }

    function ticketCounts() public view returns (uint256) {
        return _ticketIds.current();
    }

    function getNextSaleTicketId() public view returns (uint256) {
        return _saleTicketId.current();
    }

    function getSellingPrice(uint256 ticketId) public view returns (uint256) {
        return _ticketDetails[ticketId].sellingPrice;
    }

    // function getPurchaseDetails() public view returns (uint256, uint256) {
    //     return (getNextSaleTicketId(), _ticketPrice);
    // }

    function getTicketsForSale() public view returns (uint256[] memory) {
        return ticketsForSale;
    }

    function getTicketDetails(uint256 ticketId)
        public
        view
        returns (
            uint256 purchasePrice,
            uint256 sellingPrice,
            bool forSale
        )
    {
        return (
            _ticketDetails[ticketId].purchasePrice,
            _ticketDetails[ticketId].sellingPrice,
            _ticketDetails[ticketId].forSale
        );
    }

    function getTicketsOfCustomer(address customer)
        public
        view
        returns (uint256[] memory)
    {
        return purchasedTickets[customer];
    }

    function isCustomerExist(address buyer) internal view returns (bool) {
        for (uint256 i = 0; i < customers.length; i++) {
            if (customers[i] == buyer) {
                return true;
            }
        }
        return false;
    }

    function isSaleTicketAvailable(uint256 ticketId)
        internal
        view
        returns (bool)
    {
        for (uint256 i = 0; i < ticketsForSale.length; i++) {
            if (ticketsForSale[i] == ticketId) {
                return true;
            }
        }
        return false;
    }

    function removeTicketFromCustomer(address customer, uint256 ticketId)
        internal
    {
        uint256 numOfTickets = purchasedTickets[customer].length;

        for (uint256 i = 0; i < numOfTickets; i++) {
            if (purchasedTickets[customer][i] == ticketId) {
                for (uint256 j = i + 1; j < numOfTickets; j++) {
                    purchasedTickets[customer][j - 1] = purchasedTickets[
                        customer
                    ][j];
                }
                purchasedTickets[customer].pop();
            }
        }
    }

    function removeTicketFromSale(uint256 ticketId) internal {
        uint256 numOfTickets = ticketsForSale.length;

        for (uint256 i = 0; i < numOfTickets; i++) {
            if (ticketsForSale[i] == ticketId) {
                for (uint256 j = i + 1; j < numOfTickets; j++) {
                    ticketsForSale[j - 1] = ticketsForSale[j];
                }
                ticketsForSale.pop();
            }
        }
    }
}
