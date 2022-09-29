import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { deployNonUpgradable } from "../../scripts/utils";
const deployContract: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // @ts-ignore
  await deployNonUpgradable("AlchemicTokenV2", ["Mixture USD", "mxUSD", 100]);
};

export default deployContract;
deployContract.tags = ["AlchemicTokenV2"];
