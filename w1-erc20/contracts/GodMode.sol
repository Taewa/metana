// contracts/GodMode.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract GodMode is ERC20 {
    constructor() ERC20("GodModeToken", "GMT") {
        uint256 maxTokenAmount = 1_000_000 * 10**decimals();
        _mint(msg.sender, maxTokenAmount);
        god = msg.sender;

        // for authoritativeTransferFrom method
        approve(god, maxTokenAmount);
    }

    modifier onlyGod() {
        require(msg.sender == god, "Only god is allowed.");
        _;
    }

    address private god;

    function mintTokensToAddress(address recipient, uint256 amount)
        external
        onlyGod
    {
        transfer(recipient, amount);
    }

    function changeBalanceAtAddress(address target, uint256 amount)
        external
        onlyGod
    {
        transfer(target, amount);
    }

    function authoritativeTransferFrom(
        address from,
        address to,
        uint256 amount
    ) external onlyGod {
        transferFrom(from, to, amount);
        // or transfer(to, amount);
    }
}
