// For Vertigo installation in Mac,
// Add: export PATH="/Users/LJ15PH/Library/Python/3.9/bin:$PATH" into .bash_profile or .zshrc
// If there is yaml error, then run: pip install PyYAML
// The current project structure doesn't work. Check the link:
// https://github.com/JoranHonig/vertigo/issues/42
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SomeToken", async () => {
  const TOKEN_CONTRACT_OWNER = 0;
  const TOKEN_SALE_OWNER = 1;
  const TOKEN_BURNER = 2;
  let accounts = null;
  let tokenContract = null;

  beforeEach(async () => {
    const TokenContractFactory = await ethers.getContractFactory("SomeToken");
    tokenContract = await TokenContractFactory.deploy();
    await tokenContract.deployed();
    accounts = await ethers.getSigners();
  });

  it("should have 0 token from the beginning", async () => {
    const totalSupply = await tokenContract.totalSupply();

    expect(totalSupply.toString()).to.be.equal("0", "It should be 0 from the beginning.")
  });

  describe("mint()", async () => {
    it("should mint 1,000,000 tokens", async () => {
      await tokenContract.mint(accounts[TOKEN_CONTRACT_OWNER].address);
      const totalSupply = await tokenContract.totalSupply();

      expect(totalSupply.toString()).to.be.equal("1000000000000000000000000", "The minted token should be 1,000,000 * 10 ** 18");
    });
  });

  describe("updateTokenSaleContract()", async () => {
    it("should update tokenSaleContract by given address", async () => {
      await tokenContract.updateTokenSaleContract(accounts[TOKEN_CONTRACT_OWNER].address);
    });
  });

  describe("burn()", async() => {
    it("should fail when tokenSaleContract is not valid", async() => {
      await expect(
        tokenContract
        .connect(accounts[TOKEN_SALE_OWNER])
        .burn(accounts[TOKEN_CONTRACT_OWNER].address, 1)
      ).to.be.revertedWith("Only TokenSale contract can burn the token.")
    });

    it("should succeed when tokenSaleContract is valid", async() => {
      await tokenContract.updateTokenSaleContract(accounts[TOKEN_SALE_OWNER].address);
      await tokenContract
        .connect(accounts[TOKEN_SALE_OWNER])
        .burn(accounts[TOKEN_SALE_OWNER].address, 0)
    });

    it("should burn token", async() => {
      await tokenContract.mint(accounts[TOKEN_CONTRACT_OWNER].address);
      await tokenContract.updateTokenSaleContract(accounts[TOKEN_SALE_OWNER].address);
      await tokenContract
        .connect(accounts[TOKEN_CONTRACT_OWNER])
        .transfer(accounts[TOKEN_BURNER].address, 100);
      const balanceOfContractOwner = await tokenContract.balanceOf(accounts[TOKEN_CONTRACT_OWNER].address);
      const balanceOfTokenBurner = await tokenContract.balanceOf(accounts[TOKEN_BURNER].address);

      expect(balanceOfContractOwner).to.be.equal("999999999999999999999900", "It should be (1,000,000 * 10 ** 18) - 100");
      expect(balanceOfTokenBurner).to.be.equal("100", "Because it has transferred from the contract owner.");
    });
  });
});