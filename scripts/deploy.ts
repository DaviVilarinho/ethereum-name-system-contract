import { ethers, network } from "hardhat";

async function main() {
  const fee = 100000000000000;
  const ENS = await ethers.getContractFactory("ENS");
  const ensDeploy = await ENS.deploy(fee);

  await ensDeploy.waitForDeployment();
  console.log(`Deploy! at ${ensDeploy.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
