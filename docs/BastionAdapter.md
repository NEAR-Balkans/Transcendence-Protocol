# Bastion Adapter

`underlying token`: USDC

`yield token`: cUSDC

### Introduction

The `TokenAdapter` interface is used to specify adapters that interact with yield bearing tokens.

They currently serve 4 main purposes:

1.  1.Providing a reliable price oracle for the price of the `yieldToken` in units of `underlyingTokens`.
    
2.  2.Wrapping the supported `underlyingToken` into the supported `yieldToken`.
    
3.  3.Unwrapping the supported `yieldToken` into the supported `underlyingToken`.
    

Users can pass a `maximumLoss` parameter (denominated in basis-points) to the `wrap()` and `unwrap()` functions which will cause the transaction to revert if the amount of underlying tokens lost as a result of the action exceeds it.

## Functions

The following is a consolidated interface for the `ITokenAdapter` contract.

```
pragma solidity ^0.8.11;

interface ITokenAdapter {
    function token() external view returns (address);
    function underlyingToken() external view returns (address);
    function price() external view returns (uint256);
    function wrap(
        uint256 amount,
        address recipient
    ) external returns (uint256);
    function unwrap(
        uint256 amount,
        address recipient
    ) external returns (uint256);
}
```

#### version

Gets the current version.

```
function version() external returns (string);
```

#### token

Gets the address of the yield token that this adapter supports.

```
function token() external returns (address);
```

#### underlyingToken

Gets the address of the underlying token that the yield token wraps.

```
function underlyingToken() external returns (address);
```

#### price

Gets the number of underlying tokens that a single whole yield token is redeemable for.

```
function price() external returns (uint256);
```

#### wrap

Wraps `amount` underlying tokens into the yield token.

```
function wrap(
    uint256 amount,
    address recipient
) external returns (uint256 amountYieldTokens);
```

#### unwrap

Unwraps `amount` yield tokens into the underlying token.

```
function unwrap(
    uint256 amount,
    address recipient
) external returns (uint256 amountUnderlyingTokens);
```