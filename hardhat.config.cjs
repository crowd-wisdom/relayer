/* eslint-disable @typescript-eslint/no-var-requires */
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ethers");
const dotenv = require("dotenv");

const path = require("path");

dotenv.config();

const parentDir = __dirname.includes("build") ? ".." : "";

module.exports = {
  defaultNetwork: process.env.NETWORK,
  networks: {
    localhost: {
      url: process.env.RELAYER_RPC_URL || "",
      accounts: [process.env.PRIVATE_KEY],
      loggingEnabled: false,
    },
    hardhat: {
      loggingEnabled: false,
    },
  },
  paths: {
    sources: path.resolve(__dirname, parentDir, "./node_modules/maci-contracts/contracts"),
    artifacts: path.resolve(__dirname, parentDir, "./node_modules/maci-contracts/artifacts"),
  },
};
