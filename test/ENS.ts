import { loadFixture, setBalance, setBlockGasLimit } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";

describe("ENS", () => {
  async function deployENSTest() {
    const [owner, otherAccount] = await ethers.getSigners();
    const baseFee = 30_000_000_000;

    const ENS = await ethers.getContractFactory("ENS");
    const ensDeploy = await ENS.deploy(baseFee);

    return { ensDeploy, owner, otherAccount, baseFee };
  }

  describe("Domínios", () => {
    it("Deve permitir só dono registrar domínio", async () => {
      const { ensDeploy, owner, otherAccount, baseFee } = await loadFixture(deployENSTest);

      let newDomain = "dominioSensacional";
      let newValue = "valueSensacional";

      await ensDeploy.connect(owner).registerDomain(newDomain);
      await ensDeploy.connect(owner).setValue(newDomain, newValue, { value: baseFee });
      await expect(ensDeploy.connect(otherAccount).registerDomain(newDomain + "algoDiferente")).to.be.revertedWith("so o dono pode registrar");
    })

    it("Deve permitir só quem setou pegar o value de um address", async () => {
      const { ensDeploy, owner, otherAccount, baseFee } = await loadFixture(deployENSTest);

      let newDomain = "dominioSensacional";
      let newValue = "valueSensacional";

      await ensDeploy.connect(owner).registerDomain(newDomain);
      await ensDeploy.connect(otherAccount).setValue(newDomain, newValue, { value: baseFee });
      await expect(ensDeploy.connect(owner)["getValue(string,address)"](newDomain, otherAccount.address)).to.be.revertedWith('Voce nao e o dono do valor!');
      expect(await ensDeploy.connect(otherAccount)["getValue(string,address)"](newDomain, otherAccount.address)).to.be.equal(newValue);
    })

    it("Qualquer um deve conseguir pegar o address de um value", async () => {
      const { ensDeploy, owner, otherAccount, baseFee } = await loadFixture(deployENSTest);

      let newDomain = "dominioSensacional";
      let newValue = "valueSensacional";

      await ensDeploy.connect(owner).registerDomain(newDomain);
      await ensDeploy.connect(otherAccount).setValue(newDomain, newValue, { value: baseFee });
      expect(await ensDeploy.connect(owner)["getValue(string,string)"](newDomain, newValue)).to.be.equal(otherAccount.address);
      expect(await ensDeploy.connect(otherAccount)["getValue(string,string)"](newDomain, newValue)).to.be.equal(otherAccount.address);
      expect(await ensDeploy.connect(otherAccount)["getValue(string,address)"](newDomain, otherAccount.address)).to.be.equal(newValue);
    })

    it("Só um set por value", async () => {
      const { ensDeploy, owner, otherAccount, baseFee } = await loadFixture(deployENSTest);

      let newDomain = "dominioSensacional";
      let newValue = "valueSensacional";

      await ensDeploy.connect(owner).registerDomain(newDomain);
      await ensDeploy.connect(otherAccount).setValue(newDomain, newValue, { value: baseFee });
      await expect(ensDeploy.connect(owner).setValue(newDomain, newValue, { value: baseFee })).to.be.reverted;
      await ensDeploy.connect(owner).setValue(newDomain, newValue + "outra coisa", { value: baseFee });
      await expect(ensDeploy.connect(otherAccount).setValue(newDomain, newValue, { value: baseFee })).to.be.reverted;
      await expect(ensDeploy.connect(otherAccount).setValue(newDomain, newValue + "outra coisa", { value: baseFee })).to.be.reverted;
    })

    it("Cobra de acordo com o número de caracteres", async () => {
      const { ensDeploy, owner, otherAccount, baseFee } = await loadFixture(deployENSTest);

      let newDomain = "dominioSensacional";

      await ensDeploy.connect(owner).registerDomain(newDomain);


      for (let i = 15; i > 0; i--) {
        const ac = ethers.Wallet.createRandom(ethers.provider);
        setBalance(ac.address, baseFee * 1_000_000_000_000);
        await ensDeploy.connect(ac).setValue(newDomain, "i".repeat(i), { value: Math.floor(baseFee / i) });
      }
    })
  })
})