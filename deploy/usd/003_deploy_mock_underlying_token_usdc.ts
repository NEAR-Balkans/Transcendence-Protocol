import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { deployNonUpgradable } from "../../scripts/utils";
const deployContract: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  if (hre.network.name !== "aurora_mainnet") {
    // @ts-ignore
    await deployNonUpgradable(
      "ERC20Mock",
      ["USDC", "USDC", 6],
      "ERC20MockUSDC"
    );
  }
};

export default deployContract;
deployContract.tags = ["ERC20MockUSDC"];
