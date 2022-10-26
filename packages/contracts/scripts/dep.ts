import { ethers } from "hardhat";

async function main() {
  const Lock = await ethers.getContractFactory("OffchainResolver");
  console.log(process.env.PUB_KEY)
  const lock = await Lock.deploy("https://api.sheetns.xyz/{sender}/{data}.json", [process.env.PUB_KEY]);
  // const lock = await Lock.deploy("http://localhost:8080/{sender}/{data}.json", [process.env.PUB_KEY]);

  await lock.deployed();
  console.log(lock)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
