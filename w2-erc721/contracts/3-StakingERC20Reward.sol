// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
1. (ACC1) Deploy StakingERC20Reward.sol
2. (ACC1) Deploy MyNFT.sol
3. (ACC1) Deploy StakingManager with address of RewardERC20 & MyNFT
4. (ACC1) On RewardERC20, run setMintPermission() with address of StakingManager
5. Switch to ACC2
6. (ACC2) On MyNFT, mint a NFT
7. (ACC2) On MyNFT, run safeTransferFrom (from: ACC2, to: address of StakingManager)
8. At this moment, staking is started. Check onERC721Received() on StakingManager
9. (ACC2) On StakingManager, run checkReward() to know how many ERC20 the account can profit
10.(ACC2) On StakingManger, run requestReward() to mint ERC20 token to the account as reward
11. (ACC2) On StakingManger, run withdrawNFT() to unstake
*/
contract RewardERC20 is ERC20, Ownable {
    uint256 public constant MAX_MINT = 100 * 10**18; // 100000000000000000000
    address private minter;

    constructor() ERC20("RewardToken", "RWT") {}

    function mint(address _to, uint256 _amount) external {
        require(msg.sender == minter, "Only minter can mint ERC20 token.");
        require(MAX_MINT >= totalSupply(), "Reachead limit of max mint.");

        _mint(_to, _amount);
    }

    function setMintPermission(address _target) external onlyOwner {
        minter = _target;
    }
}
