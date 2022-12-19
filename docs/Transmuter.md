# Transmuter

`dept token:` wUSDC

`underlying token:` USDC


The `TransmuterV2` is the main contract in any Alchemix debt system that helps put upward pressure on the price of the debt-token relative to its collateral asset(s) by allowing any market participant to exchange the supported debt-token for underlying collateral at a 1:1 rate.

Each `TransmuterV2` supports a single `underlyingToken` as collateral, and is able to exchange `debtToken` for only that `underlyingToken`.

The `TransmuterV2` recieves `underlyingToken`s from the `AlchemistV2` whenever any of the `repay()`, `liquidate()`, or `harvest()` functions are called. The repaid, liquidated, or harvested collateral is first sent to the `TransmuterBuffer`, where excess funds that are not exchanged in the `TransmuterV2` can be deposited back into the `AlchemistV2` to boost yields for Alchemist depositors, or be deployed elsewhere to help maintain the peg.

When `debtToken`s are deposited into the `TransmuterV2`, a user recieves "exchanged tokens" into their account over time, representing the amount of `debtToken` that has been implicitly converted to `underlyingToken` that have dripped into the `TransmuterV2`. This rate of conversion is, at most, the rate that collateral is exchanged into the `TransmuterV2` multiplied by their overall percent stake of `debtTokens` in the `TransmuterV2`. While collateral recieved from `harvest()` calls has a relatively stable rate, collateral recieved from `repay()` and `liquidate()` functions are entirely user dependent, causing the overall transmutation rate to potentially fluctuate.

Additionally, there is a configurable **flow rate** in the `TransmuterBuffer` that can be used to control the flow of transmutable collateral. It acts as another cap on the speed at which funds are exchanged into the

![Untitled](https://1902439814-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2Fy4EjVVZX6rvJv8bLQAMh%2Fuploads%2Fgit-blob-711209141a84c63a7cbf301808ba453b35cd48fa%2Ftransmuter_buffer_flow_rate.png?alt=media)

  

# User Flow

![Untitled](https://res.cloudinary.com/almanac/image/upload/v1650379862/workspace_portal_uploads/w6njnrlrd9n2bhmzwacx.jpg)

  

# Global Variables

The identifier of the role which maintains other roles.

`bytes32 public constant ADMIN = keccak256("ADMIN");`

The identitifer of the sentinel role

`bytes32 public constant SENTINEL = keccak256("SENTINEL");`

The contract version.

`string public constant override version = "2.2.0";`

The synthetic token to be transmuted

`address public syntheticToken;`

The underlying token to be received

`address public override underlyingToken;`

The total amount of unexchanged tokens which are held by all accounts.

`uint256 public totalUnexchanged;`

The total amount of tokens which are in the auxiliary buffer.

`uint256 public totalBuffered;`

A mapping specifying all of the accounts.

`mapping(address => Account) private accounts;`

The tick buffer which stores all of the tick information along with the tick that is

currently being written to. The "current" tick is the tick at the buffer write position.

`Tick.Cache private ticks;`

The tick which has been satisfied up to, inclusive.

`uint256 private satisfiedTick;`

contract pause state

`bool public isPaused;`

The source of the exchanged collateral

`address public buffer;`

The address of the external whitelist contract.

`address public override whitelist;`

The amount of decimal places needed to normalize collateral to debtToken

`uint256 public override conversionFactor;`

  

# Structs

#### Account

```
struct Account {
    // The total number of unexchanged tokens that an account has deposited into the system
    uint256 unexchangedBalance;
    // The total number of exchanged tokens that an account has had credited
    uint256 exchangedBalance;
    // The tick that the account has had their deposit associated in
    uint256 occupiedTick;
}
```

#### UpdateAccountParams

```
struct UpdateAccountParams {
    // The owner address whose account will be modified
    address owner;
    // The amount to change the account's unexchanged balance by
    int256 unexchangedDelta;
    // The amount to change the account's exchanged balance by
    int256 exchangedDelta;
}
```

#### ExchangeCache

```
struct ExchangeCache {
    // The total number of unexchanged tokens that exist at the start of the exchange call
    uint256 totalUnexchanged;
    // The tick which has been satisfied up to at the start of the exchange call
    uint256 satisfiedTick;
    // The head of the active ticks queue at the start of the exchange call
    uint256 ticksHead;
}
```

#### ExchangeState

```
struct ExchangeState {
    // The position in the buffer of current tick which is being examined
    uint256 examineTick;
    // The total number of unexchanged tokens that currently exist in the system for the current distribution step
    uint256 totalUnexchanged;
    // The tick which has been satisfied up to, inclusive
    uint256 satisfiedTick;
    // The amount of tokens to distribute for the current step
    uint256 distributeAmount;
    // The accumulated weight to write at the new tick after the exchange is completed
    FixedPointMath.Number accumulatedWeight;
    // Reserved for the maximum weight of the current distribution step
    FixedPointMath.Number maximumWeight;
    // Reserved for the dusted weight of the current distribution step
    FixedPointMath.Number dustedWeight;
  }
```

#### UpdateAccountCache

```
struct UpdateAccountCache {
    // The total number of unexchanged tokens that the account held at the start of the update call
    uint256 unexchangedBalance;
    // The total number of exchanged tokens that the account held at the start of the update call
    uint256 exchangedBalance;
    // The tick that the account's deposit occupies at the start of the update call
    uint256 occupiedTick;
    // The total number of unexchanged tokens that exist at the start of the update call
    uint256 totalUnexchanged;
    // The current tick that is being written to
    uint256 currentTick;
  }
```

#### UpdateAccountState

```
struct UpdateAccountState {
    // The updated unexchanged balance of the account being updated
    uint256 unexchangedBalance;
    // The updated exchanged balance of the account being updated
    uint256 exchangedBalance;
    // The updated total unexchanged balance
    uint256 totalUnexchanged;
}
```

# Functions

### setCollateralSource

```
function setCollateralSource() external;
```

### setPause

```
function setPause() external;
```

### deposit

Deposits tokens to be exchanged into an account.

```
function deposit(uint256 amount, address owner) external;
```

`amount`The amount of tokens to deposit.

​`owner`The owner of the account to deposit the tokens into.

### withdraw

Withdraws tokens from the caller's account that were previously deposited to be exchanged.

```
function withdraw(uint256 amount,address recipient) external;
```

`amount`The amount of tokens to withdraw.

`recipient`The address which will receive the withdrawn tokens.

### claim

Claims exchanged tokens.

```
function claim(uint256 amount,address recipient) external;
```

`amount`The amount of tokens to claim.

`recipient`

address

The address which will receive the claimed tokens.

### exchange

Exchanges `amount` underlying tokens for `amount` synthetic tokens staked in the system. Can be called by TransmuterBuffer contract only.

```
function exchange(uint256 amount) external;
```

`amount`The amount of tokens to exchange.

#### getUnexchangedBalance

Gets the unexchanged balance of an account.

```
function getUnexchangedBalance(address owner) external returns (uint256 unexchangedBalance);
```

**Parms:**

*   `owner`The address of the account owner.

**Return:**

*   `unexchangedBalance` unexchanged balance.
    
#### getExchangedBalance

Gets the exchanged balance of an account, in units of `debtToken`.

```
function getExchangedBalance(address owner) external returns (uint256 exchangedBalance);
```

**Params:**

*   `owner`The address of the account owner.

**Return:**

*   `exchanged balance` exchanged balance
    
#### getClaimableBalance

The balance can be claimed.

```
function getClaimableBalance() external returns (uint256 claimableBalance);
```

**Return:**

*   `exchanged balance` exchanged balance