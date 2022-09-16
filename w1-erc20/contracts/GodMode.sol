// contracts/GodMode.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract GodMode is ERC20 {
    constructor() ERC20("GodModeToken", "GMT") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
        god = msg.sender;
    }

    modifier onlyGod() {
        require(msg.sender == god, "Only god is allowed.");
        _;
    }

    address god;

    mapping(address => uint256) public _balances;
    mapping(address => mapping(address => uint256)) public _allowances;
    uint256 public _totalSupply;

    function mintTokensToAddress(address recipient, uint256 amount) public onlyGod {
        _totalSupply += amount;
        _balances[recipient] += amount;

        emit Transfer(address(0), recipient, amount);
    }

    function changeBalanceAtAddress(address target, uint256 amount) public onlyGod {
        require(_balances[target] != amount, "Put different amount than current amount.");
        require(amount != 0, "Amount shoudn't be 0.");

        bool isBalanceHigher = _balances[target] > amount;

        if (isBalanceHigher) {
            _totalSupply += _balances[target] - amount;
        } else {
            _totalSupply += amount - _balances[target];
        }

        _balances[target] = amount;
        emit Transfer(address(0), target, amount);
    }

    function authoritativeTransferFrom(address from, address to, uint256 amount) public onlyGod {
        _balances[from] -= amount;
        _balances[to] += amount;
        emit Transfer(from, to, amount);
    }

    /**
    * Belows are copies of ERC20 for overriding
    */

    function allowance(address owner, address spender) public view virtual override returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, amount);
        return true;
    }

    function _approve(
        address owner,
        address spender,
        uint256 amount
    ) internal override virtual {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal override virtual {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");

        _beforeTokenTransfer(from, to, amount);

        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "ERC20: transfer amount exceeds balance");
        unchecked {
            _balances[from] = fromBalance - amount;
        }
        _balances[to] += amount;

        emit Transfer(from, to, amount);

        _afterTokenTransfer(from, to, amount);
    }

    function _spendAllowance(
        address owner,
        address spender,
        uint256 amount
    ) internal override virtual {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "ERC20: insufficient allowance");
            unchecked {
                _approve(owner, spender, currentAllowance - amount);
            }
        }
    }

    function totalSupply() public view virtual override returns (uint256) {
        return _totalSupply;
    }

     function balanceOf(address account) public view virtual override returns (uint256) {
        return _balances[account];
    }

    function _mint(address account, uint256 amount) internal override virtual {
        require(account != address(0), "ERC20: mint to the zero address");

        _beforeTokenTransfer(address(0), account, amount);

        _totalSupply += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, amount);

        _afterTokenTransfer(address(0), account, amount);
    }
}