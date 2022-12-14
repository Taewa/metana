// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

/**
You must have a total of 7 tokens within the collection id [0-6]
There is no supply limit for each token
Anyone can mint tokens [0-2], but there is a 1-minute cooldown between mints. 
These are free to mint except for the gas cost.
Token 3 can be minted by burning token 0 and 1.
Token 4 can be minted by burning token 1 and 2
Token 5 can be minted by burning 0 and 2
Token 6 can be minted by burning 0, 1, and 2
Tokens [3-6] cannot be forged into other tokens
Tokens [3-6] can be burned but you get nothing back
You can trade any token for [0-2] by hitting the trade this button.
The process of burning and minting is called forging in this context.
The webapp must tell the user how much matic they have (we will use the polygon network for cost savings)
The webapp must tell the user how much of each token they have
Provide a link to the OpenSea page somewhere
Important if the website detects someone is not on the polygon network, 
it must prompt them to change and autofill the feeds for changing the network (lesson on this later)
Important please use some styling on this website to make it look nice (bootstrap, tailwind CSS, etc). 
This is something you can show to future employers or business partners.
You must use 2 separate contracts. One for the ERC1155 token, and one for the forging logic. 
The forging logic will need mint privileges.
 */

/**
Check how to connect Smart contract / Metamask / Polygon:
https://www.quicknode.com/guides/smart-contract-development/how-to-deploy-a-smart-contract-on-maticpolygon
*/
contract PokemonToken is ERC1155 {
    uint8 public constant COOLDOWN_TIME = 60;

    struct Pokemon {
        uint256 id;
        string name;
        bool isFree;
        bool isTradable;
        uint256[] requirement;
        uint256 cooldown;
    }

    mapping(uint256 => Pokemon) public PokemonList;

    constructor() ERC1155("https://game.example/api/item/{id}.json") {
        init();
    }

    function mint(address _to, uint256 _tokenId) external {
        _mint(_to, _tokenId, 1, "");
    }

    function transfer(address _to, uint256 _tokenId) external {
        _safeTransferFrom(msg.sender, _to, _tokenId, 1, "0x0");
    }

    function burnBatch(
        address _from,
        uint256[] memory _tokenIds,
        uint256[] memory amounts
    ) external {
        _burnBatch(_from, _tokenIds, amounts);
    }

    function _afterTokenTransfer(
        address, /* operator */
        address, /* from */
        address, /* to */
        uint256[] memory ids,
        uint256[] memory, /* amounts */
        bytes memory /* data */
    ) internal override {
        cooldownMinting(ids);
    }

    function cooldownMinting(uint256[] memory ids) private {
        for (uint256 i = 0; i < ids.length; i++) {
            PokemonList[ids[i]].cooldown = block.timestamp;
        }
    }

    function checkCooldownTime(uint256 _id) external view returns (bool) {
        uint256 cooldown = PokemonList[_id].cooldown;

        if (cooldown == 0) return true;

        uint256 timePassed = block.timestamp - cooldown;

        return timePassed > COOLDOWN_TIME;
    }

    function getPokemonInfo(uint256 _tokenId)
        external
        view
        returns (Pokemon memory)
    {
        return PokemonList[_tokenId];
    }

    function init() private {
        PokemonList[0].id = 0;
        PokemonList[0].name = "SCIZOR";
        PokemonList[0].isFree = true;
        PokemonList[0].isTradable = true;

        PokemonList[1].id = 1;
        PokemonList[1].name = "LUCARIO";
        PokemonList[1].isFree = true;
        PokemonList[1].isTradable = true;

        PokemonList[2].id = 2;
        PokemonList[2].name = "MUDKIP";
        PokemonList[2].isFree = true;
        PokemonList[2].isTradable = true;

        PokemonList[3].id = 3;
        PokemonList[3].name = "PIKACHU";
        PokemonList[3].isFree = false;
        PokemonList[3].isTradable = false;
        PokemonList[3].requirement = [0, 1];

        PokemonList[4].id = 4;
        PokemonList[4].name = "SQUIRTLE";
        PokemonList[4].isFree = false;
        PokemonList[4].isTradable = false;
        PokemonList[4].requirement = [1, 2];

        PokemonList[5].id = 5;
        PokemonList[5].name = "UMBREON";
        PokemonList[5].isFree = false;
        PokemonList[5].isTradable = false;
        PokemonList[5].requirement = [0, 2];

        PokemonList[6].id = 6;
        PokemonList[6].name = "CHARIZARD";
        PokemonList[6].isFree = false;
        PokemonList[6].isTradable = false;
        PokemonList[6].requirement = [0, 1, 2];
    }
}
