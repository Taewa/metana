// async function main() {
//     const GodMode = await ethers.getContractFactory('GodMode');
//     console.log('Deploying GodMode...');
//     const godMode = await GodMode.deploy();
//     await godMode.deployed();
//     console.log('GodMode deployed to:', godMode.address);
// }

// async function main() {
//     const SmartContract = await ethers.getContractFactory('Sanctions');
//     console.log('Deploying Sanctions...');
//     const sanctions = await SmartContract.deploy();
//     await sanctions.deployed();
//     console.log('Sanctions deployed to:', sanctions.address);
// }

// async function main() {
//     const Contract = await ethers.getContractFactory('TokenSale');
//     console.log('Deploying Contract...');
//     const c = await Contract.deploy();
//     await c.deployed();
//     console.log('Contract deployed to:', c.address);
// }

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });