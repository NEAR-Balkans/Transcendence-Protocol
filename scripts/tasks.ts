import { task } from "hardhat/config";
task("transact:alchemist", "A task that runs all other subtasks to set up the Alchemist Contract")
  .setAction(async (taskArgs, hre) => {
    const {run} = hre;
    await run("depositUnderlying", {});
    await run("mint", {});
    await run("burn", {});
    await run("repay", {});
    await run("withdrawUnderlying", {});
  });

task("depositUnderlying", "Deposit underlying token into AlchemistV2")
  .setAction(async (taskArgs, hre) => {
    const {getNamedAccounts, ethers, deployments} = hre;
    const {deployer} = await getNamedAccounts();
    const owner = (await ethers.getSigners())[0];
    const yieldToken = process.env.CTOKEN_ADDRESS || (await deployments.get('MockYieldToken')).address;
    const underlyingTokenConfig = process.env.UNDERLYING_TOKEN_ADDRESS || (await deployments.get('ERC20Mock')).address;
    const alchemistV2Config = await deployments.getOrNull('AlchemistV2');
    if (!alchemistV2Config) {
      throw 'AlchemistV2 has not been deployed';
    }

    const underlyingToken = await ethers.getContractAt(
      "ERC20Mock",
      underlyingTokenConfig
    );
    const alchemistV2 = await ethers.getContractAt(
      'AlchemistV2',
      alchemistV2Config.address
    );

    const depositAmount = 1000000;
    await underlyingToken.connect(owner).mint(owner.address, depositAmount);
    await underlyingToken.connect(owner).approve(alchemistV2.address, depositAmount);
    await alchemistV2.connect(owner).depositUnderlying(
      yieldToken,
      depositAmount,
      owner.address,
      0
    );
  });

task("mint", "Borrow from AlchemistV2")
  .setAction(async (taskArgs, hre) => {
    const {getNamedAccounts, ethers, deployments} = hre;
    const {deployer} = await getNamedAccounts();
    const owner = await ethers.getSigner(deployer);
    const debtTokenConfig = await deployments.get('AlchemicTokenV2');
    const alchemistV2Config = await deployments.getOrNull('AlchemistV2');
    if (!alchemistV2Config) {
      throw 'AlchemistV2 has not been deployed';
    }
    const alchemistV2 = await ethers.getContractAt(
      'AlchemistV2',
      alchemistV2Config.address
    );

    const loanAmount = 50;//ethers.utils.parseEther("50");
    await alchemistV2.connect(owner).mint(loanAmount, owner.address);
    const debtToken = await ethers.getContractAt('AlchemicTokenV2', debtTokenConfig.address);
    console.log(owner.address, 'debt balance: ', await debtToken.balanceOf(owner.address), await debtToken.symbol());
  });

task("burn", "Repay loans in AlchemistV2 in alUSD")
  .setAction(async (taskArgs, hre) => {
    const {getNamedAccounts, ethers, deployments} = hre;
    const {deployer} = await getNamedAccounts();
    const owner = await ethers.getSigner(deployer);
    const debtTokenConfig = await deployments.get('AlchemicTokenV2');
    const alchemistV2Config = await deployments.getOrNull('AlchemistV2');
    if (!alchemistV2Config) {
      throw 'AlchemistV2 has not been deployed';
    }
    const alchemistV2 = await ethers.getContractAt(
      'AlchemistV2',
      alchemistV2Config.address
    );

    const burnAmount = 10;
    const debtToken = await ethers.getContractAt('AlchemicTokenV2', debtTokenConfig.address);
    await debtToken.approve(alchemistV2.address, burnAmount);
    console.log('Accounts before: ', await alchemistV2.accounts(owner.address));
    await alchemistV2.burn(burnAmount, owner.address);
    console.log('Accounts after: ', await alchemistV2.accounts(owner.address));
  });

task("repay", "Repay loans to AlchemistV2")
  .setAction(async (taskArgs, hre) => {
    const {getNamedAccounts, ethers, deployments} = hre;
    const {deployer} = await getNamedAccounts();
    const owner = await ethers.getSigner(deployer);

    const underlyingTokenConfig = process.env.UNDERLYING_TOKEN_ADDRESS || (await deployments.get('ERC20Mock')).address;
    const alchemistV2Config = await deployments.getOrNull('AlchemistV2');
    if (!alchemistV2Config) {
      throw 'AlchemistV2 has not been deployed';
    }
    const alchemistV2 = await ethers.getContractAt(
      'AlchemistV2',
      alchemistV2Config.address
    );

    const underlyingToken = await ethers.getContractAt(
      "ERC20Mock",
      underlyingTokenConfig
    );

    const repayAmount = ethers.utils.parseEther("10");
    await underlyingToken.connect(owner).mint(owner.address, repayAmount);
    await underlyingToken.connect(owner).approve(alchemistV2.address, repayAmount);
    await alchemistV2.connect(owner).repay(underlyingToken.address, repayAmount, owner.address);
    console.log('Accounts after: ', await alchemistV2.accounts(owner.address));
  })

task("withdrawUnderlying", "Withdraw underlying tokens from AlchemistV2")
  .setAction(async (taskArgs, hre) => {
    const {getNamedAccounts, ethers, deployments} = hre;
    const {deployer} = await getNamedAccounts();
    const owner = await ethers.getSigner(deployer);

    const yieldToken = process.env.CTOKEN_ADDRESS || (await deployments.get('MockYieldToken')).address;
    const alchemistV2Config = await deployments.getOrNull('AlchemistV2');
    if (!alchemistV2Config) {
      throw 'AlchemistV2 has not been deployed';
    }
    const alchemistV2 = await ethers.getContractAt(
      'AlchemistV2',
      alchemistV2Config.address
    );

    const pps = await alchemistV2.getUnderlyingTokensPerShare(yieldToken);
    console.log(pps)
    const withdrawAmount = ethers.BigNumber.from(10000000000);
    // @ts-ignore
    const shares = withdrawAmount.div(pps);
    await alchemistV2.connect(owner).withdrawUnderlying(yieldToken, shares, owner.address, 0);
    console.log('Accounts after: ', await alchemistV2.accounts(owner.address));
  })

task("setMaximumExpectedValue", "Set the maximum expected value for a yield token in AlchemistV2")
  .setAction(async (taskArgs, hre) => {
      const {getNamedAccounts, ethers, deployments} = hre;
      const {deployer} = await getNamedAccounts();
      const owner = await ethers.getSigner(deployer);
      const yieldToken = process.env.CTOKEN_ADDRESS || (await deployments.get('MockYieldToken')).address;
      const alchemistV2Config = await deployments.getOrNull('AlchemistV2');
      if (!alchemistV2Config) {
          throw 'AlchemistV2 has not been deployed';
      }

      const alchemistV2 = await ethers.getContractAt(
        'AlchemistV2',
        alchemistV2Config.address
      );
      const maximumExpectedValue = 50000_00000000;
      await alchemistV2.connect(owner).setMaximumExpectedValue(yieldToken, maximumExpectedValue);
  });