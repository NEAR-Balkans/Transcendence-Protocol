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

  const alchemicTokenV2 = await deployments.get("AlchemicTokenV2");
  const transmuterBuffer = await deployments.get("TransmuterBuffer");
  const whitelist = await deployments.get("Whitelist");

  const params = {
    admin: deployer,
    debtToken: alchemicTokenV2.address,
    transmuter: transmuterBuffer.address,
    minimumCollateralization: ethers.utils.parseEther("2"),
    protocolFee: 1000,
    protocolFeeReceiver: process.env.ADMIN,
    mintingLimitMinimum: ethers.utils.parseEther("1000000"),
    mintingLimitMaximum: ethers.utils.parseEther("5000000"),
    mintingLimitBlocks: 300,
    whitelist: whitelist.address,
  };

  // @ts-ignore
  await deployUpgradable("AlchemistV2", [params]);
};

export default deployContract;
deployContract.tags = ["AlchemistV2"];
deployContract.dependencies = [
  "AlchemicTokenV2",
  "CTokenAdapterUSDC",
  "CTokenAdapterUSDT",
  "TransmuterBuffer",
  "Whitelist",
  "WhitelistUSDC",
  "WhitelistUSDT",
];
