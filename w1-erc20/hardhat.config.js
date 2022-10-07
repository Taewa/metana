/** @type import('hardhat/config').HardhatUserConfig */
require('@nomiclabs/hardhat-ethers');
require("@nomicfoundation/hardhat-chai-matchers");
require('solidity-coverage');
// require('@nomiclabs/hardhat-waffle'); // Leave it in case of use for future
// require("@ethereum-waffle/mock-contract");  // Leave it in case of use for future
// require("@ethereum-waffle/provider");  // Leave it in case of use for future


module.exports = {
  solidity: "0.8.17",
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    }
  },
};
