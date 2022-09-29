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
    process.env.CTOKEN_ADDRESS_USDT ||
    (await deployments.get("MockYieldTokenUSDT")).address;
  const underlyingToken =
    process.env.UNDERLYING_TOKEN_ADDRESS_USDT ||
    (await deployments.get("ERC20MockUSDT")).address;

  if (yieldToken === "" || underlyingToken === "") {
    throw new Error("Invalid yieldToken or underlyingToken");
  }
  // @ts-ignore
  await deployNonUpgradable(
    "CTokenAdapter",
    [yieldToken, underlyingToken],
    "CTokenAdapterUSDT"
  );
};

export default deployContract;
deployContract.tags = ["CTokenAdapterUSDT"];
if (process.env.network !== "aurora_mainnet") {
  deployContract.dependencies = ["ERC20MockUSDT", "MockYieldTokenUSDT"];
}
