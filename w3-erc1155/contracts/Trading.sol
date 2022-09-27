// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "./PokemonToken.sol";

// Q: Why 2 separated contracts? (Trading, PokemonToken)
contract Trading is ERC1155Holder {
    PokemonToken pokemonToken;

    constructor(address _pokemonToken) {
        pokemonToken = PokemonToken(_pokemonToken);
    }

    function mint(uint256 _tokenId) public {
        require(pokemonToken.checkCooldownTime(_tokenId), "You must wait for cooltime for forging.");
        address to = msg.sender;

        if(pokemonToken.getPokemonInfo(_tokenId).isFree) {
            pokemonToken.mint(to, _tokenId);
        } else {
            mintNonFreeToken(to, _tokenId);
        }
    }

    function mintNonFreeToken(address _to, uint256 _tokenId) internal {
        uint256[] memory requirementTokens = pokemonToken.getPokemonInfo(_tokenId).requirement;
        uint256[] memory amounts = new uint256[](requirementTokens.length);
        address from = msg.sender;

        // Q: Which one is better between for loop VS PokemonList[n].required = [1, 1] in terms of gas usage?
        for(uint i = 0; i < requirementTokens.length; i++) {
            amounts[i] = 1;
        }

        pokemonToken.burnBatch(from, requirementTokens, amounts);
        pokemonToken.mint(_to, _tokenId);
    }

    function tradeToken(address _to, uint256 _tokenId) external {
        require(pokemonToken.getPokemonInfo(_tokenId).isTradable, "Selected token is not tradable.");
        
        pokemonToken.safeTransferFrom(msg.sender, _to, _tokenId, 1, "0x00");
    }

    function getAccountBalance(address _target) external view returns (uint256[] memory) {
        address[] memory addresses = new address[](7);
        uint256[] memory ids = new uint256[](7);
        
        for(uint8 i = 0; i < 7; i++) {
            addresses[i] = _target;
            ids[i] = i;
        }

        return pokemonToken.balanceOfBatch(addresses, ids);
    }
}