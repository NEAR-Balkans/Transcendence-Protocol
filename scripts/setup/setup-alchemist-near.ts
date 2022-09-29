import { task } from "hardhat/config";
import { ethers } from "hardhat";
task("setup:alchemix_near", "A task that runs all other subtasks to set up the Alchemist Contract")
  .setAction(async (taskArgs, hre) => {
    const {run} = hre;
    await run("setup:alchemicToken_near", {});
    await run("setup:whitelist_near", {});
    await run("setup:alchemistV2_near", {});
    await run("setup:transmuterBuffer_near", {});
  });

task("setup:alchemicToken_near", "A task that sets up the alchemic token contract")
  .setAction(async (taskArgs, hre) => {
    const {run} = hre;
    console.log("\nSetting up AlchemicToken contract");
    await run("setDebtTokenWhitelist_near", {});
    console.log("  ✅ setDebtTokenWhitelist done.")
    await run("setMaxFlashloan_near", {});
    console.log("  ✅ setMaxFlashloan done.")
  });

task("setup:whitelist_near", "A task that sets up the whitelist contract")
  .setAction(async (taskArgs, hre) => {
    const {run} = hre;
    console.log("\nSetting up Whitelist contract");
    await run("whitelistCaller_near", {});
    console.log("  ✅ whitelistCaller done.")
  });

task("setup:alchemistV2_near", "A task that sets up the AlchemistV2 contract")
  .setAction(async (taskArgs, hre) => {
    const {run} = hre;
    console.log("\nSetting up AlchemistV2 contract");
    await run("setSentinel_near", {});
    console.log("  ✅ setSentinel done.")
    await run("addUnderlyingToken_near", {});
    console.log("  ✅ addUnderlyingToken done.")
    await run("addYieldToken_near", {});
    console.log("  ✅ addYieldToken done.")
    await run("setUnderlyingTokenEnabled_near", {});
    console.log("  ✅ setUnderlyingTokenEnabled done.")
    await run("setYieldTokenEnabled_near", {});
    console.log("  ✅ setYieldTokenEnabled done.")
  });

task("setup:transmuterBuffer_near", "A task that sets up the TransmuterBuffer contract")
  .setAction(async (taskArgs, hre) => {
    const {run} = hre;
    console.log("\nSetting up TransmuterBuffer contract");
    await run("setAlchemist_near", {});
    console.log("  ✅ setAlchemist done.")
    await run("registerAsset_near", {});
    console.log("  ✅ registerAsset done.")
    await run("setFlowRate_near", {});
    console.log("  ✅ setFlowRate done.")
    await run("refreshStrategies_near", {});
    console.log("  ✅ refreshStrategies done.")
    await run("setWeight_near", {});
    console.log("  ✅ setWeight done.")
    await run("setTransmuter_near", {});
    console.log("  ✅ setTransmuter done.")
  });

/**
 * Setup AlchemicToken contract (alUSD or mxUSD)
 */
task("setDebtTokenWhitelist_near", "Whitelist the AlchemistV2 contract in the debt token contract")
  .setAction(async (taskArgs, hre) => {
    const {getNamedAccounts, ethers, deployments} = hre;
    const {deployer} = await getNamedAccounts();
    const owner = await ethers.getSigner(deployer);

    const alchemistV2Config = await deployments.get('AlchemistNEARV2');
    const alchemicTokenConfig = await deployments.getOrNull('AlchemicTokenNEARV2');
    if (!alchemicTokenConfig) {
      throw 'AlchemistV2 has not been deployed';
    }

    const alchemicToken = await ethers.getContractAt('AlchemicTokenNEARV2', alchemicTokenConfig.address);
    await alchemicToken.connect(owner).setWhitelist(alchemistV2Config.address, true);
  });

task("setMaxFlashloan_near", "Whitelist the AlchemistV2 contract in the debt token contract")
  .setAction(async (taskArgs, hre) => {
    const {getNamedAccounts, ethers, deployments} = hre;
    const {deployer} = await getNamedAccounts();
    const owner = await ethers.getSigner(deployer);

    const alchemicTokenConfig = await deployments.getOrNull('AlchemicTokenNEARV2');
    if (!alchemicTokenConfig) {
      throw 'AlchemistV2 has not been deployed';
    }

    const alchemicToken = await ethers.getContractAt('AlchemicTokenNEARV2', alchemicTokenConfig.address);
    await alchemicToken.connect(owner).setMaxFlashLoan(ethers.utils.parseUnits("100000000", 24));
  });


/**
 * Setup TransmuterBuffer Contract
 */
task("setAlchemist_near", "Set the AlchemistV2 contract address in the TransmutterBuffer contract")
  .setAction(async (taskArgs, hre) => {
    const {getNamedAccounts, ethers, deployments} = hre;
    const {deployer} = await getNamedAccounts();
    const owner = await ethers.getSigner(deployer);

    const alchemistV2Config = await deployments.get('AlchemistNEARV2');
    const transmuterBufferConfig = await deployments.getOrNull('TransmuterBufferNEAR');
    if (!transmuterBufferConfig) {
      throw 'TransmuterBuffer has not been deployed';
    }

    const transmuterBuffer = await ethers.getContractAt('TransmuterBuffer', transmuterBufferConfig.address);
    await transmuterBuffer.connect(owner).setAlchemist(alchemistV2Config.address);
  });

task("registerAsset_near", "Register underlying token in TransmuterBuffer contract")
  .setAction(async (taskArgs, hre) => {
    const {getNamedAccounts, ethers, deployments} = hre;
    const {deployer} = await getNamedAccounts();
    const owner = await ethers.getSigner(deployer);

    const transmuter = await deployments.get('TransmuterV2NEAR');
    const underlyingToken = process.env.UNDERLYING_TOKEN_ADDRESS_NEAR || (await deployments.get('ERC20MockNEAR')).address;
    const transmuterBufferConfig = await deployments.getOrNull('TransmuterBufferNEAR');
    if (!transmuterBufferConfig) {
      throw 'TransmuterBuffer has not been deployed';
    }

    const transmuterBuffer = await ethers.getContractAt('TransmuterBuffer', transmuterBufferConfig.address);
    await transmuterBuffer.connect(owner).registerAsset(underlyingToken, transmuter.address);
  })

task("setFlowRate_near", "Set flow rate in TransmuterBuffer contract")
  .setAction(async (taskArgs, hre) => {
    const {getNamedAccounts, ethers, deployments} = hre;
    const {deployer} = await getNamedAccounts();
    const owner = await ethers.getSigner(deployer);

    const underlyingToken = process.env.UNDERLYING_TOKEN_ADDRESS_NEAR || (await deployments.get('ERC20MockNEAR')).address;
    const transmuterBufferConfig = await deployments.getOrNull('TransmuterBufferNEAR');
    if (!transmuterBufferConfig) {
      throw 'TransmuterBuffer has not been deployed';
    }

    const transmuterBuffer = await ethers.getContractAt('TransmuterBuffer', transmuterBufferConfig.address);
    await transmuterBuffer.connect(owner).setFlowRate(underlyingToken, ethers.utils.parseUnits("1", 24));
  })

task("refreshStrategies_near", "Refresh strategies in the TransmuterBuffer contract")
  .setAction(async (taskArgs, hre) => {
    const {getNamedAccounts, ethers, deployments} = hre;
    const {deployer} = await getNamedAccounts();
    const owner = await ethers.getSigner(deployer);

    const transmuterBufferConfig = await deployments.getOrNull('TransmuterBufferNEAR');
    if (!transmuterBufferConfig) {
      throw 'TransmuterBuffer has not been deployed';
    }

    const transmuterBuffer = await ethers.getContractAt('TransmuterBuffer', transmuterBufferConfig.address);
    await transmuterBuffer.connect(owner).refreshStrategies();
  })

task("setWeight_near", "Set weight in the TransmuterBuffer contract")
  .setAction(async (taskArgs, hre) => {
    const {getNamedAccounts, ethers, deployments} = hre;
    const {deployer} = await getNamedAccounts();
    const owner = await ethers.getSigner(deployer);

    const alchemicTokenConfig = await deployments.get('AlchemicTokenNEARV2');
    const yieldToken = process.env.CTOKEN_ADDRESS_NEAR || (await deployments.get('MockYieldTokenNEAR')).address;
    const underlyingToken = process.env.UNDERLYING_TOKEN_ADDRESS_NEAR || (await deployments.get('ERC20MockNEAR')).address;
    const alchemicToken = await ethers.getContractAt('AlchemicTokenNEARV2', alchemicTokenConfig.address);
    const transmuterBufferConfig = await deployments.getOrNull('TransmuterBufferNEAR');
    if (!transmuterBufferConfig) {
      throw 'TransmuterBuffer has not been deployed';
    }

    const transmuterBuffer = await ethers.getContractAt('TransmuterBuffer', transmuterBufferConfig.address);
    await transmuterBuffer.connect(owner).setWeights(alchemicToken.address, [underlyingToken], [1]);
    await transmuterBuffer.connect(owner).setWeights(underlyingToken, [yieldToken], [1]);
  })

task("setTransmuter_near", "Set transmuter and underlying token in TransmuterBuffer contract")
  .setAction(async (taskArgs, hre) => {
    const {getNamedAccounts, ethers, deployments} = hre;
    const {deployer} = await getNamedAccounts();
    const owner = await ethers.getSigner(deployer);

    const transmuter = await deployments.get('TransmuterV2NEAR');
    const underlyingToken = process.env.UNDERLYING_TOKEN_ADDRESS_NEAR || (await deployments.get('ERC20MockNEAR')).address;
    const transmuterBufferConfig = await deployments.getOrNull('TransmuterBufferNEAR');
    if (!transmuterBufferConfig) {
      throw 'TransmuterBuffer has not been deployed';
    }

    const transmuterBuffer = await ethers.getContractAt('TransmuterBuffer', transmuterBufferConfig.address);
    await transmuterBuffer.connect(owner).setTransmuter(underlyingToken, transmuter.address);
  })

/**
 * Setup Whitelist Contract
 */
task("whitelistCaller_near", "whitelist a caller into the AlchemistV2 contract")
  .setAction(async (taskArgs, hre) => {
    const {getNamedAccounts, ethers, deployments} = hre;
    const {deployer} = await getNamedAccounts();
    const owner = await ethers.getSigner(deployer);

    const transmuter = await deployments.get('TransmuterV2NEAR');
    const whitelistConfig = await deployments.getOrNull('WhitelistNEAR');
    if (!whitelistConfig) {
      throw 'Whitelist has not been deployed';
    }

    const whitelist = await ethers.getContractAt('Whitelist', whitelistConfig.address);
    await whitelist.connect(owner).add(transmuter.address);
  })


/**
 * Setup AlchemistV2 Contract
 */
task("setSentinel_near", "Set sentinel in the AlchemistV2 contract")
  .setAction(async (taskArgs, hre) => {
    const {getNamedAccounts, ethers, deployments} = hre;
    const {deployer} = await getNamedAccounts();
    const owner = await ethers.getSigner(deployer);

    const alchemistV2Config = await deployments.get('AlchemistNEARV2');
    if (!alchemistV2Config) {
      throw 'AlchemistV2 has not been deployed';
    }

    const alchemistV2 = await ethers.getContractAt(
      'AlchemistNEARV2',
      alchemistV2Config.address
    );
    await alchemistV2.connect(owner).setSentinel(owner.address, true);
  });

task("addUnderlyingToken_near", "Add underlying token to AlchemistV2")
  .setAction(async (taskArgs, hre) => {
      const {getNamedAccounts, ethers, deployments} = hre;
      const {deployer} = await getNamedAccounts();
      const owner = await ethers.getSigner(deployer);
      const underlyingTokenDecimal = 24;

      const underlyingTokenConfig = {
          repayLimitMinimum: ethers.utils.parseUnits("10000", underlyingTokenDecimal),
          repayLimitMaximum: ethers.utils.parseUnits("50000", underlyingTokenDecimal),
          repayLimitBlocks: 300,
        liquidationLimitMinimum: ethers.utils.parseUnits("10000", underlyingTokenDecimal),
        liquidationLimitMaximum: ethers.utils.parseUnits("50000", underlyingTokenDecimal),
          liquidationLimitBlocks: 300
      };
      const underlyingToken = process.env.UNDERLYING_TOKEN_ADDRESS_NEAR || (await deployments.get('ERC20MockNEAR')).address
      const alchemistV2Config = await deployments.getOrNull('AlchemistNEARV2');
      if (!alchemistV2Config) {
          throw 'AlchemistV2 has not been deployed';
      }

      const alchemistV2 = await ethers.getContractAt(
        'AlchemistNEARV2',
        alchemistV2Config.address
      );
      await alchemistV2.connect(owner).addUnderlyingToken(underlyingToken, underlyingTokenConfig);
  });

task("addYieldToken_near", "Add yield token to AlchemistV2")
  .setAction(async (taskArgs, hre) => {
    const {getNamedAccounts, ethers, deployments} = hre;
    const {deployer} = await getNamedAccounts();
    const owner = await ethers.getSigner(deployer);
    const underlyingTokenDecimal = 24;
    const yieldToken = process.env.CTOKEN_ADDRESS_NEAR || (await deployments.get('MockYieldTokenNEAR')).address;
    const tokenAdapter = await deployments.get("CTokenAdapterNEAR");

    const yieldTokenConfig = {
      adapter: tokenAdapter.address,
      maximumLoss: 25,
      maximumExpectedValue: ethers.utils.parseUnits("50000", underlyingTokenDecimal),
      creditUnlockBlocks: 7200
    };

    const alchemistV2Config = await deployments.getOrNull('AlchemistNEARV2');
    if (!alchemistV2Config) {
      throw 'AlchemistV2 has not been deployed';
    }

    const alchemistV2 = await ethers.getContractAt(
      'AlchemistNEARV2',
      alchemistV2Config.address
    );
    await alchemistV2.connect(owner).addYieldToken(yieldToken, yieldTokenConfig);
  });

task("setUnderlyingTokenEnabled_near", "Set underlying token to enabled in AlchemistV2")
  .setAction(async (taskArgs, hre) => {
    const {getNamedAccounts, ethers, deployments} = hre;
    const {deployer} = await getNamedAccounts();
    const owner = await ethers.getSigner(deployer);

    const underlyingToken = process.env.UNDERLYING_TOKEN_ADDRESS_NEAR || (await deployments.get('ERC20MockNEAR')).address;
    const alchemistV2Config = await deployments.getOrNull('AlchemistNEARV2');
    if (!alchemistV2Config) {
      throw 'AlchemistV2 has not been deployed';
    }

    const alchemistV2 = await ethers.getContractAt(
      'AlchemistNEARV2',
      alchemistV2Config.address
    );
    await alchemistV2.connect(owner).setUnderlyingTokenEnabled(underlyingToken, true);
  });

task("setYieldTokenEnabled_near", "Set yield token to enabled in AlchemistV2")
  .setAction(async (taskArgs, hre) => {
    const {getNamedAccounts, ethers, deployments} = hre;
    const {deployer} = await getNamedAccounts();
    const owner = await ethers.getSigner(deployer);
    const yieldToken = process.env.CTOKEN_ADDRESS_NEAR || (await deployments.get('MockYieldTokenNEAR')).address;
    const alchemistV2Config = await deployments.getOrNull('AlchemistNEARV2');
    if (!alchemistV2Config) {
      throw 'AlchemistV2 has not been deployed';
    }

    const alchemistV2 = await ethers.getContractAt(
      'AlchemistNEARV2',
      alchemistV2Config.address
    );
    await alchemistV2.connect(owner).setYieldTokenEnabled(yieldToken, true);
  });
