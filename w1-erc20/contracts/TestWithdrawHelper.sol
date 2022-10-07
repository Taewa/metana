// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./TokenSale.sol";
import "hardhat/console.sol";

/**
 * This contract is for testing "Failure" of transfering ether during test
 */
contract TestWithdrawHelper {
    TokenSale tokenSaleContract;

    function setTokenSale(address _tokenSale) external {
        tokenSaleContract = TokenSale(_tokenSale);
    }

    function targetWithdraw() external {
        tokenSaleContract.withdraw();
    }

    function getTokenSale() external view returns (TokenSale) {
        return tokenSaleContract;
    }
}