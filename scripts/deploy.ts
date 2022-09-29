const hre = require("hardhat");
import { Contract, Wallet } from "ethers";
import { ethers, upgrades } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const AURORA_RPC = process.env.AURORA_RPC;
const AURORA_PRIVATE_KEY = process.env.AURORA_PRIVATE_KEY;

type ContractNames = {
  AlchemistV2: string;
};

class ContractDeployer {
  signer: Wallet | SignerWithAddress;

  constructor (signer: Wallet | SignerWithAddress) {
    this.signer = signer;
  }

  deployContract = async <T extends Contract>(
    contractName: keyof ContractNames,
    ...args: any[]
  ) => {
    const Contract = await ethers.getContractFactory(contractName, this.signer);
    const contract = args.length
      ? ((await Contract.deploy(...args)) as unknown as T)
      : ((await Contract.deploy()) as unknown as T);
    await contract.deployed();
    return contract;
  };

  deployProxy = async <T extends Contract>(
    contractName: keyof ContractNames,
    ...args: any[]
  ) => {
    const Contract = await ethers.getContractFactory(contractName, this.signer);
    const contract = args.length
      ? ((await upgrades.deployProxy(Contract, args)) as T)
      : ((await upgrades.deployProxy(Contract)) as T);
    await contract.deployed();
    return contract;
  };
}

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(AURORA_RPC);
  // @ts-ignore
  const signer = new ethers.Wallet(AURORA_PRIVATE_KEY, provider);
  const contractDeployer = new ContractDeployer(signer);
  await contractDeployer.deployContract("AlchemistV2");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });