import { task } from "hardhat/config";
task("setup:alchemix_usdt", "A task that runs all other subtasks to set up the Alchemist Contract")
  .setAction(async (taskArgs, hre) => {
    const {run} = hre;
    await run("setup:alchemicToken_usdt", {});
    await run("setup:whitelist_usdt", {});
    await run("setup:alchemistV2_usdt", {});
    await run("setup:transmuterBuffer_usdt", {});
  });

task("setup:alchemicToken_usdt", "A task that sets up the alchemic token contract")
  .setAction(async (taskArgs, hre) => {
    const {run} = hre;
    console.log("\nSetting up AlchemicToken contract");
    await run("setDebtTokenWhitelist_usdt", {});
    console.log("  ✅ setDebtTokenWhitelist done.")
    await run("setMaxFlashloan_usdt", {});
    console.log("  ✅ setMaxFlashloan done.")
  });

task("setup:whitelist_usdt", "A task that sets up the whitelist contract")
  .setAction(async (taskArgs, hre) => {
    const {run} = hre;
    console.log("\nSetting up Whitelist contract");
    await run("whitelistCaller_usdt", {});
    console.log("  ✅ whitelistCaller done.")
  });

task("setup:alchemistV2_usdt", "A task that sets up the AchemistV2 contract")
  .setAction(async (taskArgs, hre) => {
    const {run} = hre;
    console.log("\nSetting up AchemistV2 contract");
    await run("setSentinel_usdt", {});
    console.log("  ✅ setSentinel done.")
    await run("addUnderlyingToken_usdt", {});
    console.log("  ✅ addUnderlyingToken done.")
    await run("addYieldToken_usdt", {});
    console.log("  ✅ addYieldToken done.")
    await run("setUnderlyingTokenEnabled_usdt", {});
    console.log("  ✅ setUnderlyingTokenEnabled done.")
    await run("setYieldTokenEnabled_usdt", {});
    console.log("  ✅ setYieldTokenEnabled done.")
  });

task("setup:transmuterBuffer_usdt", "A task that sets up the TransmuterBuffer contract")
  .setAction(async (taskArgs, hre) => {
    const {run} = hre;
    console.log("\nSetting up TransmuterBuffer contract");
    await run("setAlchemist_usdt", {});
    console.log("  ✅ setAlchemist done.")
    await run("registerAsset_usdt", {}); //todo: double-check
    console.log("  ✅ registerAsset done.")
    await run("setFlowRate_usdt", {});
    console.log("  ✅ setFlowRate done.")
    await run("refreshStrategies_usdt", {});
    console.log("  ✅ refreshStrategies done.")
    await run("setWeight_usdt", {}); //todo: double-check
    console.log("  ✅ setWeight done.")
    await run("setTransmuter_usdt", {});
    console.log("  ✅ setTransmuter done.")
  });

/**
 * Setup AlchemicToken contract (alUSD or mxUSD)
 */
task("setDebtTokenWhitelist_usdt", "Whitelist the AlchemistV2 contract in the debt token contract")
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

task("setMaxFlashloan_usdt", "Whitelist the AlchemistV2 contract in the debt token contract")
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
task("setAlchemist_usdt", "Set the AlchemistV2 contract address in the TransmutterBuffer contract")
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

task("registerAsset_usdt", "Register underlying token in TransmuterBuffer contract")
  .setAction(async (taskArgs, hre) => {
    const {getNamedAccounts, ethers, deployments} = hre;
    const {deployer} = await getNamedAccounts();
    const owner = await ethers.getSigner(deployer);

    const transmuter = await deployments.get('TransmuterV2USDT');
    const underlyingToken = process.env.UNDERLYING_TOKEN_ADDRESS_USDT || (await deployments.get('ERC20MockUSDT')).address;
    const transmuterBufferConfig = await deployments.getOrNull('TransmuterBuffer');
    if (!transmuterBufferConfig) {
      throw 'TransmuterBuffer has not been deployed';
    }

    const transmuterBuffer = await ethers.getContractAt('TransmuterBuffer', transmuterBufferConfig.address);
    await transmuterBuffer.connect(owner).registerAsset(underlyingToken, transmuter.address);
  })

task("setFlowRate_usdt", "Set flow rate in TransmuterBuffer contract")
  .setAction(async (taskArgs, hre) => {
    const {getNamedAccounts, ethers, deployments} = hre;
    const {deployer} = await getNamedAccounts();
    const owner = await ethers.getSigner(deployer);

    const underlyingToken = process.env.UNDERLYING_TOKEN_ADDRESS_USDT || (await deployments.get('ERC20MockUSDT')).address;
    const transmuterBufferConfig = await deployments.getOrNull('TransmuterBuffer');
    if (!transmuterBufferConfig) {
      throw 'TransmuterBuffer has not been deployed';
    }

    const transmuterBuffer = await ethers.getContractAt('TransmuterBuffer', transmuterBufferConfig.address);
    await transmuterBuffer.connect(owner).setFlowRate(underlyingToken, 1000000);
  })

task("refreshStrategies_usdt", "Refresh strategies in the TransmuterBuffer contract")
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

task("setWeight_usdt", "Set weight in the TransmuterBuffer contract")
  .setAction(async (taskArgs, hre) => {
    const {getNamedAccounts, ethers, deployments} = hre;
    const {deployer} = await getNamedAccounts();
    const owner = await ethers.getSigner(deployer);

    const alchemicTokenConfig = await deployments.get('AlchemicTokenV2');
    const yieldToken = process.env.CTOKEN_ADDRESS_USDT || (await deployments.get('MockYieldTokenUSDT')).address;
    const underlyingToken = process.env.UNDERLYING_TOKEN_ADDRESS_USDT || (await deployments.get('ERC20MockUSDT')).address;
    const alchemicToken = await ethers.getContractAt('AlchemicTokenV2', alchemicTokenConfig.address);
    const transmuterBufferConfig = await deployments.getOrNull('TransmuterBuffer');
    if (!transmuterBufferConfig) {
      throw 'TransmuterBuffer has not been deployed';
    }

    const transmuterBuffer = await ethers.getContractAt('TransmuterBuffer', transmuterBufferConfig.address);
    await transmuterBuffer.connect(owner).setWeights(alchemicToken.address, [yieldToken], [1]);
    await transmuterBuffer.connect(owner).setWeights(underlyingToken, [yieldToken], [1]);
  })

task("setTransmuter_usdt", "Set transmuter and underlying token in TransmuterBuffer contract")
  .setAction(async (taskArgs, hre) => {
    const {getNamedAccounts, ethers, deployments} = hre;
    const {deployer} = await getNamedAccounts();
    const owner = await ethers.getSigner(deployer);

    const transmuter = await deployments.get('TransmuterV2USDT');
    const underlyingToken = process.env.UNDERLYING_TOKEN_ADDRESS_USDT || (await deployments.get('ERC20MockUSDT')).address;
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
task("whitelistCaller_usdt", "whitelist a caller into the AlchemistV2 contract")
  .setAction(async (taskArgs, hre) => {
    const {getNamedAccounts, ethers, deployments} = hre;
    const {deployer} = await getNamedAccounts();
    const owner = await ethers.getSigner(deployer);

    const transmuter = await deployments.get('TransmuterV2USDT');
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
task("setSentinel_usdt", "Set sentinel in the AlchemistV2 contract")
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

task("addUnderlyingToken_usdt", "Add underlying token to AlchemistV2")
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
      const underlyingToken = process.env.UNDERLYING_TOKEN_ADDRESS_USDT || (await deployments.get('ERC20MockUSDT')).address
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

task("addYieldToken_usdt", "Add yield token to AlchemistV2")
  .setAction(async (taskArgs, hre) => {
    const {getNamedAccounts, ethers, deployments} = hre;
    const {deployer} = await getNamedAccounts();
    const owner = await ethers.getSigner(deployer);

    const yieldToken = process.env.CTOKEN_ADDRESS_USDT || (await deployments.get('MockYieldTokenUSDT')).address;
    const tokenAdapter = await deployments.get("CTokenAdapterUSDT");

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

task("setUnderlyingTokenEnabled_usdt", "Set underlying token to enabled in AlchemistV2")
  .setAction(async (taskArgs, hre) => {
    const {getNamedAccounts, ethers, deployments} = hre;
    const {deployer} = await getNamedAccounts();
    const owner = await ethers.getSigner(deployer);

    const underlyingToken = process.env.UNDERLYING_TOKEN_ADDRESS_USDT || (await deployments.get('ERC20MockUSDT')).address;
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

task("setYieldTokenEnabled_usdt", "Set yield token to enabled in AlchemistV2")
  .setAction(async (taskArgs, hre) => {
    const {getNamedAccounts, ethers, deployments} = hre;
    const {deployer} = await getNamedAccounts();
    const owner = await ethers.getSigner(deployer);
    const yieldToken = process.env.CTOKEN_ADDRESS_USDT || (await deployments.get('MockYieldTokenUSDT')).address;
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
