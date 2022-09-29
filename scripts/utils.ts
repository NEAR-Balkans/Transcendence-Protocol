const {deployments, getNamedAccounts, run, ethers, getChainId} = require("hardhat");

export async function deployUpgradable(
  contractName: string,
  initializeFunctionArgs:any = [],
  artifactName = contractName,
  verify = true,
  log = true,
  skipIfAlreadyDeployed = true
) {
  const {deployer} = await getNamedAccounts();
  const deployment = await deployments.deploy(artifactName, {
    from: deployer,
    skipIfAlreadyDeployed,
    contract: contractName,
    proxy: {
      owner: deployer,
      proxyContract: "OpenZeppelinTransparentProxy",
      execute: {init: {methodName: 'initialize', args: initializeFunctionArgs}}
    },
    log
  })

  const {implementation} = deployment;
  try {
    console.log(contractName + ' implementation initialization start');
    const implementationDeployment = await ethers.getContractAt(contractName, implementation);
    const tx = await implementationDeployment.initialize(...initializeFunctionArgs);
    await tx.wait();
    console.log(contractName + 'implementation initialize done');
  } catch (e) {
    console.log(contractName + " implementation already initialized");
  }

  console.log(contractName, "proxy address:", deployment.address);

  if (verify) {
    await verifyContract(implementation, artifactName, []);
  }

  return ethers.getContractAt(contractName, deployment.address);
}

export async function deployNonUpgradable(
  contractName: string,
  constructorArgs:  any,
  artifactName = contractName,
  librariesName: any,
  verify = true,
  log = true,
  skipIfAlreadyDeployed = true
) {
  const {deployer} = await getNamedAccounts();
  const deployment = await deployments.deploy(artifactName, {
    from: deployer,
    skipIfAlreadyDeployed,
    contract: contractName,
    args: constructorArgs,
    log
  });

  if (verify) {
   await verifyContract(deployment.address, artifactName, constructorArgs);
  }
  return ethers.getContractAt(contractName, deployment.address);
}

export async function verifyContract(
  address: string,
  artifactName: string,
  constructorArguments: any,
) {
  try {
    await run("verify:verify", {address, constructorArguments, libraries: {}});
    console.log(`Contract ${artifactName} successfully verified`);
  } catch (error: any) {
    console.warn('\n !!! Contract not verified');
    console.error(`Error: ${error.message}\n`);
  }
}