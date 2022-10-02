// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// How to create NFT contract for test
// Open Metamask and select your test account and select Rinkeby Test Network
// Go to https://faucets.chain.link/rinkeby and get free ether
// Go to Remix IDE and select 'Injected Provider - Metamask'
// Deploy to the test network
// Open Etherscan. You will see the contract has been deployed
// But nothing will happen on OpenSea until at least one token is minted
// Mint a token
// Open Ethersanc. You will see the minted token address
// Go to https://testnets.opensea.io/ and paste the contract address

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
        require(
            MAX_TOKEN_SUPPLY > currentTokenNumber,
            "Reached the maximum amount of token."
        );
        _mint(_to, _tokenId);

        currentTokenNumber++;
    }

    function getCurrentTokenNumber() external view returns (uint8) {
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
