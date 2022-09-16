// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Sanctions is ERC20 {
    constructor() ERC20("AuthToken", "AUT") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
        authority = msg.sender;
    }

    address authority;

    mapping(address => bool) internal blacklist;

    modifier onlyAuthority() {
        require(msg.sender == authority, "Only authority is allowed.");
        _;
    }

    function addBlacklist(address target) public onlyAuthority {
        blacklist[target] = true;
    }

    function removeBlacklist(address target) public onlyAuthority {
        blacklist[target] = false;
    }

    function seeBlacklist(address target) public view onlyAuthority returns (bool) {
        return blacklist[target];
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override virtual {
        require(blacklist[from] == false, "You are now allowed to transer.");
        require(blacklist[to] == false, "You are now allowed to receive.");
    }
}