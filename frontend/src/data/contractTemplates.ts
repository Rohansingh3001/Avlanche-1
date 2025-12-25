export interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  category: 'Token' | 'NFT' | 'DeFi' | 'Governance' | 'Utility' | 'Game';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  code: string;
  constructorArgs?: Array<{
    name: string;
    type: string;
    description: string;
    placeholder?: string;
  }>;
}

export const contractTemplates: ContractTemplate[] = [
  {
    id: 'erc20-basic',
    name: 'Basic ERC-20 Token',
    description: 'A simple ERC-20 token implementation with basic functionality',
    category: 'Token',
    difficulty: 'Beginner',
    tags: ['ERC-20', 'Token', 'Basic'],
    constructorArgs: [
      { name: 'name', type: 'string', description: 'Token name', placeholder: 'My Token' },
      { name: 'symbol', type: 'string', description: 'Token symbol', placeholder: 'MTK' },
      { name: 'initialSupply', type: 'uint256', description: 'Initial token supply', placeholder: '1000000' },
    ],
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract BasicERC20 is IERC20 {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    
    uint256 private _totalSupply;
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    
    constructor(string memory _name, string memory _symbol, uint256 _initialSupply) {
        name = _name;
        symbol = _symbol;
        _totalSupply = _initialSupply * 10**decimals;
        _balances[msg.sender] = _totalSupply;
        emit Transfer(address(0), msg.sender, _totalSupply);
    }
    
    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }
    
    function balanceOf(address account) public view override returns (uint256) {
        return _balances[account];
    }
    
    function transfer(address recipient, uint256 amount) public override returns (bool) {
        require(recipient != address(0), "Transfer to zero address");
        require(_balances[msg.sender] >= amount, "Insufficient balance");
        
        _balances[msg.sender] -= amount;
        _balances[recipient] += amount;
        emit Transfer(msg.sender, recipient, amount);
        return true;
    }
    
    function allowance(address owner, address spender) public view override returns (uint256) {
        return _allowances[owner][spender];
    }
    
    function approve(address spender, uint256 amount) public override returns (bool) {
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
        require(recipient != address(0), "Transfer to zero address");
        require(_balances[sender] >= amount, "Insufficient balance");
        require(_allowances[sender][msg.sender] >= amount, "Insufficient allowance");
        
        _balances[sender] -= amount;
        _balances[recipient] += amount;
        _allowances[sender][msg.sender] -= amount;
        
        emit Transfer(sender, recipient, amount);
        return true;
    }
}`
  },
  
  {
    id: 'erc721-basic',
    name: 'Basic ERC-721 NFT',
    description: 'A simple NFT contract with minting functionality',
    category: 'NFT',
    difficulty: 'Intermediate',
    tags: ['ERC-721', 'NFT', 'Collectible'],
    constructorArgs: [
      { name: 'name', type: 'string', description: 'NFT collection name', placeholder: 'My NFT Collection' },
      { name: 'symbol', type: 'string', description: 'NFT collection symbol', placeholder: 'MNC' },
    ],
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC721 {
    function balanceOf(address owner) external view returns (uint256 balance);
    function ownerOf(uint256 tokenId) external view returns (address owner);
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external;
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function transferFrom(address from, address to, uint256 tokenId) external;
    function approve(address to, uint256 tokenId) external;
    function setApprovalForAll(address operator, bool approved) external;
    function getApproved(uint256 tokenId) external view returns (address operator);
    function isApprovedForAll(address owner, address operator) external view returns (bool);
    
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
}

contract BasicERC721 is IERC721 {
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;
    mapping(uint256 => string) private _tokenURIs;
    
    string public name;
    string public symbol;
    uint256 private _currentTokenId = 0;
    address public owner;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
        owner = msg.sender;
    }
    
    function balanceOf(address ownerAddr) public view override returns (uint256) {
        require(ownerAddr != address(0), "Query for zero address");
        return _balances[ownerAddr];
    }
    
    function ownerOf(uint256 tokenId) public view override returns (address) {
        address ownerAddr = _owners[tokenId];
        require(ownerAddr != address(0), "Token does not exist");
        return ownerAddr;
    }
    
    function mint(address to, string memory tokenURI) public onlyOwner returns (uint256) {
        require(to != address(0), "Mint to zero address");
        
        uint256 tokenId = _currentTokenId++;
        _owners[tokenId] = to;
        _balances[to] += 1;
        _tokenURIs[tokenId] = tokenURI;
        
        emit Transfer(address(0), to, tokenId);
        return tokenId;
    }
    
    function tokenURI(uint256 tokenId) public view returns (string memory) {
        require(_owners[tokenId] != address(0), "Token does not exist");
        return _tokenURIs[tokenId];
    }
    
    function approve(address to, uint256 tokenId) public override {
        address ownerAddr = ownerOf(tokenId);
        require(to != ownerAddr, "Approval to current owner");
        require(msg.sender == ownerAddr || isApprovedForAll(ownerAddr, msg.sender),
                "Approve caller is not owner nor approved for all");
        
        _tokenApprovals[tokenId] = to;
        emit Approval(ownerAddr, to, tokenId);
    }
    
    function getApproved(uint256 tokenId) public view override returns (address) {
        require(_owners[tokenId] != address(0), "Token does not exist");
        return _tokenApprovals[tokenId];
    }
    
    function setApprovalForAll(address operator, bool approved) public override {
        require(operator != msg.sender, "Approve to caller");
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }
    
    function isApprovedForAll(address ownerAddr, address operator) public view override returns (bool) {
        return _operatorApprovals[ownerAddr][operator];
    }
    
    function transferFrom(address from, address to, uint256 tokenId) public override {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Transfer caller is not owner nor approved");
        _transfer(from, to, tokenId);
    }
    
    function safeTransferFrom(address from, address to, uint256 tokenId) public override {
        safeTransferFrom(from, to, tokenId, "");
    }
    
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public override {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Transfer caller is not owner nor approved");
        _transfer(from, to, tokenId);
    }
    
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        require(_owners[tokenId] != address(0), "Token does not exist");
        address ownerAddr = ownerOf(tokenId);
        return (spender == ownerAddr || getApproved(tokenId) == spender || isApprovedForAll(ownerAddr, spender));
    }
    
    function _transfer(address from, address to, uint256 tokenId) internal {
        require(ownerOf(tokenId) == from, "Transfer from incorrect owner");
        require(to != address(0), "Transfer to zero address");
        
        // Clear approvals from the previous owner
        _tokenApprovals[tokenId] = address(0);
        
        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;
        
        emit Transfer(from, to, tokenId);
    }
}`
  },
  
  {
    id: 'multisig-wallet',
    name: 'Multi-Signature Wallet',
    description: 'A wallet that requires multiple signatures for transactions',
    category: 'Utility',
    difficulty: 'Advanced',
    tags: ['MultiSig', 'Wallet', 'Security'],
    constructorArgs: [
      { name: 'owners', type: 'address[]', description: 'Array of owner addresses', placeholder: '["0x...", "0x..."]' },
      { name: 'required', type: 'uint256', description: 'Required number of confirmations', placeholder: '2' },
    ],
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MultiSigWallet {
    event Deposit(address indexed sender, uint256 amount, uint256 balance);
    event SubmitTransaction(address indexed owner, uint256 indexed txIndex, address indexed to, uint256 value, bytes data);
    event ConfirmTransaction(address indexed owner, uint256 indexed txIndex);
    event RevokeConfirmation(address indexed owner, uint256 indexed txIndex);
    event ExecuteTransaction(address indexed owner, uint256 indexed txIndex);
    
    address[] public owners;
    mapping(address => bool) public isOwner;
    uint256 public numConfirmationsRequired;
    
    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 numConfirmations;
    }
    
    mapping(uint256 => mapping(address => bool)) public isConfirmed;
    Transaction[] public transactions;
    
    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not owner");
        _;
    }
    
    modifier txExists(uint256 _txIndex) {
        require(_txIndex < transactions.length, "Transaction does not exist");
        _;
    }
    
    modifier notExecuted(uint256 _txIndex) {
        require(!transactions[_txIndex].executed, "Transaction already executed");
        _;
    }
    
    modifier notConfirmed(uint256 _txIndex) {
        require(!isConfirmed[_txIndex][msg.sender], "Transaction already confirmed");
        _;
    }
    
    constructor(address[] memory _owners, uint256 _numConfirmationsRequired) {
        require(_owners.length > 0, "Owners required");
        require(_numConfirmationsRequired > 0 && _numConfirmationsRequired <= _owners.length,
                "Invalid number of required confirmations");
        
        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "Invalid owner");
            require(!isOwner[owner], "Owner not unique");
            
            isOwner[owner] = true;
            owners.push(owner);
        }
        
        numConfirmationsRequired = _numConfirmationsRequired;
    }
    
    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }
    
    function submitTransaction(address _to, uint256 _value, bytes memory _data) public onlyOwner {
        uint256 txIndex = transactions.length;
        
        transactions.push(Transaction({
            to: _to,
            value: _value,
            data: _data,
            executed: false,
            numConfirmations: 0
        }));
        
        emit SubmitTransaction(msg.sender, txIndex, _to, _value, _data);
    }
    
    function confirmTransaction(uint256 _txIndex) public onlyOwner txExists(_txIndex) notExecuted(_txIndex) notConfirmed(_txIndex) {
        Transaction storage transaction = transactions[_txIndex];
        transaction.numConfirmations += 1;
        isConfirmed[_txIndex][msg.sender] = true;
        
        emit ConfirmTransaction(msg.sender, _txIndex);
    }
    
    function executeTransaction(uint256 _txIndex) public onlyOwner txExists(_txIndex) notExecuted(_txIndex) {
        Transaction storage transaction = transactions[_txIndex];
        
        require(transaction.numConfirmations >= numConfirmationsRequired, "Cannot execute transaction");
        
        transaction.executed = true;
        
        (bool success, ) = transaction.to.call{value: transaction.value}(transaction.data);
        require(success, "Transaction failed");
        
        emit ExecuteTransaction(msg.sender, _txIndex);
    }
    
    function revokeConfirmation(uint256 _txIndex) public onlyOwner txExists(_txIndex) notExecuted(_txIndex) {
        Transaction storage transaction = transactions[_txIndex];
        
        require(isConfirmed[_txIndex][msg.sender], "Transaction not confirmed");
        
        transaction.numConfirmations -= 1;
        isConfirmed[_txIndex][msg.sender] = false;
        
        emit RevokeConfirmation(msg.sender, _txIndex);
    }
    
    function getOwners() public view returns (address[] memory) {
        return owners;
    }
    
    function getTransactionCount() public view returns (uint256) {
        return transactions.length;
    }
    
    function getTransaction(uint256 _txIndex) public view returns (
        address to,
        uint256 value,
        bytes memory data,
        bool executed,
        uint256 numConfirmations
    ) {
        Transaction storage transaction = transactions[_txIndex];
        
        return (
            transaction.to,
            transaction.value,
            transaction.data,
            transaction.executed,
            transaction.numConfirmations
        );
    }
}`
  },
  
  {
    id: 'simple-storage',
    name: 'Simple Storage',
    description: 'A basic contract for storing and retrieving data',
    category: 'Utility',
    difficulty: 'Beginner',
    tags: ['Storage', 'Basic', 'Learning'],
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleStorage {
    uint256 private storedData;
    address public owner;
    
    event ValueChanged(uint256 oldValue, uint256 newValue, address changedBy);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        storedData = 0;
    }
    
    function set(uint256 x) public onlyOwner {
        uint256 oldValue = storedData;
        storedData = x;
        emit ValueChanged(oldValue, x, msg.sender);
    }
    
    function get() public view returns (uint256) {
        return storedData;
    }
    
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        owner = newOwner;
    }
}`
  },
  
  {
    id: 'voting-contract',
    name: 'Simple Voting',
    description: 'A basic voting contract with proposals and voting functionality',
    category: 'Governance',
    difficulty: 'Intermediate',
    tags: ['Voting', 'Governance', 'DAO'],
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleVoting {
    struct Proposal {
        string description;
        uint256 voteCount;
        bool exists;
    }
    
    address public owner;
    mapping(uint256 => Proposal) public proposals;
    mapping(address => mapping(uint256 => bool)) public hasVoted;
    uint256 public proposalCount;
    
    event ProposalCreated(uint256 proposalId, string description);
    event VoteCast(address voter, uint256 proposalId);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier proposalExists(uint256 proposalId) {
        require(proposals[proposalId].exists, "Proposal does not exist");
        _;
    }
    
    modifier hasNotVoted(uint256 proposalId) {
        require(!hasVoted[msg.sender][proposalId], "Already voted on this proposal");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function createProposal(string memory description) public onlyOwner returns (uint256) {
        uint256 proposalId = proposalCount++;
        proposals[proposalId] = Proposal({
            description: description,
            voteCount: 0,
            exists: true
        });
        
        emit ProposalCreated(proposalId, description);
        return proposalId;
    }
    
    function vote(uint256 proposalId) public proposalExists(proposalId) hasNotVoted(proposalId) {
        proposals[proposalId].voteCount++;
        hasVoted[msg.sender][proposalId] = true;
        
        emit VoteCast(msg.sender, proposalId);
    }
    
    function getProposal(uint256 proposalId) public view proposalExists(proposalId) returns (
        string memory description,
        uint256 voteCount
    ) {
        Proposal memory proposal = proposals[proposalId];
        return (proposal.description, proposal.voteCount);
    }
    
    function getProposalCount() public view returns (uint256) {
        return proposalCount;
    }
}`
  }
];

export const getTemplatesByCategory = (category: string): ContractTemplate[] => {
  return contractTemplates.filter(template => template.category === category);
};

export const getTemplatesByDifficulty = (difficulty: string): ContractTemplate[] => {
  return contractTemplates.filter(template => template.difficulty === difficulty);
};

export const searchTemplates = (query: string): ContractTemplate[] => {
  const lowercaseQuery = query.toLowerCase();
  return contractTemplates.filter(template => 
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};