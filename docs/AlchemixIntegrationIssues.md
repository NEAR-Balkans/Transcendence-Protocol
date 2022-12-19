### A list of issues that we encounter when integrating with the Alchemix Contract

1.  When we try to call harvest, it sometimes fails because (harvestableAmount == 0). This continues to happen even after advancing the blocks in the tests. How do we ensure that harvest works correctly?
    
2.  The AlchemistV2, TransmuterV2 and TransmuterBuffer have a construct with an initializer modifier. This means that after we deploy a contract, we cannot call the initialize function on it because the constructor already set the initialize state to true. How do we deploy the contract without removing this constructor?
    
3.  We would also like to confirm if the following configurations are accurate:

```    
//Underlying token configuration (USDC) configuration
const underlyingTokenConfig = {
  repayLimitMinimum: 1000000000000,
  repayLimitMaximum: 5000000000000,
  repayLimitBlocks: 300,    
  liquidationLimitMinimum: 1000000000000,
  liquidationLimitMaximum: 5000000000000,
  liquidationLimitBlocks: 300
}
//Yield token configuration (cUSDC) configuration
  const yieldTokenConfig = {
  adapter: tokenAdapter.address,
  maximumLoss: 25,
  maximumExpectedValue: 50000000000,
  creditUnlockBlocks: 7200    
};
```
