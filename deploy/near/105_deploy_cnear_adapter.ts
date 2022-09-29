// @ts-ignore
import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { deployNonUpgradable } from "../../scripts/utils";
const deployContract: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // @ts-ignore
  const { deployments } = hre;
  const yieldToken =
    process.env.CTOKEN_ADDRESS_NEAR ||
    (await deployments.get("MockYieldTokenNEAR")).address;
  const underlyingToken =
    process.env.UNDERLYING_TOKEN_ADDRESS_NEAR ||
    (await deployments.get("ERC20MockNEAR")).address;

  if (yieldToken == "" || underlyingToken == "") {
    throw new Error("Invalid yieldToken or underlyingToken");
  }
  // @ts-ignore
  await deployNonUpgradable(
    "CTokenAdapter",
    [yieldToken, underlyingToken],
    "CTokenAdapterNEAR"
  );
};

export default deployContract;
deployContract.tags = ["CTokenAdapterNEAR"];
deployContract.dependencies = ["ERC20MockNEAR", "MockYieldTokenNEAR"];
