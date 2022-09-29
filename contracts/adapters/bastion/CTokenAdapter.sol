// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.8.11;

import "../../libraries/TokenUtils.sol";
import "../../interfaces/ITokenAdapter.sol";
import {IllegalState} from "../../base/Errors.sol";
import "../../interfaces/external/bastion/ICErc20.sol";

/// @title  CTokenAdapter
/// @author Alchemix Finance
contract CTokenAdapter is ITokenAdapter {
    string public constant override version = "2.1.0";

    address public immutable override token;
    address public immutable override underlyingToken;

    constructor(address _cToken, address _underlyingToken) {
        token = _cToken;
        underlyingToken = _underlyingToken;
    }

    /// @inheritdoc ITokenAdapter
    function price() external view override returns (uint256) {
        return ICErc20(token).exchangeRateStored() / 10**10;
    }

    /// @inheritdoc ITokenAdapter
    function wrap(uint256 amount, address recipient) external override returns (uint256) {
        uint256 underlyingTokenBalanceBefore =  TokenUtils.safeBalanceOf(underlyingToken, address(this));
        TokenUtils.safeTransferFrom(underlyingToken, msg.sender, address(this), amount);
        uint256 underlyingTokenBalanceAfter =  TokenUtils.safeBalanceOf(underlyingToken, address(this));
        amount = underlyingTokenBalanceAfter - underlyingTokenBalanceBefore;

        TokenUtils.safeApprove(underlyingToken, token, amount);
        uint256 balanceBeforeMint = TokenUtils.safeBalanceOf(token, address(this));
        ICErc20(token).mint(amount);

        uint256 balanceAfterMint = TokenUtils.safeBalanceOf(token, address(this));
        uint256 mintedAmount = balanceAfterMint - balanceBeforeMint;
        TokenUtils.safeTransfer(token, recipient, mintedAmount);
        return mintedAmount;
    }

    /// @inheritdoc ITokenAdapter
    function unwrap(uint256 amount, address recipient) external override returns (uint256) {
        TokenUtils.safeTransferFrom(token, msg.sender, address(this), amount);

        uint256 cTokenBalanceBefore = TokenUtils.safeBalanceOf(token, address(this));
        uint256 underlyingTokenBalanceBefore = TokenUtils.safeBalanceOf(underlyingToken, address(this));
        ICErc20(token).redeem(amount);
        uint256 cTokenBalanceAfter = TokenUtils.safeBalanceOf(token, address(this));
        uint256 underlyingTokenBalanceAfter = TokenUtils.safeBalanceOf(underlyingToken, address(this));

        // This is done to protect the system by ensuing that all the tokens are burn during withrawal
        if (cTokenBalanceBefore - cTokenBalanceAfter != amount) {
            revert IllegalState();
        }

        uint256 recipientAmount = underlyingTokenBalanceAfter - underlyingTokenBalanceBefore;
        TokenUtils.safeTransfer(underlyingToken, recipient, recipientAmount);

        return recipientAmount;
    }
}