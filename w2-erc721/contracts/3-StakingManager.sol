// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./3-StakingERC20Reward.sol";
import "./3-MyNFT.sol";


contract StakingManager is IERC721Receiver {
    RewardERC20 public rewardERC20;
    IERC721 public myNFT;
    mapping(uint256 => Stake) public Stakes;

    struct Stake {
        address originalOwner;
        uint256 time;
        uint256 tokenId;
    }

    constructor(address _rewardContract, address _nftContract) {
        rewardERC20 = RewardERC20(_rewardContract);
        myNFT = MyNFT(_nftContract);
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4) {
        setStake(from, tokenId);
        return IERC721Receiver.onERC721Received.selector;
    }

    function setStake(address _originalOwner, uint256 _tokenId) internal {
        Stakes[_tokenId] = Stake({
            originalOwner: _originalOwner,
            time: uint48(block.timestamp),
            tokenId: _tokenId
        });
    }

    function requestReward(uint256 _tokenId) public {
        uint256 stakedTime = Stakes[_tokenId].time;
        uint256 gainedERC20TokenAmount = getDepositPerDay(stakedTime);

        rewardERC20.mint(msg.sender, gainedERC20TokenAmount);

        Stakes[_tokenId].time = block.timestamp;
    }

    function checkReward(uint256 _tokenId) external view returns(uint256) {
        uint256 stakedTime = Stakes[_tokenId].time;
        uint256 gainedERC20TokenAmount = getDepositPerDay(stakedTime);

        return gainedERC20TokenAmount;
    }

    function withdrawNFT(uint256 _tokenId) external {
        require(Stakes[_tokenId].originalOwner == msg.sender, "Only the original owner can withdraw.");

        requestReward(_tokenId);    // Before withdraw, handle reward staking NFT to ERC20.

        myNFT.safeTransferFrom(address(this), msg.sender, _tokenId);

        delete Stakes[_tokenId];
    }

    function getDepositPerDay(uint256 _depoitTime) public view returns(uint256) {
        require(_depoitTime != 0, "Wrong time. Probably the NFT is withdrawn or no staking.");
        // return (block.timestamp - _depoitTime) / 60 / 60 / 24;   // every 1 day
        return (block.timestamp - _depoitTime) / 5; // every 5 seconds
    }
}