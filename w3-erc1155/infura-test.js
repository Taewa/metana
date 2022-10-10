const { ethers } = require('ethers');
const INFURA_ID = '7c9a9d50cc0d4012b81b97a82ba1b962';
const provider = new ethers.providers.JsonRpcProvider(`https://mainnet.infura.io/v3/${INFURA_ID}`);
const address = '0x54EF0A58A2498cd02577caFF45496F346B6094fD';

const main = async() => {
    const balance = await provider.getBalance(address);

    console.log(`TAEHWA TEST BALANCE: ${balance}`);
}

main();