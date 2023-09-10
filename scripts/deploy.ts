import { ethers } from "hardhat";

async function main() {
  const ens = await ethers.deployContract("ENS");

  await ens.waitForDeployment();

  console.log(`Deploy! at ${ens.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
