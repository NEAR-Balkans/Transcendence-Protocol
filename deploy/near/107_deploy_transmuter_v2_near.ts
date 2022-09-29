// @ts-ignore
import hre, { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { deployUpgradable } from "../../scripts/utils";

const deployContract: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // @ts-ignore
  const { deployments } = hre;
  const debtToken = await deployments.get("AlchemicTokenNEARV2");
  const whitelist = await deployments.get("WhitelistNEAR");
  const underlyingToken =
    process.env.UNDERLYING_TOKEN_ADDRESS_NEAR ||
    (await deployments.get("ERC20MockNEAR")).address;
  const transmuterBuffer = await deployments.get("TransmuterBufferNEAR");
  await deployUpgradable(
    "TransmuterV2",
    [
      debtToken.address,
      underlyingToken,
      transmuterBuffer.address,
      whitelist.address,
    ],
    "TransmuterV2NEAR"
  );
};

export default deployContract;
deployContract.tags = ["TransmuterV2NEAR"];
deployContract.dependencies = [
  "TransmuterBufferNEAR",
  "WhitelistNEAR",
  "AlchemicTokenNEARV2",
  "'ERC20MockNEAR'",
];
