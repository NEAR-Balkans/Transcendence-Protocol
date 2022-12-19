# Alchemist

`debt token`: mxUSD

`underlying token`: USDC

`yield token`: cUSDC

### Introduction

The `AlchemistV2` is the core contract in any Alchemix debt-system that holds Account data and issues that system's debt tokens. The `AlchemistV2` is flexible enough to accept deposits in the form of either yield-bearing-assets or underlying collateral assets (and wrapping said underlying tokens into their yield-bearing form).

## Concepts

## User Flow

![Untitled](https://res.cloudinary.com/almanac/image/upload/v1650472600/workspace_portal_uploads/glkeegx4wa9lcuix1yev.png)

## Accounts

An `Account` in the `Alchemist`​contract has multiple components. The first 2 data-points to understand are **balances** and \*\* debt\*\*.

**Balances** is a `mapping` of **yieldTokens** to the `Account`'s respective balance of **Alchemist-shares**. \*\* Shares\*\* represent a user's deposit of **yieldTokens** in the `AlchemistV2`, and provide an accounting abstraction that helps the `AlchemistV2` avoid bank-run scenarios.

**Debt** is an `int256` type that represents both the account's **debt** (positive values) and **credit** (negative values).

An `Account` manages its debt by tracking the **lastAccruedWeights** of the various **depositedTokens** that it is holding.

An `Account` also has the ability to track **mintAllowances** and **withdrawAllowances** that allow 3rd-party accounts to mint and withdraw its assets.

  

### Whitelisting

As a security precaution, certain action methods in the Alchemist are whitelisted, meaning that, when `msg.sender` is another contract, that contract must be whitelisted by governance in order for the call to succeed.

There is no such whitelist restriction for EOA's. Any EOA can ALWAYS interact with the AlchemistV2 without needing to be whitelisted.

Copied!

As the system matures, this whitelist can be disabled by governance.

### Maximum Expected Value

Each yield token accepted by the Alchemist has a configured maximum expected value. For each yield token, the total value (denominated in underlying tokens) of the balance of that yield token held by the Alchemist may not exceed it's **maximum expected value**.

**Maximum expected value** functions as a tuneable deposit limit, allowing governance to limit the acceptable exposure that a synthetic asset has to each individual vault that collateralizes it.

### Maximum Loss

Each yield token accepted by the Alchemist has a configured maximum amount of loss that it can experience and still function normally. If the vault loses more than the specified `maximumLoss` (denominated in basis-points), the following functions are automatically disabled:

*   `deposit()`
*   `depositUnderlying()`
*   `withdrawUnderlying()`
*   `withdrawUnderlyingFrom()`
*   `liquidate()`
*   `harvest()`
    
Importantly, the following functions are still useable:

*   `withdraw()`
*   `withdrawFrom()`
*   `repay()`
*   `mint()`
*   `burn()`

The `maximumLoss` is configured as an amount of basis-points of the total expected value of the vault. Because there are situations where a vault might experience a small, transient loss, it will likely be wise to keep `maximumLoss` around 1-10 bps.

In the event a vault experiences a loss that is sufficient to disable functionality and is deemed by the DAO to be non-transient, the `snap()` function can be called to reset the expected value of the yield tokens held by the Alchemist, thereby accepting the loss and resuming normal operation.

### Mint, Repay, and Liquidate Caps

Due to the arbitrage inherent to the Alchemix V2 system, it is important to have stop-gap measures in place to prevent massive capital movements that could harm the backing of synthetic assets. To address this, `repay()` `liquidate()`, and `mint()` all have time-based limits to how much they can be used.

Each underlying token registered in an Alchemist has its own `repay` and `liquidate` limit that keeps track of the total amount of funds repaid or liquidated globally. Each synthetic token has its own `mint` limit that keeps track of the total amount of funds minted globally. These limits each track their given metric and linearly cool down over a specified amount of time.

For example, if governance sets the `liquidate()` cap for DAI to 20 million with a 10 minute cooldown, then the maximum amount of DAI that can be liquidated from all of the strategies used by the alUSD Alchemist over the span of 10 minutes is 20 million. The cooldown period is linear, so if the 20 million cap gets hit, no more DAI can be liquidated in that block, but after 5 minutes users can liquidate up to 10 million DAI.

### Sentinels

The sentinels of V2 serve a function similar to the one they did in V1: allow trusted external accounts to disable access to deposit funds into a vault that has been compromised. If a yield token or underlying token is disabled, the following functions are not useable:

*   `deposit()`
*   `depositUnderlying()`
*   `liquidate()`
*   `repay()`

Importantly, users can still withdraw their funds. The `harvest()` function also still functions so debts can continue to be repaid by yield.

The long-term goal is for sentinels to be decentralized keeper bots that monitor chain state and pause underlying and yield tokens based on certain safety triggers.

## Structs

#### Account
```
/// @notice A user account.
struct Account {
    // A signed value which represents the current amount of debt or credit that the account has accrued.
    // Positive values indicate debt, negative values indicate credit.
    int256 debt;
    // The share balances for each yield token.
    mapping(address => uint256) balances;
    // The last values recorded for accrued weights for each yield token.
    mapping(address => uint256) lastAccruedWeights;
    // The set of yield tokens that the account has deposited into the system.
    Sets.AddressSet depositedTokens;
    // The allowances for mints.
    mapping(address => uint256) mintAllowances;
    // The allowances for withdrawals.
    mapping(address => mapping(address => uint256)) withdrawAllowances;
}
```

## Functions

#### getYieldTokensPerShare

Gets the conversion rate of yield tokens per share.
```
function getYieldTokensPerShare(address yieldToken) external view returns (uint256 rate);
```
#### getUnderlyingTokensPerShare

Gets the conversion rate of underlying tokens per share.
```
function getUnderlyingTokensPerShare(address yieldToken) external view returns (uint256 rate);
```
#### getSupportedUnderlyingTokens

Gets the supported underlying tokens.

The order of the entries returned by this function is not guaranteed to be consistent between calls.

`function getSupportedUnderlyingTokens() external returns (address[]);`​

#### getSupportedYieldTokens

Gets the supported yield tokens.

The order of the entries returned by this function is not guaranteed to be consistent between calls.

`function getSupportedYieldTokens() external returns (address[]);`​

#### isSupportedUnderlyingToken

Gets if an underlying token is supported.

`function isSupportedUnderlyingToken(address underlyingToken) external returns (bool);`​

#### isSupportedYieldToken

Gets if a yield token is supported.

`function isSupportedYieldToken(address yieldToken) external returns (bool);`​

#### accounts

Gets information about the account owned by `owner`.
```
function accounts(address owner) external returns (int256 debt, address depositedTokens);
```
#### positions

Gets information about a yield token position for the account owned by `owner`.​
```
function positions(
    address owner,
    address yieldToken
) external returns (uint256 shares, uint256 lastAccruedWeight);
```
#### mintAllowance

Gets the amount of debt tokens `spender` is allowed to mint on behalf of `owner`.

```
function mintAllowance(
    address owner,
    address spender
) external returns (uint256);
```

#### withdrawAllowance

Gets the amount of shares of `yieldToken` that `spender` is allowed to withdraw on behalf of `owner`.
```
function withdrawAllowance(
    address owner,
    address spender,
    address yieldToken
) external returns (uint256);
```
#### getUnderlyingTokenParameters
Gets the parameters of an underlying token.
```
function getUnderlyingTokenParameters(address underlyingToken) external returns (struct IAlchemistV2State.UnderlyingTokenParams);
```

#### getYieldTokenParameters

Get the parameters and state of a yield-token.
```
function getYieldTokenParameters(address yieldToken) external returns (struct IAlchemistV2State.YieldTokenParams);
```

#### getMintLimitInfo

Gets current limit, maximum, and rate of the minting limiter.
```
function getMintLimitInfo() external returns (uint256 currentLimit, uint256 rate, uint256 maximum);
```

#### getRepayLimitInfo

Gets current limit, maximum, and rate of a repay limiter for `underlyingToken`.
```
function getRepayLimitInfo(address underlyingToken) external returns (uint256 currentLimit, uint256 rate, uint256 maximum);
```

#### getLiquidationLimitInfo

Gets current limit, maximum, and rate of the liquidation limiter for `underlyingToken`.
```
function getLiquidationLimitInfo(address underlyingToken) external returns (uint256 currentLimit, uint256 rate, uint256 maximum);
```

#### setPendingAdmin

Sets the pending administrator.

`msg.sender` must be the admin or this call will will revert with an {Unauthorized} error.

Emits a {PendingAdminUpdated} event.

This is the first step in the two-step process of setting a new administrator. After this function is called, the pending administrator will then need to call {acceptAdmin} to complete the process.

```
function setPendingAdmin(address value) external;
```

#### acceptAdmin

Allows for `msg.sender` to accepts the role of administrator.

`msg.sender` must be the admin or this call will revert with an {Unauthorized} error. The current pending administrator must be non-zero or this call will revert with an {IllegalState} error.

Emits a {AdminUpdated} event. Emits a {PendingAdminUpdated} event. This is the second step in the two-step process of setting a new administrator. After this function is successfully called, this pending administrator will be reset and the new administrator will be set.

```
function acceptAdmin() external;
```

#### setSentinel

Sets an address as a sentinel.

`msg.sender` must be the admin or this call will revert with an {Unauthorized} error.
```
function setSentinel(
    address sentinel,
    bool flag
) external;
```

#### setKeeper

Sets an address as a keeper.

`msg.sender` must be the admin or this call will revert with an {Unauthorized} error.
```
function setKeeper(
    address keeper,
    bool flag
) external;
```

#### addUnderlyingToken

Adds an underlying token to the system.

`msg.sender` must be the admin or this call will revert with an {Unauthorized} error.

```
function addUnderlyingToken(
    address underlyingToken,
    struct IAlchemistV2AdminActions.UnderlyingTokenConfig config
) external;
```

#### addYieldToken

Adds a yield token to the system.

`msg.sender` must be the admin or this call will revert with an {Unauthorized} error.

Emits a {AddYieldToken} event. Emits a {TokenAdapterUpdated} event. Emits a {MaximumLossUpdated} event.
```
function addYieldToken(
    address yieldToken,
    struct IAlchemistV2AdminActions.YieldTokenConfig config
) external;
```

#### setUnderlyingTokenEnabled

Sets an underlying token as either enabled or disabled.

`msg.sender` must be either the admin or a sentinel or this call will revert with an {Unauthorized} error. `underlyingToken` must be registered or this call will revert with a {UnsupportedToken} error.

Emits an {UnderlyingTokenEnabled} event.
```
function setUnderlyingTokenEnabled(
    address underlyingToken,
    bool enabled
) external;
```

#### setYieldTokenEnabled

Sets a yield token as either enabled or disabled.

`msg.sender` must be either the admin or a sentinel or this call will revert with an {Unauthorized} error. `yieldToken` must be registered or this call will revert with a {UnsupportedToken} error.

Emits a {YieldTokenEnabled} event.
```
function setYieldTokenEnabled(
    address yieldToken,
    bool enabled
) external;
```

#### configureRepayLimit

Configures the the repay limit of `underlyingToken`.

`msg.sender` must be the admin or this call will revert with an {Unauthorized} error. `underlyingToken` must be registered or this call will revert with a {UnsupportedToken} error.

Emits a {ReplayLimitUpdated} event.
```
function configureRepayLimit(
    address underlyingToken,
    uint256 maximum,
    uint256 blocks
) external;
```

#### configureLiquidationLimit

Configure the liquidation limiter of `underlyingToken`.

`msg.sender` must be the admin or this call will revert with an {Unauthorized} error. `underlyingToken` must be registered or this call will revert with a {UnsupportedToken} error.

Emits a {LiquidationLimitUpdated} event.
```
function configureLiquidationLimit(
    address underlyingToken,
    uint256 maximum,
    uint256 blocks
) external;
```

#### setTransmuter

Set the address of the transmuter.

`msg.sender` must be the admin or this call will revert with an {Unauthorized} error. `value` must be non-zero or this call will revert with an {IllegalArgument} error.

Emits a {TransmuterUpdated} event.
```
function setTransmuter(address value) external;
```

#### setMinimumCollateralization

Set the minimum collateralization ratio.

`msg.sender` must be the admin or this call will revert with an {Unauthorized} error.

Emits a {MinimumCollateralizationUpdated} event.

```
function setMinimumCollateralization(uint256 value) external;
```

#### setProtocolFee

Sets the fee that the protocol will take from harvests.

`msg.sender` must be the admin or this call will revert with an {Unauthorized} error. `value` must be in range or this call will with an {IllegalArgument} error.

Emits a {ProtocolFeeUpdated} event.
```
function setProtocolFee(uint256 value) external;
```

#### setProtocolFeeReceiver

Sets the address which will receive protocol fees.

`msg.sender` must be the admin or this call will revert with an {Unauthorized} error. `value` must be non-zero or this call will revert with an {IllegalArgument} error.

Emits a {ProtocolFeeReceiverUpdated} event.
```
function setProtocolFeeReceiver(address value) external;
```

#### configureMintingLimit

Configures the minting limiter.

`msg.sender` must be the admin or this call will revert with an {Unauthorized} error.

Emits a {MintingLimitUpdated} event.
```
function configureMintingLimit(
    uint256 maximum,
    uint256 blocks
) external;
```

#### configureCreditUnlockRate

Sets the rate at which credit will be completely available to depositors after it is harvested.

Emits a {CreditUnlockRateUpdated} event.
```
function configureCreditUnlockRate(
    address yieldToken,
    uint256 blocks
) external;
```

#### setTokenAdapter

Sets the token adapter of a yield token.

`msg.sender` must be the admin or this call will revert with an {Unauthorized} error. `yieldToken` must be registered or this call will revert with a {UnsupportedToken} error. The token that `adapter` supports must be `yieldToken` or this call will revert with a {IllegalState} error.

Emits a {TokenAdapterUpdated} event.

```
function setTokenAdapter(
    address yieldToken,
    address adapter
) external;
```

#### setMaximumExpectedValue

Sets the maximum expected value of a yield token that the system can hold.

`msg.sender` must be the admin or this call will revert with an {Unauthorized} error. `yieldToken` must be registered or this call will revert with a {UnsupportedToken} error.
```
function setMaximumExpectedValue(
    address yieldToken,
    uint256 value
) external;
```

#### setMaximumLoss

Sets the maximum loss that a yield bearing token will permit before restricting certain actions.

`msg.sender` must be the admin or this call will revert with an {Unauthorized} error. `yieldToken` must be registered or this call will revert with a {UnsupportedToken} error.

There are two types of loss of value for yield bearing assets: temporary or permanent. The system will automatically restrict actions which are sensitive to both forms of loss when detected. For example, deposits must be restricted when an excessive loss is encountered to prevent users from having their collateral harvested from them. While the user would receive credit, which then could be exchanged for value equal to the collateral that was harvested from them, it is seen as a negative user experience because the value of their collateral should have been higher than what was originally recorded when they made their deposit.
```
function setMaximumLoss(
    address yieldToken,
    uint256 value
) external;
```

#### snap

Snap the expected value `yieldToken` to the current value.

`msg.sender` must be the admin or this call will revert with an {Unauthorized} error. `yieldToken` must be registered or this call will revert with a {UnsupportedToken} error.

This function should only be used in the event of a loss in the target yield-token. For example, say a third-party protocol experiences a fifty percent loss. The expected value (amount of underlying tokens) of the yield tokens being held by the system would be two times the real value that those yield tokens could be redeemed for. This function gives governance a way to realize those losses so that users can continue using the token as normal.

```
function snap(address yieldToken) external;
```

#### approveMint

Approve `spender` to mint `amount` debt tokens.

_**NOTE:**_ This function is WHITELISTED.
```
function approveMint(
    address spender,
    uint256 amount
) external;
```

#### approveWithdraw

Approve `spender` to withdraw `amount` shares of `yieldToken`.

_**NOTE:**_ This function is WHITELISTED.

```
function approveWithdraw(
    address spender,
    address yieldToken,
    uint256 shares
) external;
```

#### poke

Synchronizes the state of the account owned by `owner`.
```
function poke(address owner) external;
```

#### deposit

Deposit a yield token into a user's account.

An approval must be set for `yieldToken` which is greater than `amount`.

`yieldToken` must be registered or this call will revert with a {UnsupportedToken} error. `yieldToken` must be enabled or this call will revert with a {TokenDisabled} error. `yieldToken` underlying token must be enabled or this call will revert with a {TokenDisabled} error. `recipient` must be non-zero or this call will revert with an {IllegalArgument} error. `amount` must be greater than zero or the call will revert with an {IllegalArgument} error.

Emits a {Deposit} event.

_**NOTE:**_ This function is WHITELISTED.

_**NOTE:**_ When depositing, the `AlchemistV2` contract must have **allowance()** to spend funds on behalf of **msg.sender** for at least **amount** of the **yieldToken** being deposited. This can be done via the standard `ERC20.approve()` method.
```
function deposit(
    address yieldToken,
    uint256 amount,
    address recipient
) external returns (uint256);
```

#### depositUnderlying

Deposit an underlying token into the account of `recipient` as `yieldToken`.

An approval must be set for the underlying token of `yieldToken` which is greater than `amount`.

`yieldToken` must be registered or this call will revert with a {UnsupportedToken} error. `recipient` must be non-zero or this call will revert with an {IllegalArgument} error. `amount` must be greater than zero or the call will revert with an {IllegalArgument} error.

Emits a {Deposit} event.

_**NOTE:**_ This function is WHITELISTED. _**NOTE:**_ When depositing, the `AlchemistV2` contract must have **allowance()** to spend funds on behalf of **msg.sender** for at least **amount** of the **underlyingToken** being deposited. This can be done via the standard `ERC20.approve()` method.
```
function depositUnderlying(
    address yieldToken,
    uint256 amount,
    address recipient,
    uint256 minimumAmountOut
) external returns (uint256);
```

#### withdraw

Withdraw yield tokens to `recipient` by burning `share` shares. The number of yield tokens withdrawn to `recipient` will depend on the value of shares for that yield token at the time of the call.

`yieldToken` must be registered or this call will revert with a {UnsupportedToken} error. `recipient` must be non-zero or this call will revert with an {IllegalArgument} error.

Emits a {Withdraw} event.

_**NOTE:**_ This function is WHITELISTED.
```
function withdraw(
    address yieldToken,
    uint256 shares,
    address recipient
) external returns (uint256);
```

#### withdrawFrom

Withdraw yield tokens to `recipient` by burning `share` shares from the account of `owner`

`owner` must have an withdrawal allowance which is greater than `amount` for this call to succeed.

`yieldToken` must be registered or this call will revert with a {UnsupportedToken} error. `recipient` must be non-zero or this call will revert with an {IllegalArgument} error.

Emits a {Withdraw} event.

_**NOTE:**_ This function is WHITELISTED.

```
function withdrawFrom(
    address owner,
    address yieldToken,
    uint256 shares,
    address recipient
) external returns (uint256);
```

#### withdrawUnderlying

Withdraw underlying tokens to `recipient` by burning `share` shares and unwrapping the yield tokens that the shares were redeemed for.

`yieldToken` must be registered or this call will revert with a {UnsupportedToken} error. `recipient` must be non-zero or this call will revert with an {IllegalArgument} error. The loss in expected value of `yieldToken` must be less than the maximum permitted by the system or this call will revert with a {LossExceeded} error.

Emits a {Withdraw} event.

_**NOTE:**_ This function is WHITELISTED. _**NOTE:**_ The caller of `withdrawFrom()` must have **withdrawAllowance()** to withdraw funds on behalf of **owner** for at least the amount of `yieldTokens` that **shares** will be converted to. This can be done via the `approveWithdraw()` or `permitWithdraw()` methods.

```
function withdrawUnderlying(
    address yieldToken,
    uint256 shares,
    address recipient,
    uint256 minimumAmountOut
) external returns (uint256);
```

#### withdrawUnderlyingFrom

Withdraw underlying tokens to `recipient` by burning `share` shares from the account of `owner` and unwrapping the yield tokens that the shares were redeemed for.

`yieldToken` must be registered or this call will revert with a {UnsupportedToken} error. `recipient` must be non-zero or this call will revert with an {IllegalArgument} error. The loss in expected value of `yieldToken` must be less than the maximum permitted by the system or this call will revert with a {LossExceeded} error.

Emits a {Withdraw} event.

_**NOTE:**_ This function is WHITELISTED. _**NOTE:**_ The caller of `withdrawFrom()` must have **withdrawAllowance()** to withdraw funds on behalf of **owner** for at least the amount of `yieldTokens` that **shares** will be converted to. This can be done via the `approveWithdraw()` or `permitWithdraw()` methods.

```
function withdrawUnderlyingFrom(
    address owner,
    address yieldToken,
    uint256 shares,
    address recipient,
    uint256 minimumAmountOut
) external returns (uint256);
```

#### mint

Mint `amount` debt tokens.

`recipient` must be non-zero or this call will revert with an {IllegalArgument} error. `amount` must be greater than zero or this call will revert with a {IllegalArgument} error.

Emits a {Mint} event.

_**NOTE:**_ This function is WHITELISTED.

```
function mint(
    uint256 amount,
    address recipient
) external;
```

#### mintFrom

Mint `amount` debt tokens from the account owned by `owner` to `recipient`.

`recipient` must be non-zero or this call will revert with an {IllegalArgument} error. `amount` must be greater than zero or this call will revert with a {IllegalArgument} error.

Emits a {Mint} event.

_**NOTE:**_ This function is WHITELISTED. _**NOTE:**_ The caller of `mintFrom()` must have **mintAllowance()** to mint debt from the `Account` controlled by **owner** for at least the amount of **yieldTokens** that **shares** will be converted to. This can be done via the `approveMint()` or `permitMint()` methods.

```
function mintFrom(
    address owner,
    uint256 amount,
    address recipient
) external;
```

#### burn

Burn `amount` debt tokens to credit the account owned by `recipient`.

`amount` will be limited up to the amount of debt that `recipient` currently holds.

`recipient` must be non-zero or this call will revert with an {IllegalArgument} error. `amount` must be greater than zero or this call will revert with a {IllegalArgument} error. `recipient` must have non-zero debt or this call will revert with an {IllegalState} error.

Emits a {Burn} event.

_**NOTE:**_ This function is WHITELISTED.

```
function burn(
    uint256 amount,
    address recipient
) external returns (uint256);
```

#### repay

Repay `amount` debt using `underlyingToken` to credit the account owned by `recipient`.

`amount` will be limited up to the amount of debt that `recipient` currently holds.

`amount` must be greater than zero or this call will revert with a {IllegalArgument} error. `recipient` must be non-zero or this call will revert with an {IllegalArgument} error. `underlyingToken` must be enabled or this call will revert with a {TokenDisabled} error. `amount` must be less than or equal to the current available repay limit or this call will revert with a {ReplayLimitExceeded} error.

Emits a {Repay} event. _**NOTE:**_ This function is WHITELISTED.

```
function repay(
    address underlyingToken,
    uint256 amount,
    address recipient
) external returns (uint256);
```

#### liquidate

@notice

`shares` will be limited up to an equal amount of debt that `recipient` currently holds.

`shares` must be greater than zero or this call will revert with a {IllegalArgument} error. `yieldToken` must be registered or this call will revert with a {UnsupportedToken} error. `yieldToken` must be enabled or this call will revert with a {TokenDisabled} error. `yieldToken` underlying token must be enabled or this call will revert with a {TokenDisabled} error. The loss in expected value of `yieldToken` must be less than the maximum permitted by the system or this call will revert with a {LossExceeded} error. `amount` must be less than or equal to the current available liquidation limit or this call will revert with a {LiquidationLimitExceeded} error.

Emits a {Liquidate} event.

_**NOTE:**_ This function is WHITELISTED.

```
function liquidate(
    address yieldToken,
    uint256 shares,
    uint256 minimumAmountOut
) external returns (uint256);
```

#### donate

Burns `amount` debt tokens to credit accounts which have deposited `yieldToken`.

`amount` must be greater than zero or this call will revert with a {IllegalArgument} error. `yieldToken` must be registered or this call will revert with a {UnsupportedToken} error.

Emits a {Donate} event.

_**NOTE:**_ This function is WHITELISTED.

```
function donate(
    address yieldToken,
    uint256 amount
) external;
```

#### harvest

Harvests outstanding yield that a yield token has accumulated and distributes it as credit to holders.

`msg.sender` must be a keeper or this call will revert with an {Unauthorized} error. `yieldToken` must be registered or this call will revert with a {UnsupportedToken} error. The amount being harvested must be greater than zero or else this call will revert with an {IllegalState} error.

Emits a {Harvest} event.

```
function harvest(
    address yieldToken,
    uint256 minimumAmountOut
) external;
```

#### \_onlyAdmin

Checks that the `msg.sender` is the administrator.

`msg.sender` must be the administrator or this call will revert with an {Unauthorized} error.

```
function \_onlyAdmin() internal;
```

#### \_onlySentinelOrAdmin

Checks that the `msg.sender` is the administrator or a sentinel.

`msg.sender` must be either the administrator or a sentinel or this call will revert with an {Unauthorized} error.

```
function \_onlySentinelOrAdmin() internal;
```

#### \_onlyKeeper

Checks that the `msg.sender` is a keeper.

`msg.sender` must be a keeper or this call will revert with an {Unauthorized} error.

```
function \_onlyKeeper() internal;
```

#### \_preemptivelyHarvestDeposited

Preemptively harvests all of the yield tokens that have been deposited into an account.
```
function \_preemptivelyHarvestDeposited(address owner) internal;
```

#### \_preemptivelyHarvest

Preemptively harvests `yieldToken`.

This will earmark yield tokens to be harvested at a future time when the current value of the token is greater than the expected value. The purpose of this function is to synchronize the balance of the yield token which is held by users versus tokens which will be seized by the protocol.

```
function \_preemptivelyHarvest(address yieldToken) internal;
```

#### \_checkYieldTokenEnabled

Checks if a yield token is enabled.

```
function \_checkYieldTokenEnabled(address yieldToken) internal;
```

#### \_checkUnderlyingTokenEnabled

Checks if an underlying token is enabled.
```
function \_checkUnderlyingTokenEnabled(address underlyingToken internal;
```

#### \_checkSupportedYieldToken

Checks if an address is a supported yield token.

If the address is not a supported yield token, this function will revert using a {UnsupportedToken} error.

```
function \_checkSupportedYieldToken(address yieldToken) internal;
```

#### \_checkSupportedUnderlyingToken

Checks if an address is a supported underlying token.

If the address is not a supported yield token, this function will revert using a {UnsupportedToken} error.

```
function \_checkSupportedUnderlyingToken(address underlyingToken internal;
```

#### \_checkMintingLimit

Checks if `amount` of debt tokens can be minted.

`amount` must be less than the current minting limit or this call will revert with a {MintingLimitExceeded} error.
```
function \_checkMintingLimit(uint256 amount) internal;
```

#### \_checkLoss

Checks if the current loss of `yieldToken` has exceeded its maximum acceptable loss.

The loss that `yieldToken` has incurred must be less than its maximum accepted value or this call will revert with a {LossExceeded} error.
```
function \_checkLoss(address yieldToken) internal;
```

#### \_deposit

Deposits `amount` yield tokens into the account of `recipient`.

Emits a {Deposit} event.

```
function _deposit(
    address yieldToken,
    uint256 amount,
    address recipient
) internal returns (uint256);
```

#### \_withdraw

Withdraw `yieldToken` from the account owned by `owner` by burning shares and receiving yield tokens of equivalent value.

Emits a {Withdraw} event.

```
function _withdraw(
    address yieldToken,
    address owner,
    uint256 shares,
    address recipient
) internal returns (uint256);
```

#### \_mint

Mints debt tokens to `recipient` using the account owned by `owner`.

Emits a {Mint} event.

```
function _mint(
    address owner,
    uint256 amount,
    address recipient
) internal;
```

#### \_sync

Synchronizes the active balance and expected value of `yieldToken`.

```
function _sync(
    address yieldToken,
    uint256 amount,
    function (uint256,uint256) pure returns (uint256) operation
) internal;
```

#### \_loss

Gets the amount of loss that `yieldToken` has incurred measured in basis points. When the expected underlying value is less than the actual value, this will return zero.

```
function \_loss(address yieldToken) internal returns (uint256);
```

#### \_distributeCredit

Distributes `amount` credit to all depositors of `yieldToken`.
```
function _distributeCredit(
    address yieldToken,
    uint256 amount
) internal;
```

#### \_distributeUnlockedCreditDeposited

Distributes unlocked credit for all of the yield tokens that have been deposited into the account owned by `owner`.

```
function \_distributeUnlockedCreditDeposited(address owner) internal;
```

#### \_distributeUnlockedCredit

Distributes unlocked credit of `yieldToken` to all depositors.
```
function \_distributeUnlockedCredit(address yieldToken) internal;
```

  

#### \_wrap

Wraps `amount` of an underlying token into its `yieldToken`.

```
function _wrap(
    address yieldToken,
    uint256 amount,
    uint256 minimumAmountOut
) internal returns (uint256);
```

#### \_unwrap

Unwraps `amount` of `yieldToken` into its underlying token.
```
function _unwrap(
    address yieldToken,
    uint256 amount,
    address minimumAmountOut
) internal returns (uint256);
```

#### \_poke

Synchronizes the state for all of the tokens deposited in the account owned by `owner`.
```
function \_poke(address owner) internal;
```

#### \_poke

Synchronizes the state of `yieldToken` for the account owned by `owner`.

```
function _poke(
    address owner,
    address yieldToken
) internal;
```

#### \_updateDebt

Increases the debt by `amount` for the account owned by `owner`.
```
function _updateDebt(
    address owner,
    int256 amount
) internal;
```

#### \_approveMint

Set the mint allowance for `spender` to `amount` for the account owned by `owner`.
```
function _approveMint(
    address owner,
    address spender,
    uint256 amount
) internal;
```

#### \_decreaseMintAllowance

Decrease the mint allowance for `spender` by `amount` for the account owned by `owner`.
```
function _decreaseMintAllowance(
    address owner,
    address spender,
    uint256 amount
) internal;
```

#### \_approveWithdraw

Set the withdraw allowance of `yieldToken` for `spender` to `shares` for the account owned by `owner`.
```
function _approveWithdraw(
    address owner,
    address spender,
    address yieldToken,
    uint256 shares
) internal;
```

#### \_decreaseWithdrawAllowance

Decrease the withdraw allowance of `yieldToken` for `spender` by `amount` for the account owned by `owner`.
```
function _decreaseWithdrawAllowance(
    address owner,
    address spender,
    address yieldToken,
    uint256 amount
) internal;
```

#### \_validate

Checks that the account owned by `owner` is properly collateralized.

If the account is undercollateralized then this will revert with an {Undercollateralized} error.
```
function \_validate(address owner) internal;
```

#### \_totalValue

Gets the total value of the deposit collateral measured in debt tokens of the account owned by `owner`.

```
function \_totalValue(address owner) internal returns (uint256);
```
  

#### \_issueSharesForAmount

Issues shares of `yieldToken` for `amount` of its underlying token to `recipient`.

IMPORTANT: `amount` must never be 0.
```
function _issueSharesForAmount(
    address recipient,
    address yieldToken,
    uint256 amount
) internal returns (uint256);
```

#### \_burnShares

Burns `share` shares of `yieldToken` from the account owned by `owner`.
```
function _burnShares(
    address owner,
    address yieldToken,
    uint256 shares
) internal;
```

#### \_calculateUnrealizedDebt

Gets the amount of debt that the account owned by `owner` will have after an update occurs.

```
function \_calculateUnrealizedDebt(address owner) internal returns(int256);
```

  

#### \_calculateUnrealizedActiveBalance

Gets the virtual active balance of `yieldToken`.

The virtual active balance is the active balance minus any harvestable tokens which have yet to be realized.
```
function \_calculateUnrealizedActiveBalance(address yieldToken) internal returns (uint256);
```  

#### \_calculateUnlockedCredit

Calculates the amount of unlocked credit for `yieldToken` that is available for distribution.

```
function \_calculateUnlockedCredit(address yieldToken) internal returns (uint256);
```

  

#### \_convertYieldTokensToShares

Gets the amount of shares that `amount` of `yieldToken` is exchangeable for.

```
function _convertYieldTokensToShares(
    address yieldToken,
    uint256 amount
) internal returns (uint256);
```

#### \_convertSharesToYieldTokens

Gets the amount of yield tokens that `shares` shares of `yieldToken` is exchangeable for.

```
function _convertSharesToYieldTokens(
    address yieldToken,
    uint256 shares
) internal returns (uint256);
```
  

#### \_convertSharesToUnderlyingTokens

Gets the amount of underlying tokens that `shares` shares of `yieldToken` is exchangeable for.
```
function _convertSharesToUnderlyingTokens(
    address yieldToken,
    uint256 shares
) internal returns (uint256);
```

#### \_convertYieldTokensToUnderlying

Gets the amount of an underlying token that `amount` of `yieldToken` is exchangeable for.
```
function _convertYieldTokensToUnderlying(
    address yieldToken,
    uint256 amount
) internal returns (uint256);
```

#### \_convertUnderlyingTokensToYield

Gets the amount of `yieldToken` that `amount` of its underlying token is exchangeable for.
```
function _convertUnderlyingTokensToYield(
    address yieldToken,
    uint256 amount
) internal returns (uint256);
```

#### \_normalizeUnderlyingTokensToDebt

Normalize `amount` of `underlyingToken` to a value which is comparable to units of the debt token.
```
function _normalizeUnderlyingTokensToDebt(
    address underlyingToken,
    uint256 amount
) internal returns (uint256);
```

#### \_normalizeDebtTokensToUnderlying

Normalize `amount` of the debt token to a value which is comparable to units of `underlyingToken`.

This operation will result in truncation of some of the least significant digits of `amount`. This truncation amount will be the least significant N digits where N is the difference in decimals between the debt token and the underlying token.
```
function _normalizeDebtTokensToUnderlying(
    address underlyingToken,
    uint256 amount
) internal returns (uint256);
```

#### \_onlyWhitelisted

Checks the whitelist for msg.sender.

Reverts if msg.sender is not in the whitelist.

```
function \_onlyWhitelisted() internal;
```

#### \_checkArgument

Checks an expression and reverts with an {IllegalArgument} error if the expression is {false}.

```
function \_checkArgument(bool expression) internal;
```

#### \_checkState

Checks an expression and reverts with an {IllegalState} error if the expression is {false}.

```
function \_checkState(bool expression) internal;
```
