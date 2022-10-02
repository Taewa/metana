// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./2-MyERC20Token.sol";

contract TokenDealer {
    MyERC20Token private myErc20Token;
    address contractOwner;

    constructor(address _myERC20Token) {
        myErc20Token = MyERC20Token(_myERC20Token);
        contractOwner = msg.sender;
    }

    event Test(address sender, address receiver, uint256 tokenAmount);

    function mintNFTByERC20(address _account, uint256 _erc20TokenAmount)
        external
    {
        emit Test(_account, address(this), _erc20TokenAmount);
        myErc20Token.transferFrom(_account, address(this), _erc20TokenAmount);
    }

    function buyERC20Token() external payable {
        // 1 ether => 1 MET (MyERC20Token)
        // msg.value is wei
        require(msg.value >= 10**18, "1 MET costs minimum 10**18.");

        uint256 tokens = msg.value / 10**18;

        require(tokens >= 1, "1 MET costs minimum 10**18.");

        uint256 change = msg.value - tokens * 10**18;

        myErc20Token.transferFrom(contractOwner, msg.sender, tokens * 10**18);

        // return rest of ether.
        payable(msg.sender).transfer(change);
    }
}
