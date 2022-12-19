## Deployment Steps

Here are the steps to deploy the Alchemix contracts

*   Step 1: Deploy `Whitelist` contract
    
*   Step 2: Deploy debt token contract `AlchemicTokenV2`
    
*   Step 3: Deploy `TransmuterBuffer` contract
    
*   Step 4: Deploy `CTokenAdapter` contract
    
*   Step 5: Deploy `TransmuterV2` contract
    
*   Step 6: Deploy `AlchemistV2` contract
    
*   Step 7: Whitelist `AlchemistV2` in the debt token contract
    

## Add a new underlying token

Here are the steps to add a new underlying token to the AlchemistV2 contract

*   Step 1: Create underlying token config object and fetch underlying token address
    ```
    const underlyingTokenConfig = {
        repayLimitMinimum: 1000000000000,
        repayLimitMaximum: 5000000000000,
        repayLimitBlocks: 300,
        liquidationLimitMinimum: 1000000000000,
        liquidationLimitMaximum: 5000000000000,
        liquidationLimitBlocks: 300
    };
    ```
    
*   Step 2: Add underlying token to AlchemistV2 contract
    
    ```
    function addUnderlyingToken(
        address underlyingToken,
        struct IAlchemistV2AdminActions.UnderlyingTokenConfig config
    ) external;
    ```
    
*   Step 3: Enable underlying token in AlchemistV2 contract
    ```
    function setUnderlyingTokenEnabled(
        address underlyingToken,
        bool enabled
    ) external;
    ```
    
*   Step 4: Deploy a new TransmuterV2 contract with the new underlying token
    
    ```
    function initialize(
        address _syntheticToken,
        address _underlyingToken,
        address _buffer,
        address _whitelist    
    ) external initializer {
    ```
    
*   Step 5: Set the new TransmuterV2 address in the TransmuterBuffer address
    ```
    function setTransmuter(address value) external;
    ```

## Add a new yield token

Here are the steps to add a new yield token to the AlchemistV2 contract

*   Step 1: Deploy a new TokenAdapter contract with the new yield and underlying token
    ```
    constructor(address _cToken, address _underlyingToken) {
        token = _cToken;
        underlyingToken = _underlyingToken;
    }
    ```
    
*   Step 2: Create the new yield token config object
    ```
    const yieldTokenConfig = {
      adapter: tokenAdapter.address,
      maximumLoss: 25,
      maximumExpectedValue: 50000000000,
      creditUnlockBlocks: 7200
    };
    ```
    
*   Step 3: Add the new yield token to the AlchemistV2 contract
    
    ```
    function addYieldToken(
        address yieldToken,
        struct IAlchemistV2AdminActions.YieldTokenConfig config
    ) external;
    ```
    
*   Step 4: Enable the new yield token in the AlchemistV2 contract
    
    ```
    function setYieldTokenEnabled(
        address yieldToken,
        bool enabled
    ) external;
    ```

## Configure TransmuterBuffer

*   Step 1: Call `setAlchemist`
    ```
    function setAlchemist (alchemistAddress);
    ```
  
*   Step 2: Call `registerAsset`
    ```
    function registerAsset(address underlyingToken, address _transmuter)
    ```

*   Step3: Call `setFlowRate`
    ```
    function setFlowRate(underlyingTokenAddress, 1000000)
    ```

*   Step4: Call `refreshStrategies`
    ```
    function refreshStrategies()
    ```

*   Step5: Call `setWeight`
    ```
    function setWeights(AlchemicTokenV2.address, [underlyingToken], [1])function setWeights(underlyingToken, [yieldToken], [1])
    ```

*   Step6: Call `setTransmuter`
    ```
    function setTransmuter(underlyingToken, TransmuterV2.address)
    ```

## Configure AlchemicTokenV2

*   Step1:
    ```
    function setWhitelist(address minter, bool state) external
    ```

*   Step2:
    ```
    setMaxFlashLoan(uint _maxFlashLoanAmount)
    ```
