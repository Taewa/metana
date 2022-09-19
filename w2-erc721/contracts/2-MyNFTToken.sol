// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./2-TokenDealer.sol";

contract MyNFTToken is ERC721 {
    address private immutable contractOwner;
    TokenDealer public immutable erc20Dealer;
    uint8 public currentTokenNumber; 
    uint256 public constant MIN_ERC20_AMOUNT_PER_ERC721 = 10 * 10 ** 18;

    constructor(address _erc20Dealer) ERC721("MyNFTToken", "MNT") {
        contractOwner = msg.sender;
        erc20Dealer = TokenDealer(_erc20Dealer);
    }

    function mint(uint8 _tokenId, uint256 _erc20TokenAmount) external {
        require(checkMinimumERC20Amount(_erc20TokenAmount), "The minimum required amount is 10 ERC20 token.");
        address account = msg.sender;
        erc20Dealer.mintNFTByERC20(account, _erc20TokenAmount);
        
        _mint(msg.sender, _tokenId);
        currentTokenNumber++;
    }

    function checkMinimumERC20Amount(uint256 _erc20TokenAmount) internal pure returns(bool) {
        return _erc20TokenAmount >= MIN_ERC20_AMOUNT_PER_ERC721;
    }
}