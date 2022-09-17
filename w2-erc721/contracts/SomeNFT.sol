// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// contract on Etherscan: https://rinkeby.etherscan.io/tx/0x2a55ec9ede7e34725f81f5cf2d089755d444d72a5dfdca47cd82f1a33d8edb68
// 0.jpeg on Etherscan: https://rinkeby.etherscan.io/tx/0x90f3f415751d6b5237d8affa663570cedafb98c9f91b5416439f019afe830c68

// Go to the https://testnets.opensea.io/ and search with the contract address

contract SomeNFT is ERC721, Ownable {
    constructor() ERC721("SomeNFT", "SNT") {
        contractOwner = msg.sender;
    }

    address private contractOwner;
    uint8 public constant MAX_TOKEN_SUPPLY = 10;
    uint8 private currentTokenNumber; 

    function mint(address _to, uint256 _tokenId) external {
        require(MAX_TOKEN_SUPPLY > currentTokenNumber, "Reached the maximum amount of token.");
        _mint(_to, _tokenId);

        currentTokenNumber++;
    }

    function getCurrentTokenNumber() external view returns(uint8) {
        return currentTokenNumber;
    }

    function renounceOwnership() public pure override {
        require(false, "Cannot renounce ownership.");
    }

    function transferOwnership(address newOwner) public pure override {
        require(false, "Cannot transfer ownership.");
    }

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://QmUT14TBgCSYjpXUfVLAsEsehxzZKgw1kiKXHpZ3WjPUqL/";
    }
}