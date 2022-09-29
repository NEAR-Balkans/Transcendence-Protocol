import {
  TestCToken,
  CTokenAdapter,
  TestTetherToken,
} from "../typechain";
import {ethers} from "hardhat";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {expect} from "chai";

describe("CTokenAdapter Unit Tests", function () {
  let accounts;
  let cToken: TestCToken;
  let owner: SignerWithAddress;
  let underlyingToken: TestTetherToken ;
  let cTokenAdapter: CTokenAdapter;

  before(async function() {
    const tokenDecimal = 6;
    const amountToMint = 1000_000_000;
    accounts = await ethers.getSigners();
    owner = accounts[0];

    const testERC20Factory = await ethers.getContractFactory("TestTetherToken");
    underlyingToken = await (await testERC20Factory.connect(owner)
      .deploy(amountToMint, tokenDecimal)
    ).deployed();

    const testCTokenFactory = await ethers.getContractFactory("TestCToken");
    cToken = await (await testCTokenFactory.connect(owner)
        .deploy(amountToMint, tokenDecimal, underlyingToken.address)
    ).deployed();

    const cTokenAdapterFactory = await ethers.getContractFactory("CTokenAdapter");
    cTokenAdapter = await (await cTokenAdapterFactory.connect(owner)
        .deploy(cToken.address, underlyingToken.address)
    ).deployed();
  });

  it("should successfully wrap tokens", async function() {
    const approvedAmount = 50_000_000;
    const cTokenBalanceBefore = await cToken.balanceOf(owner.address);
    const underlyingBalanceBefore = await underlyingToken.balanceOf(owner.address);

    await underlyingToken.approve(cTokenAdapter.address, approvedAmount);
    await cTokenAdapter.wrap(approvedAmount, owner.address);
    const cTokenBalanceAfter = await cToken.balanceOf(owner.address);
    const underlyingBalanceAfter = await underlyingToken.balanceOf(owner.address);

    expect(cTokenBalanceAfter.sub(cTokenBalanceBefore).eq(approvedAmount)).to.be.true;
    expect(underlyingBalanceBefore.sub(underlyingBalanceAfter).eq(approvedAmount)).to.be.true;
  });

  it("should minted amount deposited after transfer fee has been deducted", async function() {
    const approvedAmount = 50_000_000;
    const cTokenBalanceBefore = await cToken.balanceOf(owner.address);
    const underlyingTokenFee = 50000;

    await underlyingToken.setParams(10, 20)
    await underlyingToken.approve(cTokenAdapter.address, approvedAmount);
    await cTokenAdapter.wrap(approvedAmount, owner.address);
    const cTokenBalanceAfter = await cToken.balanceOf(owner.address);
    expect(cTokenBalanceAfter.sub(cTokenBalanceBefore).eq(underlyingTokenFee));
  });

  it("should successfully unwrap tokens", async function() {
    const approvedAmount = 50_000_000;
    const cTokenBalanceBefore = await cToken.balanceOf(owner.address);
    const underlyingBalanceBefore = await underlyingToken.balanceOf(owner.address);

    await cToken.approve(cTokenAdapter.address, approvedAmount);
    await cTokenAdapter.unwrap(approvedAmount, owner.address);
    const cTokenBalanceAfter = await cToken.balanceOf(owner.address);
    const underlyingBalanceAfter = await underlyingToken.balanceOf(owner.address);

    expect(cTokenBalanceBefore.sub(cTokenBalanceAfter).eq(approvedAmount)).to.be.true;
    expect(underlyingBalanceAfter.sub(underlyingBalanceBefore).eq(approvedAmount)).to.be.true;
  });
})