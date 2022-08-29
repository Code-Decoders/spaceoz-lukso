// SPDX-License-Identifier: MIT
// Tells the Solidity compiler to compile only from v0.8.13 to v0.9.0
pragma solidity ^0.8.13;

import "@lukso/lsp-smart-contracts/contracts/LSP7DigitalAsset/LSP7DigitalAsset.sol";

// This is just a simple example of a coin-like contract.
// It is not ERC20 compatible and cannot be expected to talk to other
// coin/token contracts.

contract SpaceOzToken is LSP7DigitalAsset {
    constructor() LSP7DigitalAsset("SpaceOzToken", "SPT", msg.sender, true) {
        // Initialize the token-Metadata
        _mint(msg.sender, 1000000, true, "");
        _mint(
            address(0xA3B38051Bf77067fcCb02D83eCEF9CcE27c81A31),
            20000,
            true,
            ""
        );
    }

    function mint(address _to, uint256 _amount) public  {
        require(_to != address(0), "to address is invalid");
        require(_amount > 0, "amount is invalid");
        require(msg.sender == owner(), "only the owner can mint");
        _mint(_to, _amount, true, "");
    }

    function burnFrom(address _to, uint256 _amount) public {
        require(_to != address(0), "to address is invalid");
        require(_amount > 0, "amount is invalid");
        _updateOperator(_to, address(this), _amount);
        _updateOperator(_to, msg.sender, _amount);
        _burn(_to, _amount, "");
    }
}
