import { ethers } from "hardhat";

async function main() {
  const Lock = await ethers.getContractFactory("OffchainResolver");
  const lock = await Lock.deploy("https://api.sheetns.xyz/{sender}/{data}.json", [process.env.PUB_KEY]);

  await lock.deployed();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
