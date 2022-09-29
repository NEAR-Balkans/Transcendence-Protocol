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
  const debtToken = await deployments.get("AlchemicTokenV2");
  const whitelist = await deployments.get("WhitelistUSDT");
  const underlyingToken =
    process.env.UNDERLYING_TOKEN_ADDRESS_USDT ||
    (await deployments.get("ERC20MockUSDT")).address;
  const transmuterBuffer = await deployments.get("TransmuterBuffer");
  await deployUpgradable(
    "TransmuterV2",
    [
      debtToken.address,
      underlyingToken,
      transmuterBuffer.address,
      whitelist.address,
    ],
    "TransmuterV2USDT"
  );
};

export default deployContract;
deployContract.tags = ["TransmuterV2USDT"];
deployContract.dependencies = [
  "TransmuterBuffer",
  "WhitelistUSDT",
  "ERC20MockUSDT",
];
