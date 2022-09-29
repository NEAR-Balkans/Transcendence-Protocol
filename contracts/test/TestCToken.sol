// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.11;
import "../libraries/TokenUtils.sol";
import "../interfaces/IERC20Burnable.sol";

contract TestCToken is IERC20Burnable {
    address underlyingToken;

    uint8 public decimals;
    uint256 public override totalSupply;
    mapping(address => uint256) public override balanceOf;
    mapping(address => mapping(address => uint256)) public override allowance;

    constructor(uint256 amountToMint, uint8 _decimals, address _underlyingToken) {
        decimals = _decimals;
        mint(amountToMint);
        underlyingToken = _underlyingToken;
    }

    function mint(uint256 amount) public returns (bool) {
        TokenUtils.safeTransferFrom(underlyingToken, msg.sender, address(this), amount);
        uint256 balanceNext = balanceOf[msg.sender] + amount;
        require(balanceNext >= amount, 'overflow balance');
        balanceOf[msg.sender] = balanceNext;
        totalSupply += amount;
        return true;
    }

    function redeem(uint256 amount) public returns (uint256){
        burn(amount);
        TokenUtils.safeTransfer(underlyingToken, msg.sender, amount);
        return amount;
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

        uint256 balanceRecipient = balanceOf[recipient];

        require(balanceRecipient + amount >= balanceRecipient, 'overflow balance recipient');
        balanceOf[recipient] = balanceRecipient + amount;
        uint256 balanceSender = balanceOf[sender];

        require(balanceSender >= amount, 'underflow balance sender');
        balanceOf[sender] = balanceSender - amount;

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
}