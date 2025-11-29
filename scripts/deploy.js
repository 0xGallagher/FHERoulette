import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const Contract = await ethers.getContractFactory("FHERoulette");
  const contract = await Contract.deploy();

  await contract.waitForDeployment();

  console.log("Roulette deployed to:", await contract.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
