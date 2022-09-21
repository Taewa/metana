// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./2-TokenDealer.sol";

contract MyNFT is ERC721 {
    uint8 public currentTokenNumber;
    uint8 constant public MAX_MINT = 100;

    constructor() ERC721("MyNFT", "MN") {}

    function mint(uint8 _tokenId) external {
        require(MAX_MINT > currentTokenNumber, "Reached max mint number.");
        
        _mint(msg.sender, _tokenId);
        currentTokenNumber++;
    }
}