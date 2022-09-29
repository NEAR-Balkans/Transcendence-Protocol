import * as dotenv from "dotenv";

import "@openzeppelin/hardhat-upgrades";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-deploy";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;

const config = {
  defaultNetwork: "hardhat",
  namedAccounts: {
    deployer: 0,
  },
  solidity: {
    version: "0.8.11",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    aurora_mainnet: {
      url: process.env.URL,
      accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
      chainId: 1313161554,
    },
    aurora_testnet: {
      url: process.env.URL,
      accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
      chainId: 1313161555,
    },
    // goerli: {
    //   url: process.env.GOERLI_URL,
    //   accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
    //   chainId: 5,
    //   gas: 2100000,
    //   gasPrice: 6000000000,
    // },
    // ropsten: {
    //   url: process.env.ROPSTEN_URL || "",
    //   accounts:
    //     process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    // },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: {
      aurora: process.env.ETHERSCAN_API_KEY,
    },
  },
  typechain: {
    outDir: "./typechain",
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
  },
};

export default config;
