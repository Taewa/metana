async function main() {
    const GodMode = await ethers.getContractFactory('GodMode');
    console.log('Deploying GodMode...');
    const godMode = await GodMode.deploy();
    await godMode.deployed();
    console.log('GodMode deployed to:', godMode.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });