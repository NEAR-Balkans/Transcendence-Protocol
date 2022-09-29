pragma solidity ^0.8.11;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

import {TokenUtils, IERC20Minimal} from "../../libraries/TokenUtils.sol";

contract CTokenVaultMock is ERC20 {
    uint256 private constant MAXIMUM_SLIPPAGE = 10000;
    uint256 public constant PERCENT_RESOLUTION = 10000;

    address public token;
    uint256 public depositLimit;
    uint256 public forcedSlippage = 0;

    constructor(
        address _underlyingToken,
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) {
        token = _underlyingToken;
        depositLimit = type(uint256).max;
    }

    function balance() public view returns (uint256) {
        return IERC20Minimal(token).balanceOf(address(this));
    }

    function mint(uint256 _amount) public returns (uint256) {
        uint256 _pool = balance();
        uint256 _before = IERC20Minimal(token).balanceOf(address(this));
        // If _amount not specified, transfer the full token balance,
        // up to deposit limit
        if (_amount == type(uint256).max) {
            _amount = Math.min(depositLimit - balance(), IERC20Minimal(token).balanceOf(msg.sender));
        } else {
            require(balance() + _amount <= depositLimit, "deposit limit breached");
        }

        require(_amount > 0, "must deposit something");

        TokenUtils.safeTransferFrom(token, msg.sender, address(this), _amount);
        uint256 _after = IERC20Minimal(token).balanceOf(address(this));
        _amount = _after - _before; // Additional check for deflationary tokens
        uint256 _shares = 0;
        if (totalSupply() == 0) {
            _shares = _amount;
        } else {
            _shares = (_amount * totalSupply()) / _pool;
        }
        _mint(msg.sender, _shares);
        return _amount;
    }

    function redeem(
        uint256 _amount
    ) public returns (uint256) {
        // mirror real vault behavior
        if (_amount == type(uint256).max) {
            _amount = balanceOf(msg.sender);
        }
        uint256 _r = (balance() * _amount) / totalSupply();
        _burn(msg.sender, _amount);

        // apply mock slippage
        uint256 withdrawnAmt = _r - (_r * forcedSlippage) / PERCENT_RESOLUTION;
        require(withdrawnAmt >= _r - (_r * MAXIMUM_SLIPPAGE) / PERCENT_RESOLUTION, "too much slippage");
        TokenUtils.safeTransfer(token, msg.sender, _r);
        return _r;
    }

    function exchangeRateCurrent() external view returns (uint256) {
        uint256 _totalSupply = totalSupply();
        if (_totalSupply == 0) {
            return 0;
        } else {
            return (balance() * 1e18) / totalSupply();
        }
    }

    function exchangeRateStored() external view returns (uint256) {
        uint256 _totalSupply = totalSupply();
        if (_totalSupply == 0) {
            return 0;
        } else {
            return (balance() * 1e18) / totalSupply();
        }
    }
}
