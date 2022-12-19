# AlchemicTokenV2

## Roles

- ADMIN
- SENTINEL

## Global Variables

The expected return value from a flash mint receiver
```
bytes32 public constant CALLBACK_SUCCESS = keccak256("ERC3156FlashBorrower.onFlashLoan");
```
The maximum number of basis points needed to represent 100%.
```
uint256 public constant BPS = 10000;
```
A set of addresses which are whitelisted for minting new tokens.
```
mapping(address => bool) public whitelisted;
```
A set of addresses which are paused from minting new tokens.
```
mapping(address => bool) public paused;
```
Fee for flash minting
```
uint256 public flashMintFee;
```
Max flash mint amount
```
uint256 public maxFlashLoanAmount;
```
## Functions

### setFlashFee

Sets the flash minting fee.
```
function setFlashFee(uint256 newFee) external;
```
### Params:
```
uint256 newFees: new flash loean fees.
```
### mint

Mints tokens to a recipient.
```
function mint(address recipient, uint256 amount) external
```
### Params:

- `address recipient:` recipient address.
- `uint256 amount:` amount to mint.

### setWhitelist

Sets `minter` as whitelisted to mint.
```
function setWhitelist(address minter, bool state) external
```
Params:
- `address minter:` minter address.
- `bool state:` state.

### setSentinel

Set sentinel address.
```
function setSentinel(address sentinel) external
```
#### Params:

- `address sentinel:` sentinel address.

### pauseMinter

Pauses minter from minting tokens.
```
function pauseMinter(address minter, bool state) external
```
#### Params:

- `address minter:` minter address.
- `bool state:` state.

### burn

Burns `amount` tokens from `msg.sender`.
```
function burn(uint256 amount) external
```
#### Params:

- `uint256 amount:`​ amount to burn.

### burnFrom

Destroys `amount` tokens from `account`, deducting from the caller's allowance.
```
function burnFrom(address account, uint256 amount) external
```

- `address account:` The address the burn tokens from.
- `uint256 amount:` The amount of tokens to burn.

### setMaxFlashLoan

Adjusts the maximum flashloan amount.
```
function setMaxFlashLoan(uint _maxFlashLoanAmount) external
```
#### Params:
```
uint256 _maxFlashLoanAmount: The maximum flashloan amount.
```
### maxFlashLoan

Gets the maximum amount to be flash loaned of a token.
```
function maxFlashLoan(address token) public view returns (uint256)
```
#### Params:

- `address token:` The address of the token.

### flashFee

Gets the flash loan fee of `amount` of `token`.

```
function flashFee(address token, uint256 amount) public view returns (uint256)
```

#### Params:

- `address token:` The address of the `token`.
- `uint256 amount:` The amount of `token` to flash mint.

#### Return:

- `uint256 flash fee`

### flashLoan

Performs a flash mint (called flash loan to confirm with ERC3156 standard).
```
function flashLoan(
    IERC3156FlashBorrower receiver,
    address token,
    uint256 amount,
    bytes calldata data
  ) external override nonReentrant returns (bool)
```
#### Params:

- `address receiver:` The address which will receive the flash minted tokens.
- `address token:` The address of the token to flash mint.
- `uint256 amount:` How much to flash mint.
- `bytes data:`s ABI encoded data to pass to the receiver.

