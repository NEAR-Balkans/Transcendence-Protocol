import { task } from "hardhat/config";
task("setup:alchemix_usdc", "A task that runs all other subtasks to set up the Alchemist Contract")
  .setAction(async (taskArgs, hre) => {
    const {run} = hre;
    await run("setup:alchemicToken_usdc", {});
    await run("setup:whitelist_usdc", {});
    await run("setup:alchemistV2_usdc", {});
    await run("setup:transmuterBuffer_usdc", {});
  });

task("setup:alchemicToken_usdc", "A task that sets up the alchemic token contract")
  .setAction(async (taskArgs, hre) => {
    const {run} = hre;
    console.log("\nSetting up AlchemicToken contract");
    await run("setDebtTokenWhiteList_usdc", {});
    console.log("  ✅ setDebtTokenWhiteList done.")
    await run("setMaxFlashloan_usdc", {});
    console.log("  ✅ setMaxFlashloan done.")
  });

task("setup:whitelist_usdc", "A task that sets up the whitelist contract")
  .setAction(async (taskArgs, hre) => {
    const {run} = hre;
    console.log("\nSetting up Whitelist contract");
    await run("whitelistCaller_usdc", {});
    console.log("  ✅ whitelistCaller done.")
  });

task("setup:alchemistV2_usdc", "A task that sets up the AchemistV2 contract")
  .setAction(async (taskArgs, hre) => {
    const {run} = hre;
    console.log("\nSetting up AchemistV2 contract");
    await run("setSentinel_usdc", {});
    console.log("  ✅ setSentinel done.")
    await run("addUnderlyingToken_usdc", {});
    console.log("  ✅ addUnderlyingToken done.")
    await run("addYieldToken_usdc", {});
    console.log("  ✅ addYieldToken done.")
    await run("setUnderlyingTokenEnabled_usdc", {});
    console.log("  ✅ setUnderlyingTokenEnabled done.")
    await run("setYieldTokenEnabled_usdc", {});
    console.log("  ✅ setYieldTokenEnabled done.")
  });

task("setup:transmuterBuffer_usdc", "A task that sets up the TransmuterBuffer contract")
  .setAction(async (taskArgs, hre) => {
    const {run} = hre;
    console.log("\nSetting up TransmuterBuffer contract");
    await run("setAlchemist_usdc", {});
    console.log("  ✅ setAlchemist done.")
    await run("registerAsset_usdc", {});
    console.log("  ✅ registerAsset done.")
    await run("setFlowRate_usdc", {});
    console.log("  ✅ setFlowRate done.")
    await run("refreshStrategies_usdc", {});
    console.log("  ✅ refreshStrategies done.")
    await run("setWeight_usdc", {});
    console.log("  ✅ setWeight done.")
    await run("setTransmuter_usdc", {});
    console.log("  ✅ setTransmuter done.")
  });


/**
 * Setup AlchemicToken contract (alUSD or mxUSD)
 */
task("setDebtTokenWhiteList_usdc", "Whitelist the AlchemistV2 contract in the debt token contract")
  .setAction(async (taskArgs, hre) => {
    const {getNamedAccounts, ethers, deployments} = hre;
    const {deployer} = await getNamedAccounts();
    const owner = await ethers.getSigner(deployer);

    const alchemistV2Config = await deployments.get('AlchemistV2');
    const alchemicTokenConfig = await deployments.getOrNull('AlchemicTokenV2');
    if (!alchemicTokenConfig) {
      throw 'AlchemistV2 has not been deployed';
    }

    const alchemicToken = await ethers.getContractAt('AlchemicTokenV2', alchemicTokenConfig.address);
    await alchemicToken.connect(owner).setWhitelist(alchemistV2Config.address, true);
  });

task("setMaxFlashloan_usdc", "Whitelist the AlchemistV2 contract in the debt token contract")
  .setAction(async (taskArgs, hre) => {
    const {getNamedAccounts, ethers, deployments} = hre;
    const {deployer} = await getNamedAccounts();
    const owner = await ethers.getSigner(deployer);

    const alchemicTokenConfig = await deployments.getOrNull('AlchemicTokenV2');
    if (!alchemicTokenConfig) {
      throw 'AlchemistV2 has not been deployed';
    }

    const alchemicToken = await ethers.getContractAt('AlchemicTokenV2', alchemicTokenConfig.address);
    await alchemicToken.connect(owner).setMaxFlashLoan(100000000000000);
  });


/**
 * Setup TransmuterBuffer Contract
 */
task("setAlchemist_usdc", "Set the AlchemistV2 contract address in the TransmutterBuffer contract")
  .setAction(async (taskArgs, hre) => {
    const {getNamedAccounts, ethers, deployments} = hre;
    const {deployer} = await getNamedAccounts();
    const owner = await ethers.getSigner(deployer);

    const alchemistV2Config = await deployments.get('AlchemistV2');
    const transmuterBufferConfig = await deployments.getOrNull('TransmuterBuffer');
    if (!transmuterBufferConfig) {
      throw 'TransmuterBuffer has not been deployed';
    }

    const transmuterBuffer = await ethers.getContractAt('TransmuterBuffer', transmuterBufferConfig.address);
    await transmuterBuffer.connect(owner).setAlchemist(alchemistV2Config.address);
  });

task("registerAsset_usdc", "Register underlying token in TransmuterBuffer contract")
  .setAction(async (taskArgs, hre) => {
    const {getNamedAccounts, ethers, deployments} = hre;
    const {deployer} = await getNamedAccounts();
    const owner = await ethers.getSigner(deployer);

    const transmuter = await deployments.get('TransmuterV2USDC');
    const underlyingToken = process.env.UNDERLYING_TOKEN_ADDRESS_USDC || (await deployments.get('ERC20MockUSDC')).address;
    const transmuterBufferConfig = await deployments.getOrNull('TransmuterBuffer');
    if (!transmuterBufferConfig) {
      throw 'TransmuterBuffer has not been deployed';
    }

    const transmuterBuffer = await ethers.getContractAt('TransmuterBuffer', transmuterBufferConfig.address);
    await transmuterBuffer.connect(owner).registerAsset(underlyingToken, transmuter.address);
  })

task("setFlowRate_usdc", "Set flow rate in TransmuterBuffer contract")
  .setAction(async (taskArgs, hre) => {
    const {getNamedAccounts, ethers, deployments} = hre;
    const {deployer} = await getNamedAccounts();
    const owner = await ethers.getSigner(deployer);

    const underlyingToken = process.env.UNDERLYING_TOKEN_ADDRESS_USDC || (await deployments.get('ERC20MockUSDC')).address;
    const transmuterBufferConfig = await deployments.getOrNull('TransmuterBuffer');
    if (!transmuterBufferConfig) {
      throw 'TransmuterBuffer has not been deployed';
    }

    const transmuterBuffer = await ethers.getContractAt('TransmuterBuffer', transmuterBufferConfig.address);
    await transmuterBuffer.connect(owner).setFlowRate(underlyingToken, 1000000);
  })

task("refreshStrategies_usdc", "Refresh strategies in the TransmuterBuffer contract")
  .setAction(async (taskArgs, hre) => {
    const {getNamedAccounts, ethers, deployments} = hre;
    const {deployer} = await getNamedAccounts();
    const owner = await ethers.getSigner(deployer);

    const transmuterBufferConfig = await deployments.getOrNull('TransmuterBuffer');
    if (!transmuterBufferConfig) {
      throw 'TransmuterBuffer has not been deployed';
    }

    const transmuterBuffer = await ethers.getContractAt('TransmuterBuffer', transmuterBufferConfig.address);
    await transmuterBuffer.connect(owner).refreshStrategies();
  })

task("setWeight_usdc", "Set weight in the TransmuterBuffer contract")
  .setAction(async (taskArgs, hre) => {
    const {getNamedAccounts, ethers, deployments} = hre;
    const {deployer} = await getNamedAccounts();
    const owner = await ethers.getSigner(deployer);

    const alchemicTokenConfig = await deployments.get('AlchemicTokenV2');
    const yieldToken = process.env.CTOKEN_ADDRESS_USDC || (await deployments.get('MockYieldTokenUSDC')).address;
    const underlyingToken = process.env.UNDERLYING_TOKEN_ADDRESS_USDC || (await deployments.get('ERC20MockUSDC')).address;
    const alchemicToken = await ethers.getContractAt('AlchemicTokenV2', alchemicTokenConfig.address);
    const transmuterBufferConfig = await deployments.getOrNull('TransmuterBuffer');
    if (!transmuterBufferConfig) {
      throw 'TransmuterBuffer has not been deployed';
    }

    const transmuterBuffer = await ethers.getContractAt('TransmuterBuffer', transmuterBufferConfig.address);
    await transmuterBuffer.connect(owner).setWeights(alchemicToken.address, [yieldToken], [1]);
    await transmuterBuffer.connect(owner).setWeights(underlyingToken, [yieldToken], [1]);
  })

task("setTransmuter_usdc", "Set transmuter and underlying token in TransmuterBuffer contract")
  .setAction(async (taskArgs, hre) => {
    const {getNamedAccounts, ethers, deployments} = hre;
    const {deployer} = await getNamedAccounts();
    const owner = await ethers.getSigner(deployer);

    const transmuter = await deployments.get('TransmuterV2USDC');
    const underlyingToken = process.env.UNDERLYING_TOKEN_ADDRESS_USDC || (await deployments.get('ERC20MockUSDC')).address;
    const transmuterBufferConfig = await deployments.getOrNull('TransmuterBuffer');
    if (!transmuterBufferConfig) {
      throw 'TransmuterBuffer has not been deployed';
    }

    const transmuterBuffer = await ethers.getContractAt('TransmuterBuffer', transmuterBufferConfig.address);
    await transmuterBuffer.connect(owner).setTransmuter(underlyingToken, transmuter.address);
  })

/**
 * Setup Whitelist Contract
 */
task("whitelistCaller_usdc", "whitelist a caller into the AlchemistV2 contract")
  .setAction(async (taskArgs, hre) => {
    const {getNamedAccounts, ethers, deployments} = hre;
    const {deployer} = await getNamedAccounts();
    const owner = await ethers.getSigner(deployer);

    const transmuter = await deployments.get('TransmuterV2USDC');
    const whitelistConfig = await deployments.getOrNull('Whitelist');
    if (!whitelistConfig) {
      throw 'Whitelist has not been deployed';
    }

    const whitelist = await ethers.getContractAt('Whitelist', whitelistConfig.address);
    await whitelist.connect(owner).add(transmuter.address);
  })


/**
 * Setup AlchemistV2 Contract
 */
task("setSentinel_usdc", "Set sentinel in the AlchemistV2 contract")
  .setAction(async (taskArgs, hre) => {
    const {getNamedAccounts, ethers, deployments} = hre;
    const {deployer} = await getNamedAccounts();
    const owner = await ethers.getSigner(deployer);

    const alchemistV2Config = await deployments.get('AlchemistV2');
    if (!alchemistV2Config) {
      throw 'AlchemistV2 has not been deployed';
    }

    const alchemistV2 = await ethers.getContractAt(
      'AlchemistV2',
      alchemistV2Config.address
    );
    await alchemistV2.connect(owner).setSentinel(owner.address, true);
  });

task("addUnderlyingToken_usdc", "Add underlying token to AlchemistV2")
  .setAction(async (taskArgs, hre) => {
      const {getNamedAccounts, ethers, deployments} = hre;
      const {deployer} = await getNamedAccounts();
      const owner = await ethers.getSigner(deployer);

      const underlyingTokenConfig = {
          repayLimitMinimum: 1000000_000000,
          repayLimitMaximum: 5000000_000000,
          repayLimitBlocks: 300,
          liquidationLimitMinimum: 1000000_000000,
          liquidationLimitMaximum: 5000000_000000,
          liquidationLimitBlocks: 300
      };
      const underlyingToken = process.env.UNDERLYING_TOKEN_ADDRESS_USDC || (await deployments.get('ERC20MockUSDC')).address
      const alchemistV2Config = await deployments.getOrNull('AlchemistV2');
      if (!alchemistV2Config) {
          throw 'AlchemistV2 has not been deployed';
      }

      const alchemistV2 = await ethers.getContractAt(
        'AlchemistV2',
        alchemistV2Config.address
      );
      await alchemistV2.connect(owner).addUnderlyingToken(underlyingToken, underlyingTokenConfig);
  });

task("addYieldToken_usdc", "Add yield token to AlchemistV2")
  .setAction(async (taskArgs, hre) => {
    const {getNamedAccounts, ethers, deployments} = hre;
    const {deployer} = await getNamedAccounts();
    const owner = await ethers.getSigner(deployer);

    const yieldToken = process.env.CTOKEN_ADDRESS_USDC || (await deployments.get('MockYieldTokenUSDC')).address;
    const tokenAdapter = await deployments.get("CTokenAdapterUSDC");

    const yieldTokenConfig = {
      adapter: tokenAdapter.address,
      maximumLoss: 25,
      maximumExpectedValue: 50000_00000000,
      creditUnlockBlocks: 7200
    };

    const alchemistV2Config = await deployments.getOrNull('AlchemistV2');
    if (!alchemistV2Config) {
      throw 'AlchemistV2 has not been deployed';
    }

    const alchemistV2 = await ethers.getContractAt(
      'AlchemistV2',
      alchemistV2Config.address
    );
    await alchemistV2.connect(owner).addYieldToken(yieldToken, yieldTokenConfig);
  });

task("setUnderlyingTokenEnabled_usdc", "Set underlying token to enabled in AlchemistV2")
  .setAction(async (taskArgs, hre) => {
    const {getNamedAccounts, ethers, deployments} = hre;
    const {deployer} = await getNamedAccounts();
    const owner = await ethers.getSigner(deployer);

    const underlyingToken = process.env.UNDERLYING_TOKEN_ADDRESS_USDC || (await deployments.get('ERC20MockUSDC')).address;
    const alchemistV2Config = await deployments.getOrNull('AlchemistV2');
    if (!alchemistV2Config) {
      throw 'AlchemistV2 has not been deployed';
    }

    const alchemistV2 = await ethers.getContractAt(
      'AlchemistV2',
      alchemistV2Config.address
    );
    await alchemistV2.connect(owner).setUnderlyingTokenEnabled(underlyingToken, true);
  });

task("setYieldTokenEnabled_usdc", "Set yield token to enabled in AlchemistV2")
  .setAction(async (taskArgs, hre) => {
    const {getNamedAccounts, ethers, deployments} = hre;
    const {deployer} = await getNamedAccounts();
    const owner = await ethers.getSigner(deployer);
    const yieldToken = process.env.CTOKEN_ADDRESS_USDC || (await deployments.get('MockYieldTokenUSDC')).address;
    const alchemistV2Config = await deployments.getOrNull('AlchemistV2');
    if (!alchemistV2Config) {
      throw 'AlchemistV2 has not been deployed';
    }

    const alchemistV2 = await ethers.getContractAt(
      'AlchemistV2',
      alchemistV2Config.address
    );
    await alchemistV2.connect(owner).setYieldTokenEnabled(yieldToken, true);
  });
