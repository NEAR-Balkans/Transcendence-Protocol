Almanac  

You need to enable JavaScript to run this app.

## Alchemix Mainnet Contract Interaction

1.  Go to remix [https://remix.ethereum.org/](https://remix.ethereum.org/)
    
2.  Create a file `Alchemist.sol` and copy/past this [interface](https://github.com/Transcendence-Finance/Alchemix/blob/main/contracts/interfaces/alchemist/IAlchemistV2Actions.sol).
    
3.  Copy Alchemist address from [here](https://github.com/Transcendence-Finance/Alchemix/blob/main/deployments/aurora_mainnet/AlchemistV2_Proxy.json) then add it to `At Address`​ in remix.
    
4.  Deposit USDC token into the Alchemix contract on Aurora by taking the following steps:
    
    1.  Get [USDC](https://aurorascan.dev/token/0xb12bfca5a55806aaf64e99521918a4bf0fc40802) into your wallet on the Aurora network
    
    2.  Approve Alchemix to transfer USDC from your wallet into the contract
    
    3.  call the `depositUnderlying()` function to deposit USDC into the Alchemix contract
    
    4.  Alchemix wraps the USDC token in the token adapter and and deposits them into the Bastion adapter.
    
    5.  The Bastion adapter deposits the USDC token into the Bastion cToken vault and then mints some cTokens and sends them to the Alchemix contract
    
5.  Borrow some alUSD from the Alchemix contract on Aurora by taking the following steps:
    
    1.  Call the `mint()` function on the Alchemix contract to borrow some alUSD from the contract
    
    2.  The Alchemix contract checks the account to ensure that it can borrow, and then mints new alUSD into the account that called the `mint()` function.
    
6.  Repay alUSD loans in the Alchemix contract on Aurora by taking the following steps:
    
    1.  Call the `repay()` function in the Alchemix contract with the amount of underlying tokens to repay
    
    2.  The underlying tokens (USDC) is sent the Alchemix contract which then deposits the function into the TransmuterBuffer contract. After depositing into the TransmuterBuffer contract, the tokens are exchanged in the Transmuter contract and the the debt position of the account is reduced.
    
7.  Withdraw deposited USDC token from the Alchemix contract on Aurora by taking the following steps
    
    1.  Call the withdrawUnderlying() function in the Alchemix contract
    
    2.  The Alchemix contract will check the account of the sender to confirm that the account is in the right state to be withdrawn from
    
    3.  If the account is okay, the Alchemix contract calls the unwrap function in the token adapter and unwraps some underlying tokens.
    
    4.  The token adapter then transfers some yield tokens from to the Alchemix contract to itself to the tune of the amount to be withdrawn.
    
    5.  The token adapter redeems some underlying tokens with the equivalent amount of yield token from the Bastion cToken vault, and the redeemed amount is transferred to the user.