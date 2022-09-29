import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { deployNonUpgradable } from "../../scripts/utils";
const deployContract: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // @ts-ignore
  await deployNonUpgradable("Whitelist", [], "WhitelistUSDT");
};

export default deployContract;
deployContract.tags = ["WhitelistUSDT"];