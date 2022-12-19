# Interact With AlchemistV2 Contract

Go to [https://remix.ethereum.org/](https://remix.ethereum.org/) and create a new project.

## UnderlyingToken (USDC)

### Allowed Tokens

*   USDC
    
*   USDT
    
*   NEAR
    

### Deposit Allowed Tokens

#### Step1: Approve allowed tokens to AlchemistV2 contract

You can use the [IERC20](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol) interface and approve the amount that you want to deposit inside the protocol.
```
function approve(address spender, uint256 amount) external returns (bool);
```

#### Step2: Deposit your USDC inside AlchemistV2 contract

You can deposit **USDC** by calling the:

*   `yieldToken:` Bastian cUSDC address.
    
*   `amount:` the amount approved in step1.
    
*   `recipient:` receiver address.
    
*   `minimumAmountOut:` min amount out after slippage.
    

```
function depositUnderlying(
    address yieldToken,
    uint256 amount,
    address recipient,
    uint256 minimumAmountOut
) returns external (uint256);
```

### Borrow mxUSD/mxNEAR

After deposit USDC inside the AlchemistV2 contract you can borrow 50% of your tota deposit in alUSD token, this token is weighted to USDC 1:1.

Call the function, and pass the amount to borrow.

**Note: the amount has to be in alUSDC (18 DECIMALS)**

```
function mint(uint256 amount, address recipient) external;
```

### Repay/Burn

When you borrow mxUSD/mxNEAR, your debt balance increase, in this case, there are 2 ways to repay your debt:

1.  Repay using USDC
    
2.  Burn your alUSD
    

You can get the current debt of a spécific address by calling:

```
function accounts(address owner)
    external view override
    returns (int256 debt, address[] memory depositedTokens);
```

#### Repay

**Step1: Approve USDC to AlchemistV2 contract**

To rebay your debt you need first to approve the amount to repay to AlchemistV2 contract in USDC token. You can use the [IERC20](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol) interface and approve the amount that you want to repay.

```
function approve(address spender, uint256 amount) external returns (bool);
```

**Step2: Repay your debt**

Call repay function:

*   `underlyingToken:` USDC address
    
*   `amount:` amount in USDC (6 DECIMALS)
    
*   `recipient:` the recipient address
    
```
function repay(address underlyingToken, uint256 amount, address recipient) external returns (uint256)
```

#### Burn

**Step1: Approve mUSD to AlchemistV2 contract**

To burn your debt you need first to approve the amount to repay to AlchemistV2 contract in alUSD token. You can use the [IERC20](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol) interface and approve the amount that you want to burn.

```
function approve(address spender, uint256 amount) external returns (bool);
```
  

**Step2: Burn your debt**

Call burn function:

*   `amount:` the amount approved in step 1 (in alUSD 18 DECIMALS)
    
*   `recipient:`​the recipient address
    
```
function burn(uint256 amount, address recipient) external returns (uint256);
```

### Withdraw

You can withdraw your USDC tokens by calling this function inside AlchemistV2 contract:
```
function withdrawUnderlying(
    address yieldToken,
    uint256 shares,
    address recipient,
    uint256 minimumAmountOut
) external returns (uint256);
```

After this call, your USDC will be transferred to your wallet.

### Liquidate

You can liquidate all your shares by calling this function:

*   `yieldToken:` the yieldToken address(cUSDC)
    
*   `shares:` amount of shares
    
*   minimumAmountout: min amount out after liquidation.
    
```
function liquidate(
    address yieldToken,
    uint256 shares,
    uint256 minimumAmountOut
) external returns (uint256)
```

### Donate

**Step1: Approve alUSD to AlchemistV2 contract**

To donate your alUSD you need first to approve the amount to repay to AlchemistV2 contract in alUSD token. You can use the [IERC20](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol) interface and approve the amount that you want to donate.

```
function approve(address spender, uint256 amount) external returns (bool);
```
  
**Step2: Call donate**

You can donate your alUSD to the system by calling donate function.

*   `yieldToken:` the yieldToken address(cUSDC)
    
*   `amount:` amount to donate
    
```
function donate(address yieldToken, uint256 amount) external;
```

# Interact With TransmuterV2 Contract

The transmuter allows to exchange **alUSD** to **USDC**

### Deposit

**Step1: Approve alUSD to AlchemistV2 contract**

To deposy your alUSD you need first to approve the amount to repay to TransmuterV2 contract. You can use the [IERC20](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol) interface and approve the amount that you want to deposit.

```
function approve(address spender, uint256 amount) external returns (bool);
```

**Step2: Deposit alUSD token inside the transmuter**

```
function deposit(uint256 amount, address owner) external;
```

### Withdraw

Withdraw the deposited alUSD from the transmuter

```
function withdraw(uint256 amount, address recipient) external;
```

### Claim

Claim USDC from the Transmuter.

```
function claim(uint256 amount, address recipient) external;
````
