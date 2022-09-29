import hre, { ethers } from "hardhat";
import {
  IERC20,
  Whitelist,
  AlchemistV2,
  TransmuterV2,
  CTokenAdapter,
  AlchemicTokenV2,
  TransmuterBuffer,
} from "../../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ONE, parseAlUSD, parseCToken, parseUsdc } from "../../utils/helpers";
import { EthereumProvider } from "hardhat/types";
import { BigNumber, BigNumberish } from "ethers";

describe("Bastion Adapter Integration Test", function () {
  let hreProvider: EthereumProvider;
  let otherSigner: SignerWithAddress;
  let impersonatedSigner: SignerWithAddress;

  let accounts;
  let USDT: IERC20;
  let cUSDT: IERC20;
  let Whitelist: Whitelist;
  let AlchemistV2: AlchemistV2;
  let TransmuterV2: TransmuterV2;
  let CTokenAdapter: CTokenAdapter;
  let AlchemicTokenV2: AlchemicTokenV2;
  let TransmuterBuffer: TransmuterBuffer;

  const yieldToken = "0x845E15A441CFC1871B7AC610b0E922019BaD9826";
  const underlyingToken = "0x4988a896b1227218e4A686fdE5EabdcAbd91571f";
  const impersonatedAccount = "0x2fe064b6c7d274082aa5d2624709bc9ae7d16c77";

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

    cUSDT = await ethers.getContractAt("IERC20", yieldToken);
    USDT = await ethers.getContractAt("IERC20", underlyingToken);

    const WhitelistFactory = await ethers.getContractFactory("Whitelist");
    Whitelist = await (
      await WhitelistFactory.connect(impersonatedSigner).deploy()
    ).deployed();

    const AlchemicTokenV2Factory = await ethers.getContractFactory(
      "AlchemicTokenV2"
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

    const AlchemistV2Factory = await ethers.getContractFactory("AlchemistV2");
    AlchemistV2 = await (
      await AlchemistV2Factory.connect(impersonatedSigner).deploy()
    ).deployed();
    await AlchemistV2.initialize({
      admin: impersonatedSigner.address,
      debtToken: AlchemicTokenV2.address,
      transmuter: TransmuterBuffer.address,
      minimumCollateralization: ethers.utils.parseEther("2"),
      protocolFee: 1000,
      protocolFeeReceiver: impersonatedSigner.address,
      mintingLimitMinimum: ethers.utils.parseEther("1000000"),
      mintingLimitMaximum: ethers.utils.parseEther("5000000"),
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
      1000000
    );
    await Whitelist.connect(impersonatedSigner).add(TransmuterV2.address);
    const underlyingTokenConfig = {
      repayLimitMinimum: 1000000000000,
      repayLimitMaximum: 5000000000000,
      repayLimitBlocks: 300,
      liquidationLimitMinimum: 1000000000000,
      liquidationLimitMaximum: 5000000000000,
      liquidationLimitBlocks: 300,
    };
    await AlchemistV2.connect(impersonatedSigner).addUnderlyingToken(
      underlyingToken,
      underlyingTokenConfig
    );

    const yieldTokenConfig = {
      adapter: CTokenAdapter.address,
      maximumLoss: 25,
      maximumExpectedValue: 500000000000000,
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

    await USDT.connect(impersonatedSigner).transfer(
      otherSigner.address,
      100_000000
    );
  });

  async function depositYieldToken(amount: BigNumberish) {
    const yieldTokenBalanceBefore = await cUSDT.balanceOf(AlchemistV2.address);
    await cUSDT
      .connect(impersonatedSigner)
      .approve(AlchemistV2.address, amount);
    await AlchemistV2.connect(impersonatedSigner).deposit(
      yieldToken,
      amount,
      impersonatedSigner.address
    );
    const yieldTokenBalanceAfter = await cUSDT.balanceOf(AlchemistV2.address);
    const difference = yieldTokenBalanceAfter.sub(yieldTokenBalanceBefore);
    console.log(
      "\tDeposited Yield Token in AlchemistV2: ",
      parseCToken(difference).toNumber(),
      "cUSD"
    );
  }

  async function depositUnderlying(
    amount: BigNumberish,
    signer: SignerWithAddress
  ) {
    await USDT.connect(signer).approve(AlchemistV2.address, amount);
    await AlchemistV2.connect(signer).depositUnderlying(
      yieldToken,
      amount,
      signer.address,
      0
    );
    const yieldTokenBalance = parseCToken(
      await cUSDT.balanceOf(AlchemistV2.address)
    );
    console.log(
      "\tMinted Yield Token in AlchemistV2: ",
      yieldTokenBalance.toNumber(),
      "cUSD"
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
      parseAlUSD(loanAmount.toString()),
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
      parseAlUSD(loanAmount.toString()),
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
      parseAlUSD(account.debt.toString()),
      await AlchemicTokenV2.symbol()
    );
  }

  async function repayLoanInUSDC(amount: BigNumberish) {
    await USDT.connect(impersonatedSigner).approve(AlchemistV2.address, amount);
    await AlchemistV2.connect(impersonatedSigner).repay(
      USDT.address,
      amount,
      impersonatedSigner.address
    );
    const account = await AlchemistV2.accounts(impersonatedSigner.address);
    console.log(
      "\tDebt balance: ",
      parseAlUSD(account.debt.toString()),
      await AlchemicTokenV2.symbol()
    );
  }

  async function liquidateLoan(amount: BigNumberish) {
    const pps = await AlchemistV2.getUnderlyingTokensPerShare(yieldToken);
    const position = await AlchemistV2.positions(
      impersonatedSigner.address,
      yieldToken
    );
    const shares = position.shares.mul(pps).div(10 ** 8); // ONE.mul(amount).div(pps).mul(10**8).add(10**8);
    // todo: this calculation is still inaccurate

    await AlchemistV2.connect(impersonatedSigner).liquidate(
      yieldToken,
      shares,
      0
    );
    const account = await AlchemistV2.accounts(impersonatedSigner.address);
    console.log(
      "\tDebt balance: ",
      parseAlUSD(account.debt.toString()),
      await AlchemicTokenV2.symbol()
    );
  }

  async function withdraw(amount: BigNumberish) {
    const balanceBefore = await cUSDT
      .connect(impersonatedSigner)
      .balanceOf(impersonatedSigner.address);
    await AlchemistV2.connect(impersonatedSigner).withdraw(
      yieldToken,
      amount,
      impersonatedSigner.address
    );
    const balanceAfter = await cUSDT
      .connect(impersonatedSigner)
      .balanceOf(impersonatedSigner.address);
    const difference = balanceAfter.sub(balanceBefore);
    console.log(
      "\tcUSDC amount withdrawn: ",
      parseCToken(difference).toString(),
      "cUSDC"
    );
  }

  async function withdrawFrom(amount: BigNumberish) {
    const balanceBefore = await cUSDT
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
    const balanceAfter = await cUSDT
      .connect(otherSigner)
      .balanceOf(otherSigner.address);
    const difference = balanceAfter.sub(balanceBefore);
    console.log(
      "\tcUSDC amount withdrawn: ",
      parseCToken(difference).toString(),
      "cUSDC"
    );
  }

  async function withdrawUSDC(amount: BigNumberish) {
    const pps = await AlchemistV2.getUnderlyingTokensPerShare(yieldToken);
    const account = await AlchemistV2.accounts(impersonatedSigner.address);
    const position = await AlchemistV2.positions(
      impersonatedSigner.address,
      yieldToken
    );
    const balanceBefore = await USDT.connect(impersonatedSigner).balanceOf(
      impersonatedSigner.address
    );

    /**
     * How to calculate withdrawable amount in USDC:
     * amountWithdrawable = (cUSDC-shares * PricePerShare) / 10^8 - (debtInUSDC * 10^6)
     * NOTE: this calculation is scaled to the decimals for USDC
     */
    const debtInUSDC = account.debt.mul(2).div(10 ** 12);
    const amountWithdrawableInUSDC = position.shares
      .mul(pps)
      .div(10 ** 8)
      .sub(debtInUSDC);
    console.log(
      "\tWithdrawable amount: ",
      parseUsdc(amountWithdrawableInUSDC.toString()).toNumber(),
      "USDC"
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
    const balanceAfter = await USDT.connect(impersonatedSigner).balanceOf(
      impersonatedSigner.address
    );
    const difference = balanceAfter.sub(balanceBefore);
    console.log(
      "\tUSDC amount withdrawn: ",
      parseUsdc(difference.toString()).toString(),
      "USDC"
    );
  }

  async function withdrawUSDCFrom(amount: BigNumberish) {
    const pps = await AlchemistV2.getUnderlyingTokensPerShare(yieldToken);
    const balanceBefore = await USDT.connect(otherSigner).balanceOf(
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
    const balanceAfter = await USDT.connect(otherSigner).balanceOf(
      otherSigner.address
    );
    const difference = balanceAfter.sub(balanceBefore);
    console.log(
      "\tUSDC amount withdrawn: ",
      parseUsdc(difference.toString()).toString(),
      "USDC"
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
    const balanceBefore = await USDT.connect(impersonatedSigner).balanceOf(
      impersonatedSigner.address
    );
    // NOTE: Advancing the blocks allows the protocol to generate some rewards that can be distributed
    await hreProvider.send("hardhat_mine", ["0x2710"]);
    await AlchemistV2.connect(impersonatedSigner).harvest(yieldToken, 0);
    const balanceAfter = await USDT.connect(impersonatedSigner).balanceOf(
      impersonatedSigner.address
    );
    const difference = balanceAfter.sub(balanceBefore);
    console.log(
      "\tUSDC amount withdrawn: ",
      parseUsdc(difference.toString()).toString(),
      "USDC"
    );
  }

  it("should deposit underlying tokens into AlchemistV2", async function () {
    let failed = false;
    const amount = 50_000000;
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
    const amount = 20_000000000000000000;
    const loanAmount = ONE.mul(amount.toString());
    await takeLoan(loanAmount);
  });

  it("should take a loan in alUSD from another account in the AlchemistV2", async function () {
    const amount = 4_000000000000000000;
    const loanAmount = ONE.mul(amount.toString());
    await takeLoanFrom(loanAmount);
  });

  it("should repay loans in alUSD to the AlchemistV2 contract", async function () {
    const amount = 14_000000000000000000;
    const repayAmount = ONE.mul(amount.toString());
    await repayLoanInAlUsd(repayAmount);
  });

  it("should repay loans in USDC to the AlchemistV2 contract", async function () {
    const amount = 5_000000;
    const repayAmount = ONE.mul(amount.toString());
    await repayLoanInUSDC(repayAmount);
  });

  it("should liquidate loans in the AlchemistV2 contract", async function () {
    const amount = 1_000000;
    const liquidationAmount = ONE.mul(amount);
    await liquidateLoan(liquidationAmount);
  });

  it("should withdraw available USDC in user account in AlchemistV2 contract", async function () {
    const amount = 4_000000;
    const withdrawAmount = ONE.mul(amount);
    await withdrawUSDC(withdrawAmount);
  });

  it("should withdraw available USDC from another user account in AlchemistV2 contract into recipient address", async function () {
    const amount = 4_000000;
    const withdrawAmount = ONE.mul(amount);
    await withdrawUSDCFrom(withdrawAmount);
  });

  it("should donate debt tokens to the AlchemistV2 contract", async function () {
    const amount = 1_000000000000000000;
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

  it("should deposit yield token", async function () {
    const amount = await cUSDT.balanceOf(impersonatedSigner.address);
    const depositAmount = ONE.mul(amount.toString());
    await depositYieldToken(depositAmount);
  });

  it("should harvest and distribute outstanding yield", async function () {
    // let failed = false;
    // do{
    //   try{
    //     await harvest()
    //     failed = false;
    //   } catch (e) { failed = true;}
    // }  while(failed)

    const balanceBefore = await USDT.connect(impersonatedSigner).balanceOf(
      impersonatedSigner.address
    );
    // NOTE: Advancing the blocks allows the protocol to generate some rewards that can be distributed
    await hreProvider.send("hardhat_mine", ["0x2710"]);
    await AlchemistV2.connect(impersonatedSigner).snap(yieldToken);
    await AlchemistV2.connect(impersonatedSigner).harvest(yieldToken, 0);
    const balanceAfter = await USDT.connect(impersonatedSigner).balanceOf(
      impersonatedSigner.address
    );
    const difference = balanceAfter.sub(balanceBefore);
    console.log(
      "\tUSDC amount withdrawn: ",
      parseUsdc(difference.toString()).toString(),
      "USDC"
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
