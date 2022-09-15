// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/access/AccessControl.sol";

/**
How to use these contracts (SomeToken.sol & TokenSale.sol)
1. (ACC1) deploy SomeToken.sol
2. (ACC1) mint to ACC2
3. Switch to ACC2
4. (ACC2) Deploy TokenSale.sol with SomeToken address
5. (ACC2) Run SomeToken's increaseAllowance with TokenSale's address
6. Then it'd be _allowance[ACC2][TokenSale's address]
7. Switch to ACC3
8. (ACC3) Run TokenSale's buyToken with 1 ether
 */

contract SomeToken is Ownable, ERC20 {
    address public burnAccount; 
    address public burnSender;
    constructor() ERC20("SomeToken", "STK") {}

    function mint(address to) public {
        _mint(to, 1000000);
    }

    function burn(address account, uint256 amount) public {
        burnAccount = account;  // buyer address. Debugging purpose.
        burnSender = msg.sender; // TokenSale address. Debugging purpose.
        _burn(account, amount);
    }
}