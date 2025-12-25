// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title SubnetERC20Token
 * @dev Implementation of a customizable ERC20 token for Avalanche subnets
 * 
 * Features:
 * - Standard ERC20 functionality
 * - Mintable (owner only)
 * - Burnable
 * - Pausable (owner only)
 * - Access control (Ownable)
 * - Reentrancy protection
 * - Custom metadata
 */
contract SubnetERC20Token is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ReentrancyGuard {
    
    // Token metadata
    uint8 private _decimals;
    string private _description;
    string private _website;
    string private _logoUrl;
    
    // Token economics
    uint256 private _maxSupply;
    bool private _mintingFinished;
    
    // Events
    event MintingFinished();
    event MetadataUpdated(string description, string website, string logoUrl);
    event MaxSupplyUpdated(uint256 newMaxSupply);
    
    /**
     * @dev Constructor that gives msg.sender all of existing tokens.
     * @param name_ The name of the token
     * @param symbol_ The symbol of the token
     * @param decimals_ The number of decimals for the token
     * @param initialSupply_ The initial supply of tokens
     * @param maxSupply_ The maximum supply of tokens (0 = unlimited)
     * @param description_ Description of the token
     * @param website_ Website URL
     * @param logoUrl_ Logo URL
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply_,
        uint256 maxSupply_,
        string memory description_,
        string memory website_,
        string memory logoUrl_
    ) ERC20(name_, symbol_) {
        require(bytes(name_).length > 0, "Name cannot be empty");
        require(bytes(symbol_).length > 0, "Symbol cannot be empty");
        require(decimals_ <= 18, "Decimals cannot exceed 18");
        
        _decimals = decimals_;
        _description = description_;
        _website = website_;
        _logoUrl = logoUrl_;
        _maxSupply = maxSupply_;
        _mintingFinished = false;
        
        if (initialSupply_ > 0) {
            require(maxSupply_ == 0 || initialSupply_ <= maxSupply_, "Initial supply exceeds max supply");
            _mint(msg.sender, initialSupply_ * 10**decimals_);
        }
    }
    
    /**
     * @dev Returns the number of decimals used to get its user representation.
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    /**
     * @dev Returns the description of the token.
     */
    function description() public view returns (string memory) {
        return _description;
    }
    
    /**
     * @dev Returns the website URL of the token.
     */
    function website() public view returns (string memory) {
        return _website;
    }
    
    /**
     * @dev Returns the logo URL of the token.
     */
    function logoUrl() public view returns (string memory) {
        return _logoUrl;
    }
    
    /**
     * @dev Returns the maximum supply of the token.
     */
    function maxSupply() public view returns (uint256) {
        return _maxSupply;
    }
    
    /**
     * @dev Returns whether minting is finished.
     */
    function mintingFinished() public view returns (bool) {
        return _mintingFinished;
    }
    
    /**
     * @dev Creates `amount` new tokens for `to`.
     * 
     * Requirements:
     * - the caller must be the owner.
     * - minting must not be finished.
     * - total supply after minting must not exceed max supply.
     */
    function mint(address to, uint256 amount) public onlyOwner {
        require(!_mintingFinished, "Minting is finished");
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        
        if (_maxSupply > 0) {
            require(totalSupply() + amount <= _maxSupply, "Would exceed max supply");
        }
        
        _mint(to, amount);
    }
    
    /**
     * @dev Finishes minting. This is irreversible.
     * 
     * Requirements:
     * - the caller must be the owner.
     */
    function finishMinting() public onlyOwner {
        require(!_mintingFinished, "Minting already finished");
        _mintingFinished = true;
        emit MintingFinished();
    }
    
    /**
     * @dev Updates token metadata.
     * 
     * Requirements:
     * - the caller must be the owner.
     */
    function updateMetadata(
        string memory description_,
        string memory website_,
        string memory logoUrl_
    ) public onlyOwner {
        _description = description_;
        _website = website_;
        _logoUrl = logoUrl_;
        
        emit MetadataUpdated(description_, website_, logoUrl_);
    }
    
    /**
     * @dev Updates the maximum supply. Can only be increased if minting is not finished.
     * 
     * Requirements:
     * - the caller must be the owner.
     * - new max supply must be greater than current total supply.
     */
    function updateMaxSupply(uint256 newMaxSupply) public onlyOwner {
        require(newMaxSupply >= totalSupply(), "New max supply must be >= current total supply");
        
        if (_mintingFinished) {
            require(newMaxSupply >= _maxSupply, "Cannot decrease max supply after minting finished");
        }
        
        _maxSupply = newMaxSupply;
        emit MaxSupplyUpdated(newMaxSupply);
    }
    
    /**
     * @dev Pauses all token transfers.
     * 
     * Requirements:
     * - the caller must be the owner.
     */
    function pause() public onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpauses all token transfers.
     * 
     * Requirements:
     * - the caller must be the owner.
     */
    function unpause() public onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Batch transfer tokens to multiple recipients.
     * 
     * Requirements:
     * - recipients and amounts arrays must have the same length.
     * - caller must have sufficient balance.
     */
    function batchTransfer(
        address[] memory recipients,
        uint256[] memory amounts
    ) public nonReentrant whenNotPaused {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        require(recipients.length <= 100, "Too many recipients"); // Gas limit protection
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        require(balanceOf(msg.sender) >= totalAmount, "Insufficient balance for batch transfer");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Cannot transfer to zero address");
            require(amounts[i] > 0, "Amount must be greater than 0");
            _transfer(msg.sender, recipients[i], amounts[i]);
        }
    }
    
    /**
     * @dev Returns token information in a single call.
     */
    function getTokenInfo() public view returns (
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 totalSupply_,
        uint256 maxSupply_,
        bool mintingFinished_,
        bool paused_,
        string memory description_,
        string memory website_,
        string memory logoUrl_
    ) {
        return (
            name(),
            symbol(),
            decimals(),
            totalSupply(),
            _maxSupply,
            _mintingFinished,
            paused(),
            _description,
            _website,
            _logoUrl
        );
    }
    
    /**
     * @dev Emergency withdrawal function for any ERC20 tokens sent to this contract.
     * 
     * Requirements:
     * - the caller must be the owner.
     */
    function emergencyWithdraw(address token, uint256 amount) public onlyOwner {
        if (token == address(0)) {
            // Withdraw ETH/AVAX
            payable(owner()).transfer(amount);
        } else {
            // Withdraw ERC20 tokens
            IERC20(token).transfer(owner(), amount);
        }
    }
    
    /**
     * @dev Hook that is called before any transfer of tokens.
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Pausable) {
        super._beforeTokenTransfer(from, to, amount);
    }
    
    /**
     * @dev Fallback function to receive ETH/AVAX.
     */
    receive() external payable {
        // Allow contract to receive native tokens
    }
}
