import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const Contract = await ethers.getContractFactory("Roulette");
  const contract = await Contract.deploy();
  
  const contractAddress = await contract.getAddress();
  console.log("Roulette deployed to:", contractAddress);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});