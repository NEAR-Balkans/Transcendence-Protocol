Here are the steps to take to deploy the Alchemix contract

1.  Fill the .env file with the necessary credentials such as:
    

AURORA\_RPC= aurora\_network\_rpc

AURORA\_PUBLIC\_KEY= aurora\_wallet\_public\_key

AURORA\_PRIVATE\_KEY= auror\_awallet\_\_private

ETHERSCAN\_API\_KEY= aurorascan\_api\_key

CTOKEN\_ADDRESS= ctoken\_address

UNDERLYING\_TOKEN\_ADDRESS= underlying\_token\_address

  

2\. run `npx hardhat deploy --network network_name`​

3\. run the hardhat tasks in the following order:

1.  Whitelist the AlchemistV2 contract in the debt token contract

    `npx hardhat setDebtTokenWhiteList --network aurora\_mainnet`

2.  Whitelist the AlchemistV2 contract in the TransmuterBuffer contract
    
    `npx hardhat setSource --network aurora\_mainnet`
    
3.  Set transmuter and underlying token in TransmuterBuffer contract
    
    `npx hardhat setTransmuter --network aurora\_mainnet`
    
4.  Whitelist a caller in the Whitelist contract

    `npx hardhat whitelistCaller --network aurora\_mainnet`
    
5.  Add underlying token to AlchemistV2 contract
    
    `npx hardhat addUnderlyingToken --network`
    
6.  Add yield token to AlchemistV2
    
    `npx hardhat addYieldToken --network`
    
7.  Set underlying token to enabled in AlchemistV2
    
    `npx hardhat setUnderlyingTokenEnabled --network`
    
8.  Set yield token to enabled in AlchemistV2
    
    `npx hardhat setYieldTokenEnabled --network`
    
9.  Deposit underlying token into AlchemistV2
    
    `npx hardhat depositUnderlying --network`
    
10. Borrow from AlchemistV2
    
    `npx hardhat mint --network localhost`
    

11. Repay loan to AlchemistV2
    
    `npx hardhat repay --network localhost`

12. Withdraw underlying tokens from AlchemisV2
    
    `npx hardhat withdrawUnderlying --network localhost`

4\. Verify contracts: this failed with etherscan hardhat plugin key (still not sure why yet)