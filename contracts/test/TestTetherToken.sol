// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.11;

import "../interfaces/IERC20Burnable.sol";
import "../interfaces/IERC20Mintable.sol";
import '../interfaces/external/tether/ITetherToken.sol';

contract TestTetherToken is ITetherToken, IERC20Mintable, IERC20Burnable {
    uint256 public basisPointsRate;
    uint256 public maximumFee;

    uint256 public override totalSupply;
    uint8 public decimals;
    mapping(address => uint256) public override balanceOf;
    mapping(address => mapping(address => uint256)) public override allowance;

    constructor(uint256 amountToMint, uint8 _decimals) {
        decimals = _decimals;
        mint(msg.sender, amountToMint);
    }

    function mint(address to, uint256 amount) public override returns (bool) {
        uint256 balanceNext = balanceOf[to] + amount;
        require(balanceNext >= amount, 'overflow balance');
        balanceOf[to] = balanceNext;
        totalSupply += amount;
        return true;
    }

    function transfer(address recipient, uint256 amount) public override returns (bool) {
        uint256 balanceBefore = balanceOf[msg.sender];
        require(balanceBefore >= amount, 'insufficient balance');
        balanceOf[msg.sender] = balanceBefore - amount;

        uint256 balanceRecipient = balanceOf[recipient];
        require(balanceRecipient + amount >= balanceRecipient, 'recipient balance overflow');
        balanceOf[recipient] = balanceRecipient + amount;

        emit Transfer(msg.sender, recipient, amount);
        return true;
    }

    function approve(address spender, uint256 amount) public override returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public override returns (bool) {
        uint256 allowanceBefore = allowance[sender][msg.sender];
        require(allowanceBefore >= amount, 'allowance insufficient');

        allowance[sender][msg.sender] = allowanceBefore - amount;

        uint256 fee = (amount * (basisPointsRate)) / (10000);
        if (fee > maximumFee) {
            fee = maximumFee;
        }

        amount -= fee;
        uint256 balanceRecipient = balanceOf[recipient];

        require(balanceRecipient + amount >= balanceRecipient, 'overflow balance recipient');
        balanceOf[recipient] = balanceRecipient + amount;
        uint256 balanceSender = balanceOf[sender];

        require(balanceSender >= amount, 'underflow balance sender');
        balanceOf[sender] = balanceSender - amount + fee;

        emit Transfer(sender, recipient, amount);
        return true;
    }

    function burnFrom(
        address owner,
        uint256 amount
    ) public override returns (bool) {
        uint256 allowanceBefore = allowance[owner][msg.sender];
        require(allowanceBefore >= amount, 'allowance insufficient');

        allowance[owner][msg.sender] = allowanceBefore - amount;

        uint256 balanceOwner = balanceOf[owner];
        require(balanceOwner >= amount, 'overflow balance recipient');
        balanceOf[owner] = balanceOwner - amount;
        totalSupply -= amount;

        emit Transfer(msg.sender, address(0), amount);
        return true;
    }

    function burn(uint256 amount) public override returns (bool) {
        uint256 balanceOwner = balanceOf[msg.sender];
        require(balanceOwner >= amount, 'overflow balance recipient');
        balanceOf[msg.sender] = balanceOwner - amount;
        totalSupply -= amount;

        emit Transfer(msg.sender, address(0), amount);
        return true;
    }

    function setParams(uint256 newBasisPoints, uint256 newMaxFee) external {
        require(newBasisPoints < 20);
        require(newMaxFee < 50);

        basisPointsRate = newBasisPoints;
        maximumFee = newMaxFee * (10**decimals);

        emit Params(basisPointsRate, maximumFee);
    }

    /// @notice Issue a new amount of tokens.
    /// These tokens are deposited into the owner address.
    /// @param amount Number of tokens to be issued.
    function issue(uint256 amount) external {
        mint(msg.sender, amount);
    }

    function deprecate(address _upgradedAddress) external {}
    function redeem(uint256 amount) external {}
    function name() external view returns (string memory) {
        return "Test Tether Token";
    }
    function symbol() external view returns (string memory) {
        return "TUSDT";
    }
}