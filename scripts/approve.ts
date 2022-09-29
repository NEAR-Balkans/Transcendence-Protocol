import hre, { ethers } from "hardhat";

const main = async () =>{
    const signers = await ethers.getSigners()
    const c = await ethers.getContractAt("IERC20", "0xB12BFcA5A55806AaF64E99521918A4bf0fC40802")
    // alchemist address
    const to = "0x077DF62Fd1d96B3395d8db27B633b6b88490f38c"
    const amount = 1000000
    await c.approve(to, amount)
    console.log("approved")
    console.log(await c.allowance(signers[0].address, to))
}

main()