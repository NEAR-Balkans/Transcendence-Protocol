# WETHGateway

A contract gateway for Eth Native token.

## Global Variables

The wrapped ethereum contract.

`IWETH9 public immutable WETH;`

The address of the whitelist contract.

`address public whitelist;`

## Functions

#### refreshAllowance

Approve max uint256 to Alchemist contract.

```
function refreshAllowance(address alchemist) external
```

#### depositUnderlying

deposit underlyingToken in Alchemist contract. Takes ethereum, converts it to wrapped ethereum, and then deposits it into an alchemist.

```
function depositUnderlying(
        address alchemist,
        address yieldToken,
        uint256 amount,
        address recipient,
        uint256 minimumAmountOut
) external
```

**Params:**

*   `address alchemist:` The address of the alchemist to deposit wrapped ethereum into.
    
*   `address yieldToken:` The yield token to deposit the wrapped ethereum as.
    
*   `uint256 amount:` The amount of ethereum to deposit.
    
*   `address recipient:` The address which will receive the deposited yield tokens.
    
*   `uint256 minimumAmountOut:` The minimum amount of yield tokens that are expected to be deposited to \`recipient\`.
    

#### withdrawUnderlying

Withdraw underlying token from Alchemist contract. Withdraws a wrapped ethereum based yield token from an alchemist, converts it to ethereum, and then transfers it to the recipient.

```
function withdrawUnderlying(
        address alchemist,
        address yieldToken,
        uint256 shares,
        address recipient,
        uint256 minimumAmountOut
) external
```

**Params:**

*   `address alchemist:` The address of the alchemist to deposit wrapped ethereum into.
    
*   `address yieldToken:` The yield token to deposit the wrapped ethereum as.
    
*   `uint256 amount:` The amount of ethereum to deposit.
    
*   `address recipient:` The address which will receive the deposited yield tokens.
    
*   `uint256 minimumAmountOut:` The minimum amount of yield tokens that are expected to be deposited to \`recipient\`.