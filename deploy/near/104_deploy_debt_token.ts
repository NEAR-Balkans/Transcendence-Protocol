import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { deployNonUpgradable } from "../../scripts/utils";
const deployContract: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // @ts-ignore
  await deployNonUpgradable(
    "AlchemicTokenNEARV2",
    ["Mixture NEAR", "mxNEAR", 100],
    "AlchemicTokenNEARV2"
  );
};

export default deployContract;
deployContract.tags = ["AlchemicTokenNEARV2"];
