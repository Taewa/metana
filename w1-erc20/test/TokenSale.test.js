const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = ethers;

describe("TokenSale", async () => {
  const SOME_TOKEN_OWNER = 0;
  const TOKEN_SALE_OWNER = 1;
  const TOKEN_BUYER = 2;
  const TOKEN_RESELLER = 3;
  let accounts = null;
  let tokenContract = null;
  let tokenSaleContract = null;
  let provider;
  let utils;

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    provider = ethers.provider;
    utils = ethers.utils;

    // Deploy Token contract first
    const TokenContractFactory = await ethers.getContractFactory("SomeToken");
    tokenContract = await TokenContractFactory.deploy();
    await tokenContract.deployed();
    await tokenContract
      .connect(accounts[SOME_TOKEN_OWNER])
      .mint(accounts[TOKEN_SALE_OWNER].address);

    // Then deploy TokenSale contract
    const TokenSaleContractFactory = await ethers.getContractFactory("TokenSale", accounts[TOKEN_SALE_OWNER]);
    tokenSaleContract = await TokenSaleContractFactory.deploy(tokenContract.address);
    await tokenSaleContract.deployed();
  });

  describe("buyToken()", async () => {
    it("should fail when given msg.value is 0 or lower", async () => {
      await expect(
        tokenSaleContract
        .connect(accounts[TOKEN_BUYER])
        .buyToken()
      ).to.be.revertedWith("Should send higher than 0 wei.")
    });

    it("should fail when given msg.value is too low", async () => {
      await expect(
        tokenSaleContract
        .connect(accounts[TOKEN_BUYER])
        .buyToken({value: utils.parseEther("0.0000000000001")})
      ).to.be.revertedWith("1 TST costs minimum 10**15.")
    });

    it("should succeed to transfer", async () => {
      await tokenContract
        .connect(accounts[TOKEN_SALE_OWNER])
        .approve(tokenSaleContract.address, utils.parseEther("1"));

      const tx = await tokenSaleContract
        .connect(accounts[TOKEN_BUYER])
        .buyToken({value: utils.parseEther("0.001")});

      await tx.wait();

      const buyerToken = await tokenContract.balanceOf(accounts[TOKEN_BUYER].address);

      expect(buyerToken.toString()).to.be.equal("1", "0.001 ether === 1 token.");
    });

    it("should payback left over ether", async () => {
      await tokenContract
        .connect(accounts[TOKEN_SALE_OWNER])
        .approve(tokenSaleContract.address, utils.parseEther("1"));

      const tx = await tokenSaleContract
        .connect(accounts[TOKEN_BUYER])
        // 0.0005 ether is supposed to be paid back
        .buyToken({value: utils.parseEther("0.0015")});

      await tx.wait();

      const buyerBalance = await provider.getBalance(accounts[TOKEN_BUYER].address);
      
      // The reason why using closeTo is the count on gas fee
      expect(buyerBalance).to.be.closeTo(
        // by default, the account has 10000 eth
        new BigNumber.from(utils.parseEther("9999.999")),
        new BigNumber.from(utils.parseEther("0.005"))
      );
    })
  });

  describe("withdraw()", () => {
    it("should fail when the method caller is not an owner", async () => {
      await expect(
        tokenSaleContract
        .connect(accounts[TOKEN_BUYER]) // <- Not TokenSale contract owner
        .withdraw()
        ).to.be.revertedWith("Ownable: caller is not the owner")
    });
    
    it("should fail when TokenSale contract does not have balance", async () => {
      await expect(
        tokenSaleContract
        .connect(accounts[TOKEN_SALE_OWNER])
        .withdraw()
        ).to.be.revertedWith("No balance in the contact")
    });

    it("should fail when transaction fails", async () => {
      /**
       * To test failure of ether transaction, a contract that doesn't have receive() nor fallback() is needed.
       * Because this kind of contract cannot receive ether thus it will throw an error.
       * Importanct thing is to set "transferOwnership" as contract's address.
       * https://ethereum.stackexchange.com/questions/136986/how-to-test-failure-of-withdraw-ether
       */

      // Create & deploy TestHeler
      const TestWithdrawHelperFactory = await ethers.getContractFactory("TestWithdrawHelper", accounts[TOKEN_SALE_OWNER]);
      const testWithdrawHelper = await TestWithdrawHelperFactory.deploy();
      
      await testWithdrawHelper.deployed();

      // Create & deploy TokenSale
      const NewTokenSaleContractFactory = await ethers.getContractFactory("TokenSale", testWithdrawHelper);
      const newTokenSaleContract = await NewTokenSaleContractFactory.deploy(tokenContract.address);
      await newTokenSaleContract.deployed();

      // Update ownership to make failure of ether transaction
      newTokenSaleContract.transferOwnership(testWithdrawHelper.address);

      await testWithdrawHelper.setTokenSale(newTokenSaleContract.address);

      // Approve dealing token
      await tokenContract
        .connect(accounts[TOKEN_SALE_OWNER])
        .approve(newTokenSaleContract.address, utils.parseEther("1"));

      // Buyer pays 1 eth
      const tx = await newTokenSaleContract
        .connect(accounts[TOKEN_BUYER])
        .buyToken({value: utils.parseEther("1")});

      await tx.wait();

      // Because the testWithdrawHelper contract cannot deal with ether transaction, it will throw an error 
      await expect(
        testWithdrawHelper
          .connect(accounts[TOKEN_SALE_OWNER])
          .targetWithdraw()
        ).to.be.revertedWith("Failed to send user balance back to the owner");
    });

    it("should succeed withdraw", async () => {
      await tokenContract
        .connect(accounts[TOKEN_SALE_OWNER])
        .approve(tokenSaleContract.address, utils.parseEther("1"));

      // Buyer pays 1 eth
      const tx = await tokenSaleContract
        .connect(accounts[TOKEN_BUYER])
        .buyToken({value: utils.parseEther("1")});

      await tx.wait();

      const withdraw = await tokenSaleContract
        .connect(accounts[TOKEN_SALE_OWNER])
        .withdraw()

      await withdraw.wait();
    });
  });

  describe("sellBack()", () => {
    it("should return 0.5 ether when 1000 tokens are sent. And burn the same amount of token from contract", async () => {
      await tokenContract
      .connect(accounts[TOKEN_SALE_OWNER])
      .approve(tokenSaleContract.address, utils.parseEther("1"));

      await tokenContract.updateTokenSaleContract(tokenSaleContract.address);

      // Buyer pays 1 eth
      const tx = await tokenSaleContract
        .connect(accounts[TOKEN_RESELLER])
        .buyToken({value: utils.parseEther("1")});
      
      await tx.wait();
      
      const tokenBuyerBalance1 = await tokenContract.balanceOf(accounts[TOKEN_RESELLER].address);
      expect(tokenBuyerBalance1.toString()).to.be.equal("1000", "At this point the buyer should have 1000 tokens because it paid 1 eth.");

      const sellbackTx = await tokenSaleContract
      .connect(accounts[TOKEN_RESELLER])
      .sellBack(1000);
      await sellbackTx.wait();

      const tokenBuyerBalance2 = await tokenContract.balanceOf(accounts[TOKEN_RESELLER].address);

      expect(tokenBuyerBalance2.toString()).to.be.equal("0", "Should have 0 token because it sold back.");

      const buyerBalance = await provider.getBalance(accounts[TOKEN_RESELLER].address);

      expect(buyerBalance).to.be.closeTo(
        // by default, the account has 10000 eth
        new BigNumber.from(utils.parseEther("9999.5")),
        new BigNumber.from(utils.parseEther("0.005"))
      );
    });
  });
});