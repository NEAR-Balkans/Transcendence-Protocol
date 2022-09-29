// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.11;

import "./CTokenVaultMock.sol";

/// @title ERC20Mock
///
/// @dev A mock of an ERC20 token which lets anyone burn and mint tokens.
contract MockYieldToken is CTokenVaultMock {
  uint8 public _decimals;

  constructor(
    address underlyingToken,
    string memory name,
    string memory symbol,
    uint8 decimals
  ) CTokenVaultMock(underlyingToken, name, symbol) {
    _decimals = decimals;
  }

  function decimals() public view override returns (uint8) {
    return _decimals;
  }
}
