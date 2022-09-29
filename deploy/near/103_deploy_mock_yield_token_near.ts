import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { deployNonUpgradable } from "../../scripts/utils";
const deployContract: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // @ts-ignore
  const { deployments } = hre;
  if (hre.network.name !== "aurora_mainnet") {
    const underlyingToken = await deployments.get("ERC20MockNEAR");

    // @ts-ignore
    await deployNonUpgradable(
      "MockYieldToken",
      [underlyingToken.address, "Collateral NEAR", "cNEAR", 8],
      "MockYieldTokenNEAR"
    );
  }
};

export default deployContract;
deployContract.tags = ["MockYieldTokenNEAR"];
deployContract.dependencies = ["ERC20MockNEAR"];
