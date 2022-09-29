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
    process.env.CTOKEN_ADDRESS_USDC ||
    (await deployments.get("MockYieldTokenUSDC")).address;
  const underlyingToken =
    process.env.UNDERLYING_TOKEN_ADDRESS_USDC ||
    (await deployments.get("ERC20MockUSDC")).address;

  if (yieldToken === "" || underlyingToken === "") {
    throw new Error("Invalid yieldToken or underlyingToken");
  }
  // @ts-ignore
  await deployNonUpgradable(
    "CTokenAdapter",
    [yieldToken, underlyingToken],
    "CTokenAdapterUSDC"
  );
};

export default deployContract;
deployContract.tags = ["CTokenAdapterUSDC"];
if (process.env.network !== "aurora_mainnet") {
  deployContract.dependencies = ["ERC20MockUSDC", "MockYieldTokenUSDC"];
}
