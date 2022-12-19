## Audit scope

The core Alchemix contracts are already audited by Runtime Verification ([link](https://github.com/runtimeverification/publications/blob/main/reports/smart-contracts/Alchemix_v2.pdf)). They have been left untouched for the purpose of Alchemix Aurora fork.

Alchemix on Ethereum is using Yearn for it's yield-generating strategies, hence there is only one adapter ([link](https://github.com/alchemix-finance/v2-contracts/blob/master/contracts/adapters/yearn/YearnTokenAdapter.sol)).

Yearn is not available on Aurora, so we decided to use [Bastion protocol](https://bastionprotocol.com) for yield generating strategies since it is the most popular and reliable protocol on Aurora. Integration with Bastion required developing a custom [CTokenAdapter](https://github.com/Transcendence-Finance/Alchemix/blob/main/contracts/adapters/bastion/CTokenAdapter.sol).

Our go to market strategy is to launch with 3 different vaults:

*   USDC
    
*   USDT
    
*   wNEAR
    

All three vaults can utilise the same [CTokenAdapter](https://github.com/Transcendence-Finance/Alchemix/blob/main/contracts/adapters/bastion/CTokenAdapter.sol).

USDC and USDT are fully compatible with alUSD tokens used by Alchemix on Ethereum (audited). wNEAR vault([AlchemistNEARV2](https://github.com/Transcendence-Finance/Transcendence/blob/main/contracts/AlchemistNEARV2.sol)) requires custom token([AlchemicTokenNearV2](https://github.com/Transcendence-Finance/Transcendence/blob/main/contracts/AlchemicTokenNEARV2.sol)) due to a difference in decimals.

#### Scope of the audit:

*   [CTokenAdapter](https://github.com/Transcendence-Finance/Transcendence/blob/main/contracts/adapters/bastion/CTokenAdapter.sol)
    
*   [AlchemicTokenNearV2](https://github.com/Transcendence-Finance/Transcendence/blob/main/contracts/AlchemicTokenNEARV2.sol) - duplicated AlchemicTokenV2 and overridden `decimals`​ function to return 24 instead of 18
    
*   [AlchemistNEARV2](https://github.com/Transcendence-Finance/Transcendence/blob/main/contracts/AlchemistNEARV2.sol) - duplicated AlchemistV2 and modified to be compatible with 24 decimals
    

#### Commit hash:

*   [AlchemicTokenNEARV2](https://github.com/Transcendence-Finance/Transcendence/pull/18/commits/8bcb404a18dc0c48db85f56f224c648a83c00e42)
    
*   [AlchemistNEARV2](https://github.com/Transcendence-Finance/Transcendence/pull/18/commits/e0061a8f5c9bc241e66bfba941eb210210cafa16)
    
*   [CTokenAdapter](https://github.com/Transcendence-Finance/Transcendence/pull/18/commits/ef72734358915d662500ec3b458552e001dceb1a)