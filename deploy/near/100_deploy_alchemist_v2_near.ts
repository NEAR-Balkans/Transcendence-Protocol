import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { deployUpgradable } from "../../scripts/utils";
// @ts-ignore
import { ethers } from "hardhat";

const deployContract: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // @ts-ignore
  const { getNamedAccounts, deployments } = hre;
  const { deployer } = await getNamedAccounts();

  const debtTokenDecimal = 24;
  const alchemicTokenV2 = await deployments.get("AlchemicTokenNEARV2");
  const transmuterBuffer = await deployments.get("TransmuterBufferNEAR");
  const whitelist = await deployments.get("WhitelistNEAR");

  const params = {
    admin: deployer,
    debtToken: alchemicTokenV2.address,
    transmuter: transmuterBuffer.address,
    minimumCollateralization: ethers.utils.parseUnits("2", debtTokenDecimal),
    protocolFee: 1000,
    protocolFeeReceiver: process.env.ADMIN,
    mintingLimitMinimum: ethers.utils.parseUnits("1000000", debtTokenDecimal),
    mintingLimitMaximum: ethers.utils.parseUnits("5000000", debtTokenDecimal),
    mintingLimitBlocks: 300,
    whitelist: whitelist.address,
  };

  // @ts-ignore
  await deployUpgradable("AlchemistNEARV2", [params], "AlchemistNEARV2");
};

export default deployContract;
deployContract.tags = ["AlchemistNEARV2"];
deployContract.dependencies = [
  "AlchemicTokenNEARV2",
  "CTokenAdapterNEAR",
  "TransmuterBufferNEAR",
  "WhitelistNEAR",
];
