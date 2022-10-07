// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// import "@openzeppelin/contracts/access/AccessControl.sol";

/**
How to use these contracts (SomeToken.sol & TokenSale.sol)
1. (ACC1) deploy SomeToken.sol
2. (ACC1) mint to ACC2
3. Switch to ACC2
4. (ACC2) Deploy TokenSale.sol with SomeToken address
5. (ACC2) Run SomeToken's increaseAllowance (OR approve) with TokenSale's address
6. Then it'd be _allowance[ACC2][TokenSale's address]
7. Switch to ACC3
8. (ACC3) Run TokenSale's buyToken with 1 ether
 */

contract SomeToken is Ownable, ERC20 {
    address private tokenSaleContract;

    constructor() ERC20("SomeToken", "STK") {}

    function mint(address to) public {
        _mint(to, 1_000_000 * 10**decimals());
    }

    function burn(address account, uint256 amount) external {
        require(
            msg.sender == tokenSaleContract,
            "Only TokenSale contract can burn the token."
        );
        _burn(account, amount); // Up to business decision. It can be transfer() if token must be returned to the owner.
    }

    function updateTokenSaleContract(address tokenSaleContractAddress)
        external
    {
        tokenSaleContract = tokenSaleContractAddress;
    }
}
