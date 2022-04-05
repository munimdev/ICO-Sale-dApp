pragma solidity ^0.4.2;

import "./wUTILToken.sol";

interface AggregatorV3Interface {
    function decimals() external view returns (uint8);

    function description() external view returns (string memory);

    function version() external view returns (uint256);

    // getRoundData and latestRoundData should both raise "No data present"
    // if they do not have data to report, instead of returning unset values
    // which could be misinterpreted as actual reported values.
    function getRoundData(uint80 _roundId)
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );

    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
}

contract wUTILTokenSale {
    address admin;
    wUTILToken public tokenContract;
    uint256 public tokenPrice; //in USD with 8 decimals. Defines token price of 1 * 10^18 tokens
    uint256 public tokensSold; //keeps track of tokens sold
    uint256 public minimumInvestment; //in USD with 8 decimals. Defines minimum amount of tokens that an investor can buy

    event Sell(address _buyer, uint256 _amount);

    modifier onlyAdmin() {
        require(msg.sender == admin);
        _;
    }

    constructor(
        wUTILToken _tokenContract,
        uint256 _tokenPrice,
        uint256 _minInvestment
    ) public {
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
        minimumInvestment = _minInvestment;
    }

    function multiply(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require(y == 0 || (z = x * y) / y == x);
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        // assert(b > 0); // Solidity automatically throws when dividing by 0
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold
        return c;
    }

    function buyTokens(uint256 _numberOfTokens) public payable {
        require(
            msg.value >=
                multiply(
                    _numberOfTokens,
                    div(tokenContract.decimals(), tokenPrice)
                ),
            "Please transfer more MATIC"
        );
        require(
            (msg.value / tokenContract.decimals()) * getPrice() >=
                minimumInvestment,
            "The payment is less than the minimum investmet."
        );
        require(tokenContract.balances(this) >= _numberOfTokens);
        require(tokenContract.transfer(msg.sender, _numberOfTokens));

        tokensSold += _numberOfTokens;

        emit Sell(msg.sender, _numberOfTokens);
    }

    function endSale() public payable {
        require(msg.sender == admin);
        require(tokenContract.transfer(admin, tokenContract.balances(this)));
        admin.transfer(address(this).balance);
    }

    function withdraw() public payable onlyAdmin {
        admin.transfer(address(this).balance);
    }

    function wihtdrawToAddress(address account) public payable onlyAdmin {
        account.transfer(address(this).balance);
    }

    function setTokenPrice(uint256 _newPrice) public onlyAdmin {
        tokenPrice = _newPrice;
    }

    function setMinimumInvestment(uint256 _newPrice) public onlyAdmin {
        minimumInvestment = _newPrice;
    }

    //get price of MATIc in USD with 8 decimals
    function getPrice() public view returns (uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada
        );
        (, int256 answer, , , ) = priceFeed.latestRoundData();
        return uint256(answer);
    }
}
