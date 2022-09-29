// @ts-ignore
import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { deployUpgradable } from "../../scripts/utils";
const deployContract: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // @ts-ignore
  const { deployments, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();
  const debtToken = await deployments.get("AlchemicTokenV2");

  await deployUpgradable("TransmuterBuffer", [deployer, debtToken.address]);
};

export default deployContract;
deployContract.tags = ["TransmuterBuffer"];
deployContract.dependencies = ["AlchemicTokenV2"];
