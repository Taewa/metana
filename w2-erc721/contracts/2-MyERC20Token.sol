// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
1. (ACC1) Deploy MyERC20Token.sol
2. (ACC1) Mint to ACC2
3. Switch to ACC2
4. (ACC2) Deploy TokenDealer.sol with address of MyERC20Token
5. (ACC2) use "approve" with spender: address of TokenDealer and amount
6. (ACC2) Deploy MyNFTToken.sol with address of TokenDealer
7. Switch to ACC3
8. (ACC3) Buy ERC20 Token by paying 10 ether
9. (ACC3) use "approve" with spender address of TokenDealer and amount
10. (ACC3) Mint on NFT contract 
*/
contract MyERC20Token is ERC20, Ownable {
    constructor() ERC20("MyERC20Token", "MET") {}

    function mint(address _to) public onlyOwner {
        _mint(_to, 100 * 10**decimals());
    }
}
