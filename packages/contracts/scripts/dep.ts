import { ethers } from "hardhat";

async function main() {
  const Lock = await ethers.getContractFactory("OffchainResolver");
  const lock = await Lock.deploy("http://localhost:8080/{sender}/{data}.json", ["0x6b23Eb5B8Cfe6C1EFd9fD7Bbd93874E4534d0603"]);

  await lock.deployed();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
