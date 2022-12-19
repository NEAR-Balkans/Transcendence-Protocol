# TransmuterBuffer

## Roles

*   `ADMIN`
    
*   `KEEPER`
    

## Global Variables

Contract version

`string public constant override version = "2.1.0";`

The alchemist address.

`address public alchemist;`

The public transmuter address for each address.

`mapping(address => address) public transmuter;`

The flowRate for each address.

`mapping(address => uint256) public flowRate;`

The last update timestamp gor the flowRate for each address.

`mapping(address => uint256) public lastFlowrateUpdate;`

The amount of flow available per ERC20.

`mapping(address => uint256) public flowAvailable;`

The yieldTokens of each underlying supported by the Alchemist.

`mapping(address => address[]) public _yieldTokens;`

The total amount of an underlying token that has been exchanged into the transmuter, and has not been claimed.

`mapping(address => uint256) public currentExchanged;`

The underlying-tokens registered in the TransmuterBuffer.

`address[] public registeredUnderlyings;`

The debt-token used by the TransmuterBuffer.

`address public debtToken;`

A mapping of weighting schemas to be used in actions taken on the Alchemist (burn, deposit).

`mapping(address => Weighting) public weightings;`

A mapping of addresses to denote permissioned sources of funds

`mapping(address => bool) public sources;`

## Functions

#### getAvailableFlow

Allows to get the flow of an underlyingToken.

```
function getAvailableFlow(address underlyingToken) external view returns (uint256);
```

**Params:**

*   `underlyingToken`​underlying token
    

**Returns:**

*   uint256 underlying token flow.
    

#### getTotalCredit

Returns the debt balance of TransmuterBuffer contract.

```
function getTotalCredit() public view returns (uint256 credit);
```

**Returns:**

*   uin256 dept balance
    

#### getTotalUnderlyingBuffered

Returns the total underlying balance of TransmuterBuffer contract.

```
function getTotalUnderlyingBuffered(address underlyingToken) public view returns (uint256 totalBuffered);
```

**Params:**

*   `underlyingToken`​underlying token
    
**Returns:**

*   uint256 underlying token balance.
    
#### setWeights

```
function setWeights(address weightToken, address\[\] memory tokens, uint256\[\] memory weights) external;
```

**Params:**

*   `weightToken`​token address
    
*   `tokens` list of token addresses.
    
*   `weights`​ list of weights
    
#### setSource

```
function setSource(address source, bool flag) external
```

**Params:**

*   `source`​source address
    
*   `flag`​true/false
    

#### setTransmuter

Set underlying token and Transmuter pair addresses.

```
function setTransmuter(address underlyingToken, address newTransmuter) external
```

**Params:**

*   `transmuter`​transmuter address
 
#### setAlchemist

Set Alchemist address.

```
function setAlchemist(address \_alchemist) external
```

**Params:**

*   `alchemist`​alchemist address
    
#### registerAsset

Register new asset.

```
function registerAsset(address underlyingToken, address \_transmuter) external;
```

**Params:**

*   `underlyingToken`​underlying token
    
*   `transmuter`​transmuter address.
    
#### setFlowRate

Set the flow rate for a spécific underlying token.

```
function setFlowRate(address underlyingToken, uint256 \_flowRate)
```

**Params:**

*   `underlyingToken`​underlying token
    
*   `flowRate`​underlying token flow rate
    

#### onERC20Received

Implement IERC20TokenReceiver.

```
function onERC20Received(address underlyingToken, uint256 amount) external;
```

**Params:**

*   `underlyingToken`​underlying token
    
*   `amount`​amount received
    

#### exchange

Exchange debt token to underlying token.

```
function exchange(address underlyingToken) external;
```

**Params:**

*   `underlyingToken`​underlying token
    

#### withdraw

Withdraw amount of underlying token to a recipient address.

```
function withdraw(address underlyingToken, uint256 amount, address recipient) external;
```

**Params:**

*   `underlyingToken`​underlying token
    
*   `amount`​amount to withdraw
    
*   `recipient` recipient address
    

#### withdrawFromAlchemist

Withdraw amount of underlying token from Alchemist contract.

```
function withdrawFromAlchemist(address yieldToken, uint256 shares, uint256 minimumAmountOut) external;
```

**Params:**

*   `underlyingToken`​underlying token
    
**Returns:**

*   underlying token flow.
    
#### refreshStrategies

Sync strategies with Alchemist contract.

```
function refreshStrategies() public;
```

#### burnCredit

Mint debt token and donate the total balance.

```
function burnCredit() external
```

#### depositFunds

Deposit underlying token funds to Alchemist.

```
function depositFunds(address underlyingToken, uint256 amount) external;
```

**Params:**

*   `underlyingToken`​underlying token
    
*   `amount`​amount to withdraw
    

## Configuration

*   Deploy the contract
    
*   Call `setAlchemist`
    
*   Call `registerAsset`
    
*   Call `setFlowRate`
    

dqfs

*   Call `refreshStrategies`
    
*   Call `setWeight`
    

Example: [here](https://etherscan.io/txs?a=0x1EEd2DbeB9fc23Ab483F447F38F289cA15f79Bac)