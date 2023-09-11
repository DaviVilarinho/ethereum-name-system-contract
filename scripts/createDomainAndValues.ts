import { ethers, network } from "hardhat";

async function main() {
  let contractAddress = "0x8Ab1C0DDBF31e3de51C69741c4516d68288f41D7";
  contractAddress = "0xf741c82935541db7Bc2934fc52D31288e49Da6c3";
  contractAddress = "0xe0C4B3043233aedCF30041B4C9a902c80bb5318c";
  const fee = 100000000000000;

  const [meOwner] = await ethers.getSigners();

  const myContract = await ethers.getContractAt("ENS", contractAddress);

  const randomSalt = new Date().toISOString();
  const domain = `com${randomSalt}`;
  const value = `vilarinho${randomSalt}`;

  console.log(`Will register ${domain} with value ${value}`);

  await myContract.connect(meOwner).registerDomain(domain);
  await myContract.connect(meOwner).registerDomain("com");
  await myContract.connect(meOwner).setValue(domain, value, { value: Math.floor(fee / value.length) });

  setTimeout(async () => {
    const addressResult = await myContract.connect(meOwner)["getValue(string,string)"](domain, value);

    console.log(`O address de ${domain} / ${value} é: ${addressResult}`);

  }, 50_000);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
