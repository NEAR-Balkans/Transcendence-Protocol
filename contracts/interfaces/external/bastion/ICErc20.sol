pragma solidity ^0.8.11;

interface ICErc20 {
    function mint(uint256) external returns (uint256);

    function exchangeRateStored() external view returns (uint256);

    function supplyRatePerBlock() external returns (uint256);

    function redeem(uint) external returns (uint);

    function redeemUnderlying(uint) external returns (uint);
}