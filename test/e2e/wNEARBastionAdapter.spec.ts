import hre, { ethers } from "hardhat";
import {
  ERC20Mock,
  Whitelist,
  TransmuterV2,
  CTokenAdapter,
  AlchemistNEARV2,
  TransmuterBuffer,
  AlchemicTokenNEARV2,
} from "../../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ONE, parseAlUSD, parseCToken, parseUsdc } from "../../utils/helpers";
import { EthereumProvider } from "hardhat/types";
import { BigNumber, BigNumberish } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";

describe("Bastion Adapter Integration Test", function () {
  let hreProvider: EthereumProvider;
  let otherSigner: SignerWithAddress;
  let impersonatedSigner: SignerWithAddress;

  let accounts;
  let NEAR: ERC20Mock;
  let cNEAR: ERC20Mock;
  let Whitelist: Whitelist;
  let AlchemistV2: AlchemistNEARV2;
  let TransmuterV2: TransmuterV2;
  let CTokenAdapter: CTokenAdapter;
  let AlchemicTokenV2: AlchemicTokenNEARV2;
  let TransmuterBuffer: TransmuterBuffer;

  const debtTokenDecimal = 24;
  const underlyingTokenDecimal = 24;
  const yieldToken = "0x8C14ea853321028a7bb5E4FB0d0147F183d3B677";
  const underlyingToken = "0xC42C30aC6Cc15faC9bD938618BcaA1a1FaE8501d";
  const impersonatedAccount = "0x20f8aefb5697b77e0bb835a8518be70775cda1b0";

  before(async function () {
    accounts = await ethers.getSigners();
    hreProvider = await hre.network.provider;
    await hreProvider.request({
      method: "hardhat_impersonateAccount",
      params: [impersonatedAccount],
    });
    otherSigner = await accounts[0];
    impersonatedSigner = await ethers.getSigner(impersonatedAccount);
    await hreProvider.send("hardhat_setBalance", [
      impersonatedSigner.address,
      "0x1000D3C21BCECCEDA1000000",
    ]);

    cNEAR = await ethers.getContractAt("ERC20Mock", yieldToken);
    NEAR = await ethers.getContractAt("ERC20Mock", underlyingToken);

    const WhitelistFactory = await ethers.getContractFactory("Whitelist");
    Whitelist = await (
      await WhitelistFactory.connect(impersonatedSigner).deploy()
    ).deployed();

    const AlchemicTokenV2Factory = await ethers.getContractFactory(
      "AlchemicTokenNEARV2"
    );
    AlchemicTokenV2 = await (
      await AlchemicTokenV2Factory.connect(impersonatedSigner).deploy(
        "Mixture USD",
        "mxUSD",
        100
      )
    ).deployed();

    const CTokenAdapterFactory = await ethers.getContractFactory(
      "CTokenAdapter"
    );
    CTokenAdapter = await (
      await CTokenAdapterFactory.connect(impersonatedSigner).deploy(
        yieldToken,
        underlyingToken
      )
    ).deployed();

    const TransmuterBufferFactory = await ethers.getContractFactory(
      "TransmuterBuffer"
    );
    TransmuterBuffer = await (
      await TransmuterBufferFactory.connect(impersonatedSigner).deploy()
    ).deployed();
    await TransmuterBuffer.initialize(
      impersonatedSigner.address,
      AlchemicTokenV2.address
    );

    const TransmuterV2Factory = await ethers.getContractFactory("TransmuterV2");
    TransmuterV2 = await (
      await TransmuterV2Factory.connect(impersonatedSigner).deploy()
    ).deployed();
    await TransmuterV2.initialize(
      AlchemicTokenV2.address,
      underlyingToken,
      TransmuterBuffer.address,
      Whitelist.address
    );

    const AlchemistV2Factory = await ethers.getContractFactory(
      "AlchemistNEARV2"
    );
    AlchemistV2 = await (
      await AlchemistV2Factory.connect(impersonatedSigner).deploy()
    ).deployed();
    await AlchemistV2.initialize({
      admin: impersonatedSigner.address,
      debtToken: AlchemicTokenV2.address,
      transmuter: TransmuterBuffer.address,
      minimumCollateralization: ethers.utils.parseUnits("2", debtTokenDecimal),
      protocolFee: 1000,
      protocolFeeReceiver: impersonatedSigner.address,
      mintingLimitMinimum: ethers.utils.parseUnits("1000000", debtTokenDecimal),
      mintingLimitMaximum: ethers.utils.parseUnits("5000000", debtTokenDecimal),
      mintingLimitBlocks: 300,
      whitelist: Whitelist.address,
    });

    await AlchemicTokenV2.connect(impersonatedSigner).setWhitelist(
      AlchemistV2.address,
      true
    );
    await TransmuterBuffer.connect(impersonatedSigner).setSource(
      AlchemistV2.address,
      true
    );
    await TransmuterBuffer.connect(impersonatedSigner).setTransmuter(
      underlyingToken,
      TransmuterV2.address
    );
    await TransmuterBuffer.connect(impersonatedSigner).setFlowRate(
      underlyingToken,
      ethers.utils.parseUnits("1", underlyingTokenDecimal)
    );
    await Whitelist.connect(impersonatedSigner).add(TransmuterV2.address);
    const underlyingTokenConfig = {
      repayLimitMinimum: ethers.utils.parseUnits(
        "10000",
        underlyingTokenDecimal
      ),
      repayLimitMaximum: ethers.utils.parseUnits(
        "50000",
        underlyingTokenDecimal
      ),
      repayLimitBlocks: 300,
      liquidationLimitMinimum: ethers.utils.parseUnits(
        "10000",
        underlyingTokenDecimal
      ),
      liquidationLimitMaximum: ethers.utils.parseUnits(
        "50000",
        underlyingTokenDecimal
      ),
      liquidationLimitBlocks: 300,
    };
    await AlchemistV2.connect(impersonatedSigner).addUnderlyingToken(
      underlyingToken,
      underlyingTokenConfig
    );

    const yieldTokenConfig = {
      adapter: CTokenAdapter.address,
      maximumLoss: 25,
      maximumExpectedValue: ethers.utils.parseUnits(
        "50000",
        underlyingTokenDecimal
      ),
      creditUnlockBlocks: 7200,
    };
    await AlchemistV2.connect(impersonatedSigner).addYieldToken(
      yieldToken,
      yieldTokenConfig
    );
    await AlchemistV2.connect(impersonatedSigner).setUnderlyingTokenEnabled(
      underlyingToken,
      true
    );
    await AlchemistV2.connect(impersonatedSigner).setYieldTokenEnabled(
      yieldToken,
      true
    );
    await AlchemistV2.connect(impersonatedSigner).setKeeper(
      impersonatedSigner.address,
      true
    );
    const keeper = await TransmuterBuffer.KEEPER();
    await TransmuterBuffer.grantRole(keeper, impersonatedSigner.address);
    await NEAR.connect(impersonatedSigner).transfer(
      otherSigner.address,
      ethers.utils.parseUnits("100", underlyingTokenDecimal)
    );
  });

  async function depositYieldToken(amount: BigNumberish) {
    const yieldTokenBalanceBefore = await cNEAR.balanceOf(AlchemistV2.address);
    await cNEAR
      .connect(impersonatedSigner)
      .approve(AlchemistV2.address, amount);
    await AlchemistV2.connect(impersonatedSigner).deposit(
      yieldToken,
      amount,
      impersonatedSigner.address
    );
    const yieldTokenBalanceAfter = await cNEAR.balanceOf(AlchemistV2.address);
    const difference = yieldTokenBalanceAfter.sub(yieldTokenBalanceBefore);
    console.log(
      "\tDeposited Yield Token in AlchemistV2: ",
      parseCToken(difference).toNumber(),
      await cNEAR.symbol()
    );
  }

  async function depositUnderlying(
    amount: BigNumberish,
    signer: SignerWithAddress
  ) {
    await NEAR.connect(signer).approve(AlchemistV2.address, amount);
    await AlchemistV2.connect(signer).depositUnderlying(
      yieldToken,
      amount,
      signer.address,
      0
    );
    const yieldTokenBalance = parseCToken(
      await cNEAR.balanceOf(AlchemistV2.address)
    );
    console.log(
      "\tMinted Yield Token in AlchemistV2: ",
      yieldTokenBalance.toNumber(),
      await cNEAR.symbol()
    );
  }

  async function takeLoan(amount: BigNumberish) {
    await AlchemistV2.connect(impersonatedSigner).mint(
      amount,
      impersonatedSigner.address
    );
    const loanAmount = await AlchemicTokenV2.balanceOf(
      impersonatedSigner.address
    );
    console.log(
      "\tDebt balance: ",
      parseAlUSD(loanAmount.toString(), 24),
      await AlchemicTokenV2.symbol()
    );
  }

  async function takeLoanFrom(amount: BigNumberish) {
    await AlchemistV2.connect(impersonatedSigner).approveMint(
      otherSigner.address,
      amount
    );
    await AlchemistV2.connect(otherSigner).mintFrom(
      impersonatedSigner.address,
      amount,
      impersonatedSigner.address
    );
    const loanAmount = await AlchemicTokenV2.balanceOf(otherSigner.address);
    console.log(
      "\tDebt balance: ",
      parseAlUSD(loanAmount.toString(), 24),
      await AlchemicTokenV2.symbol()
    );
  }

  async function repayLoanInAlUsd(amount: BigNumberish) {
    await AlchemicTokenV2.connect(impersonatedSigner).approve(
      AlchemistV2.address,
      amount
    );
    await AlchemistV2.burn(amount, impersonatedSigner.address);
    const account = await AlchemistV2.accounts(impersonatedSigner.address);
    console.log(
      "\tDebt balance: ",
      parseAlUSD(account.debt.toString(), 24),
      await AlchemicTokenV2.symbol()
    );
  }

  async function repayLoanInUSDC(amount: BigNumberish) {
    await NEAR.connect(impersonatedSigner).approve(AlchemistV2.address, amount);
    await AlchemistV2.connect(impersonatedSigner).repay(
      NEAR.address,
      amount,
      impersonatedSigner.address
    );
    const account = await AlchemistV2.accounts(impersonatedSigner.address);
    console.log(
      "\tDebt balance: ",
      parseAlUSD(account.debt.toString(), 24),
      await AlchemicTokenV2.symbol()
    );
  }

  async function liquidateLoan(amount: BigNumberish) {
    const pps = await AlchemistV2.getUnderlyingTokensPerShare(yieldToken);
    const position = await AlchemistV2.positions(
      impersonatedSigner.address,
      yieldToken
    );
    const divisor = ONE.mul(10).pow(24);
    const shares = position.shares.mul(pps).div(divisor); // ONE.mul(amount).div(pps).mul(10**8).add(10**8);

    // todo: this calculation is still inaccurate

    await AlchemistV2.connect(impersonatedSigner).liquidate(
      yieldToken,
      shares,
      0
    );
    const account = await AlchemistV2.accounts(impersonatedSigner.address);
    console.log(
      "\tDebt balance: ",
      parseAlUSD(account.debt.toString(), 24),
      await AlchemicTokenV2.symbol()
    );
  }

  async function withdraw(amount: BigNumberish) {
    const balanceBefore = await cNEAR
      .connect(impersonatedSigner)
      .balanceOf(impersonatedSigner.address);
    await AlchemistV2.connect(impersonatedSigner).withdraw(
      yieldToken,
      amount,
      impersonatedSigner.address
    );
    const balanceAfter = await cNEAR
      .connect(impersonatedSigner)
      .balanceOf(impersonatedSigner.address);
    const difference = balanceAfter.sub(balanceBefore);
    console.log(
      "\tcUSDC amount withdrawn: ",
      parseCToken(difference).toString(),
      await cNEAR.symbol()
    );
  }

  async function withdrawFrom(amount: BigNumberish) {
    const balanceBefore = await cNEAR
      .connect(otherSigner)
      .balanceOf(otherSigner.address);
    await AlchemistV2.connect(impersonatedSigner).approveWithdraw(
      otherSigner.address,
      yieldToken,
      amount
    );
    await AlchemistV2.connect(otherSigner).withdrawFrom(
      impersonatedSigner.address,
      yieldToken,
      amount,
      otherSigner.address
    );
    const balanceAfter = await cNEAR
      .connect(otherSigner)
      .balanceOf(otherSigner.address);
    const difference = balanceAfter.sub(balanceBefore);
    console.log(
      "\tcUSDC amount withdrawn: ",
      parseCToken(difference).toString(),
      await cNEAR.symbol()
    );
  }

  async function withdrawUSDC(amount: BigNumberish) {
    const pps = await AlchemistV2.getUnderlyingTokensPerShare(yieldToken);
    const account = await AlchemistV2.accounts(impersonatedSigner.address);
    const position = await AlchemistV2.positions(
      impersonatedSigner.address,
      yieldToken
    );
    const balanceBefore = await NEAR.connect(impersonatedSigner).balanceOf(
      impersonatedSigner.address
    );

    /**
     * How to calculate withdrawable amount in USDC:
     * amountWithdrawable = (cUSDC-shares * PricePerShare) / 10^8 - (debtInUSDC * 10^6)
     * NOTE: this calculation is scaled to the decimals for USDC
     */
    const debtInNEAR = account.debt.mul(2).div(10 ** 12);
    const amountWithdrawableInNEAR = position.shares
      .mul(pps)
      .div(10 ** 8)
      .sub(debtInNEAR);
    console.log(
      "\tWithdrawable amount: ",
      formatUnits(amountWithdrawableInNEAR.toString(), 24).toString(),
      "NEAR"
    );

    /**
     * How to convert USDC withdraw amount to cUSDC shares
     * cUSDC-shares = (usdcAmount * 10^6 / PricePerShare) * 10^8 + (1 * 10**8);
     * NOTE: the cUSDC-shares must be less than the positional shares of the user
     *       (1 * 10**8) was added because the USDC result is always less by -1.
     */
    const cUSDCShares = ONE.mul(amount)
      .div(pps)
      .mul(10 ** 8)
      .add(10 ** 8);

    await AlchemistV2.connect(impersonatedSigner).withdrawUnderlying(
      yieldToken,
      cUSDCShares,
      impersonatedSigner.address,
      0
    );
    const balanceAfter = await NEAR.connect(impersonatedSigner).balanceOf(
      impersonatedSigner.address
    );
    const difference = balanceAfter.sub(balanceBefore);
    console.log(
      "\tNEAR amount withdrawn: ",
      formatUnits(difference.toString(), 24).toString(),
      "NEAR"
    );
  }

  async function withdrawUSDCFrom(amount: BigNumberish) {
    const pps = await AlchemistV2.getUnderlyingTokensPerShare(yieldToken);
    const balanceBefore = await NEAR.connect(otherSigner).balanceOf(
      otherSigner.address
    );
    const cUSDCShares = ONE.mul(amount)
      .div(pps)
      .mul(10 ** 8)
      .add(10 ** 8);

    await AlchemistV2.connect(impersonatedSigner).approveWithdraw(
      otherSigner.address,
      yieldToken,
      cUSDCShares
    );
    await AlchemistV2.connect(otherSigner).withdrawUnderlyingFrom(
      impersonatedSigner.address,
      yieldToken,
      cUSDCShares,
      otherSigner.address,
      0
    );
    const balanceAfter = await NEAR.connect(otherSigner).balanceOf(
      otherSigner.address
    );
    const difference = balanceAfter.sub(balanceBefore);
    console.log(
      "\tNEAR amount withdrawn: ",
      formatUnits(difference.toString(), 24).toString(),
      "NEAR"
    );
  }

  async function donate(amount: BigNumberish) {
    await AlchemicTokenV2.connect(impersonatedSigner).approve(
      AlchemistV2.address,
      amount
    );
    await AlchemistV2.connect(impersonatedSigner).donate(yieldToken, amount);
    const account = await AlchemistV2.accounts(impersonatedSigner.address);
    console.log(
      "\tDebt balance: ",
      parseAlUSD(account.debt.toString()),
      await AlchemicTokenV2.symbol()
    );
  }

  async function harvest() {
    const balanceBefore = await NEAR.connect(impersonatedSigner).balanceOf(
      impersonatedSigner.address
    );
    // NOTE: Advancing the blocks allows the protocol to generate some rewards that can be distributed
    await hreProvider.send("hardhat_mine", ["0x2710"]);
    await AlchemistV2.connect(impersonatedSigner).harvest(yieldToken, 0);
    const balanceAfter = await NEAR.connect(impersonatedSigner).balanceOf(
      impersonatedSigner.address
    );
    const difference = balanceAfter.sub(balanceBefore);
    console.log(
      "\tNEAR amount withdrawn: ",
      formatUnits(difference.toString(), 24).toString(),
      "NEAR"
    );
  }

  it("should deposit underlying tokens into AlchemistV2", async function () {
    let failed = false;
    const amount = ethers.utils.parseUnits("50", underlyingTokenDecimal);
    do {
      try {
        await depositUnderlying(amount, impersonatedSigner);
        await depositUnderlying(amount, otherSigner);
        failed = false;
      } catch (e) {
        failed = true;
      }
    } while (failed);
  }).timeout(150000);

  it("should take a loan in alUSD from the AlchemistV2", async function () {
    const amount = ethers.utils.parseUnits("20", debtTokenDecimal);
    const loanAmount = ONE.mul(amount.toString());
    await takeLoan(loanAmount);
  });

  it("should take a loan in alUSD from another account in the AlchemistV2", async function () {
    const amount = ethers.utils.parseUnits("4", debtTokenDecimal);
    const loanAmount = ONE.mul(amount.toString());
    await takeLoanFrom(loanAmount);
  });

  it("should repay loans in alUSD to the AlchemistV2 contract", async function () {
    const amount = ethers.utils.parseUnits("14", debtTokenDecimal);
    const repayAmount = ONE.mul(amount.toString());
    await repayLoanInAlUsd(repayAmount);
  });

  it("should repay loans in USDC to the AlchemistV2 contract", async function () {
    const amount = ethers.utils.parseUnits("5", underlyingTokenDecimal);
    const repayAmount = ONE.mul(amount.toString());
    await repayLoanInUSDC(repayAmount);
  });

  it("should liquidate loans in the AlchemistV2 contract", async function () {
    const amount = 1_000000;
    const liquidationAmount = ONE.mul(amount);
    await liquidateLoan(liquidationAmount);
  });

  it("should withdraw available USDC in user account in AlchemistV2 contract", async function () {
    const amount = ethers.utils.parseUnits("4", underlyingTokenDecimal);

    const withdrawAmount = ONE.mul(amount);
    await withdrawUSDC(withdrawAmount);
  });

  it("should withdraw available USDC from another user account in AlchemistV2 contract into recipient address", async function () {
    const amount = ethers.utils.parseUnits("4", underlyingTokenDecimal);
    const withdrawAmount = ONE.mul(amount);
    await withdrawUSDCFrom(withdrawAmount);
  });

  it("should donate debt tokens to the AlchemistV2 contract", async function () {
    const amount = ethers.utils.parseUnits("1", underlyingTokenDecimal);
    const donateAmount = ONE.mul(amount.toString());
    await donate(donateAmount);
  });

  it("should withdraw yield tokens from the AlchemistV2 contract to the recipient", async function () {
    const amount = 15_00000000;
    const withdrawAmount = ONE.mul(amount);
    await withdraw(withdrawAmount);
  });

  it("should withdraw yield tokens from another account in the AlchemistV2 contract to the recipient", async function () {
    const amount = 12_00000000;
    const withdrawAmount = ONE.mul(amount);
    await withdrawFrom(withdrawAmount);
  });

  it("should deposit", async function () {
    const yieldTokenBalanceBefore = await cNEAR.balanceOf(
      impersonatedSigner.address
    );
    const amount = yieldTokenBalanceBefore.toString();
    const depositAmount = ONE.mul(amount.toString());
    await depositYieldToken(depositAmount);
  });

  it("should harvest and distribute outstanding yield", async function () {
    const balanceBefore = await NEAR.connect(impersonatedSigner).balanceOf(
      impersonatedSigner.address
    );
    // NOTE: Advancing the blocks allows the protocol to generate some rewards that can be distributed
    await hreProvider.send("hardhat_mine", ["0x2710"]);
    await AlchemistV2.connect(impersonatedSigner).snap(yieldToken);
    await AlchemistV2.connect(impersonatedSigner).harvest(yieldToken, 0);
    const balanceAfter = await NEAR.connect(impersonatedSigner).balanceOf(
      impersonatedSigner.address
    );
    const difference = balanceAfter.sub(balanceBefore);
    console.log(
      "\tNEAR amount withdrawn: ",
      formatUnits(difference.toString(), 24).toString(),
      "NEAR"
    );
  }).timeout(150000);

  it("should deposit some debt tokens into the TransmuterV2 contract", async function () {
    const amount = 1_000000000000000000;
    const depositAmount = ONE.mul(amount.toString());
    await AlchemicTokenV2.connect(impersonatedSigner).approve(
      TransmuterV2.address,
      depositAmount
    );
    await TransmuterV2.connect(impersonatedSigner).deposit(
      depositAmount,
      impersonatedSigner.address
    );
    const balance = await AlchemicTokenV2.balanceOf(TransmuterV2.address);
    console.log(
      "\tDebt balance: ",
      parseAlUSD(balance),
      await AlchemicTokenV2.symbol()
    );
  });

  it("should claim underlying balance from TransmuterV2 contract", async function () {
    await TransmuterBuffer.connect(impersonatedSigner).exchange(
      underlyingToken
    );
    const balance = await TransmuterV2.getClaimableBalance(
      impersonatedSigner.address
    );
    await TransmuterV2.connect(impersonatedSigner).claim(
      balance,
      impersonatedSigner.address
    );
  });
});
