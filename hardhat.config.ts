import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { INFURA_API_KEY, SEPOLIA_PRIVATE_KEY } from "./sepolia";

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY]
    }
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    outputFile: `reports/${new Date().toISOString()}_gas_report.txt`,
    noColors: true,
    token: "ETH"
  }
};

export default config;
