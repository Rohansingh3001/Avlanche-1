/**
 * Avalanche L2 Smart Contract Examples
 * Ready-to-deploy contracts optimized for Avalanche L2 networks
 */

export const AVALANCHE_L2_CONTRACT_TEMPLATES = {
  // ERC-20 Token optimized for L2
  erc20Token: {
    name: 'ERC-20 Token (L2 Optimized)',
    description: 'Standard ERC-20 token with gas optimizations for Avalanche L2',
    category: 'tokens',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ERC20 Token optimized for Avalanche L2
 * @dev Gas-optimized implementation with batch operations
 */
contract AvaxL2Token {
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply
    ) {
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply * 10**decimals;
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }
    
    function transfer(address to, uint256 value) external returns (bool) {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }
    
    function approve(address spender, uint256 value) external returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        require(balanceOf[from] >= value, "Insufficient balance");
        require(allowance[from][msg.sender] >= value, "Insufficient allowance");
        
        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;
        
        emit Transfer(from, to, value);
        return true;
    }
    
    // L2 optimization: Batch transfers to save gas
    function batchTransfer(address[] calldata recipients, uint256[] calldata amounts) external {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        require(balanceOf[msg.sender] >= totalAmount, "Insufficient balance");
        balanceOf[msg.sender] -= totalAmount;
        
        for (uint256 i = 0; i < recipients.length; i++) {
            balanceOf[recipients[i]] += amounts[i];
            emit Transfer(msg.sender, recipients[i], amounts[i]);
        }
    }
}`,
    constructorArgs: ['MyToken', 'MTK', '1000000']
  },

  // NFT Collection for L2
  nftCollection: {
    name: 'NFT Collection (L2)',
    description: 'ERC-721 NFT collection optimized for Avalanche L2 with batch minting',
    category: 'nfts',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title L2 Optimized NFT Collection
 * @dev ERC-721 with batch operations and reduced gas costs
 */
contract AvaxL2NFT {
    string public name;
    string public symbol;
    uint256 public nextTokenId = 1;
    string private baseURI;
    
    mapping(uint256 => address) public ownerOf;
    mapping(address => uint256) public balanceOf;
    mapping(uint256 => address) public getApproved;
    mapping(address => mapping(address => bool)) public isApprovedForAll;
    
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _baseURI
    ) {
        name = _name;
        symbol = _symbol;
        baseURI = _baseURI;
    }
    
    function mint(address to) external returns (uint256) {
        uint256 tokenId = nextTokenId++;
        ownerOf[tokenId] = to;
        balanceOf[to]++;
        emit Transfer(address(0), to, tokenId);
        return tokenId;
    }
    
    // L2 optimization: Batch mint
    function batchMint(address to, uint256 quantity) external {
        uint256 startTokenId = nextTokenId;
        nextTokenId += quantity;
        balanceOf[to] += quantity;
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = startTokenId + i;
            ownerOf[tokenId] = to;
            emit Transfer(address(0), to, tokenId);
        }
    }
    
    function approve(address spender, uint256 tokenId) external {
        address owner = ownerOf[tokenId];
        require(msg.sender == owner || isApprovedForAll[owner][msg.sender], "Not authorized");
        getApproved[tokenId] = spender;
        emit Approval(owner, spender, tokenId);
    }
    
    function setApprovalForAll(address operator, bool approved) external {
        isApprovedForAll[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }
    
    function transferFrom(address from, address to, uint256 tokenId) external {
        require(ownerOf[tokenId] == from, "Invalid owner");
        require(
            msg.sender == from || 
            getApproved[tokenId] == msg.sender || 
            isApprovedForAll[from][msg.sender],
            "Not authorized"
        );
        
        delete getApproved[tokenId];
        balanceOf[from]--;
        balanceOf[to]++;
        ownerOf[tokenId] = to;
        
        emit Transfer(from, to, tokenId);
    }
    
    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(ownerOf[tokenId] != address(0), "Token doesn't exist");
        return string(abi.encodePacked(baseURI, _toString(tokenId)));
    }
    
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}`,
    constructorArgs: ['MyNFT', 'MNFT', 'https://api.mynft.com/metadata/']
  },

  // DeFi Staking Contract for L2
  stakingContract: {
    name: 'Staking Contract (L2)',
    description: 'Token staking contract with rewards, optimized for L2',
    category: 'defi',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title L2 Optimized Staking Contract
 * @dev Stake tokens and earn rewards with minimal gas costs
 */
contract AvaxL2Staking {
    address public stakingToken;
    address public rewardToken;
    uint256 public rewardRate = 100; // tokens per block
    uint256 public lastUpdateBlock;
    uint256 public rewardPerTokenStored;
    
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;
    mapping(address => uint256) public balanceOf;
    uint256 public totalSupply;
    
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    
    constructor(address _stakingToken, address _rewardToken) {
        stakingToken = _stakingToken;
        rewardToken = _rewardToken;
        lastUpdateBlock = block.number;
    }
    
    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateBlock = block.number;
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }
    
    function rewardPerToken() public view returns (uint256) {
        if (totalSupply == 0) return rewardPerTokenStored;
        return rewardPerTokenStored + 
            (((block.number - lastUpdateBlock) * rewardRate * 1e18) / totalSupply);
    }
    
    function earned(address account) public view returns (uint256) {
        return (balanceOf[account] * 
            (rewardPerToken() - userRewardPerTokenPaid[account])) / 1e18 + 
            rewards[account];
    }
    
    function stake(uint256 amount) external updateReward(msg.sender) {
        require(amount > 0, "Cannot stake 0");
        totalSupply += amount;
        balanceOf[msg.sender] += amount;
        
        // Transfer tokens from user
        (bool success, ) = stakingToken.call(
            abi.encodeWithSignature("transferFrom(address,address,uint256)", 
            msg.sender, address(this), amount)
        );
        require(success, "Transfer failed");
        
        emit Staked(msg.sender, amount);
    }
    
    function withdraw(uint256 amount) external updateReward(msg.sender) {
        require(amount > 0, "Cannot withdraw 0");
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        
        totalSupply -= amount;
        balanceOf[msg.sender] -= amount;
        
        (bool success, ) = stakingToken.call(
            abi.encodeWithSignature("transfer(address,uint256)", msg.sender, amount)
        );
        require(success, "Transfer failed");
        
        emit Withdrawn(msg.sender, amount);
    }
    
    function getReward() external updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            (bool success, ) = rewardToken.call(
                abi.encodeWithSignature("transfer(address,uint256)", msg.sender, reward)
            );
            require(success, "Reward transfer failed");
            emit RewardPaid(msg.sender, reward);
        }
    }
    
    function exit() external {
        withdraw(balanceOf[msg.sender]);
        getReward();
    }
}`,
    constructorArgs: ['0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000']
  }
};

// Gas optimization tips for L2 deployment
export const L2_DEPLOYMENT_TIPS = [
  {
    title: 'Use Batch Operations',
    description: 'Implement batch functions to reduce transaction overhead',
    impact: 'Up to 60% gas savings for multiple operations'
  },
  {
    title: 'Optimize Storage Layout',
    description: 'Pack struct variables to minimize storage slots',
    impact: 'Significant gas savings on state changes'
  },
  {
    title: 'Minimize External Calls', 
    description: 'Reduce calls to other contracts when possible',
    impact: 'Lower cross-contract interaction costs'
  },
  {
    title: 'Use Events for Data',
    description: 'Store non-critical data in events rather than state',
    impact: 'Much cheaper than storage for historical data'
  }
];