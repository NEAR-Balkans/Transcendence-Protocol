### What is Alchemix Elixir?

Alchemix just released a new liquidity management module called Elixir which is an Algorithmic Market Operator (AMO). Elixir is responsible for deepening the liquidity in the Alchemix market by depositing underlying tokens into curve pools, and also maintaining the alUSD and alETH price peg by doing a one-sided withdrawal/deposit of either token on the curve pool when it is overbalanced or under-balanced. It also does a few things like earn yield from the convex protocol and all that. But that is the basic idea of the Elixir AMO. So whenever underlying tokens are sent to the TransmuterBuffer, it get's flushed into the Elixir AMO by the `flushToAmo`​ function. That's why it's called `flushToAmo`.

  

### What do we need to setup Elixir on Aurora?

To setup Elixir on Aurora, we need the following:

*   Curve 3Pool on Aurora: This pool will be where Elixir deposits underlying tokens into to earn yield. Curve is available on Aurora🎉
    
*   Convex CRV pool: This is the pool where the LP tokens gotten from the 3Pool will be deposited into to earn Curve trading fees, boosted CRV and CVX tokens. Convex is not on Aurora yet : (.
    
*   Votium: This is the pool where CVX tokens are staked/locked/delegated for voting on Votium and to earn ALCX yield. Votium is not on Aurora yet : (.
    

  

### General Concern

The whole idea of Elixir is to have an automated module that manages liquidity and asset price peg in the ALchemix protocol. We have to also think about this as well.

  

### Resources:

*   [https://alchemixfi.medium.com/elixir-the-alchemix-algorithmic-market-operator-2e4c8ad04569](https://alchemixfi.medium.com/elixir-the-alchemix-algorithmic-market-operator-2e4c8ad04569)
    
*   [https://etherscan.io/address/0x9735f7d3ea56b454b24ffd74c58e9bd85cfad31b#code](https://etherscan.io/address/0x9735f7d3ea56b454b24ffd74c58e9bd85cfad31b#code)
    
*   [https://aurora.dev/ecosystem/curve](https://aurora.dev/ecosystem/curve)