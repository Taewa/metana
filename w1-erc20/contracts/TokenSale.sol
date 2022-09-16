// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./SomeToken.sol";

contract TokenSale is Ownable {
    constructor(address _someToken) {
        contractOwner = payable(msg.sender);
        someToken = SomeToken(_someToken);
    }
    SomeToken private someToken;
    address payable contractOwner;
    uint256 public tokensPerEth = 1000;

    event BuyTokens(address buyer, uint256 ethAmount, uint256 tokenAmount);

    /**
    1. When the contract is deployed, use approve() to register buyer's address and token amount
    2. Switch buyer's account and buy token
     */
    function buyToken() public payable {
        // 10**18 wei => 1000 TST
        // 100**15 wei => 1 TST
        // 1 wei => (1000 / 10**18) TST
        // msg.value is wei
        require(msg.value > 0, "Should send higher than 0 wei.");
        require(msg.value >= 10**15, "1 TST costs minimum 10**15.");

        uint256 tokens = msg.value / 10**15;

        require(tokens >= 1, "1 TST costs minimum 10**15.");

        uint256 change = msg.value - tokens * 10 ** 15;

        // Q: I thought `msg.sender` is the one who call this contract with ether
        // but it seems like `msg.sender` is the BuyToken's address.
        someToken.transferFrom(contractOwner, msg.sender, tokens);
        
        // return rest of ether.
        payable(msg.sender).transfer(change);

    }

    function withdraw() public onlyOwner {
        uint256 ownerBalance = address(this).balance;
        require(ownerBalance > 0, "No balance in the contact");

        (bool sent,) = msg.sender.call{value: address(this).balance}("");
        require(sent, "Failed to send user balance back to the owner");
    }

    function sellBack(uint256 amount) public {
        uint256 tokenResellRate = 0.5 ether / tokensPerEth;
        uint256 sellBackTokenPrice = tokenResellRate * amount;

        someToken.burn(msg.sender, amount);

        payable(msg.sender).transfer(sellBackTokenPrice);
    }
}
