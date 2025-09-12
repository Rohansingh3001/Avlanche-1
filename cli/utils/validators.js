/**
 * Validation utilities for subnet configuration
 */

/**
 * Validate subnet name
 */
function validateSubnetName(input) {
    const name = input.trim();
    
    if (!name) {
        return 'Subnet name is required';
    }
    
    if (name.length < 3) {
        return 'Subnet name must be at least 3 characters long';
    }
    
    if (name.length > 50) {
        return 'Subnet name must be less than 50 characters';
    }
    
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
        return 'Subnet name can only contain letters, numbers, spaces, hyphens, and underscores';
    }
    
    // Reserved names
    const reservedNames = ['avalanche', 'subnet', 'mainnet', 'fuji', 'local', 'test'];
    if (reservedNames.includes(name.toLowerCase())) {
        return 'This name is reserved. Please choose a different name.';
    }
    
    return true;
}

/**
 * Validate chain ID
 */
function validateChainId(input) {
    const chainId = parseInt(input);
    
    if (isNaN(chainId)) {
        return 'Chain ID must be a number';
    }
    
    if (chainId < 1) {
        return 'Chain ID must be greater than 0';
    }
    
    if (chainId > 4294967295) { // 2^32 - 1
        return 'Chain ID must be less than 4294967295';
    }
    
    // Common chain IDs to avoid
    const reservedChainIds = [
        1,      // Ethereum Mainnet
        3,      // Ropsten
        4,      // Rinkeby
        5,      // Goerli
        42,     // Kovan
        56,     // BSC Mainnet
        97,     // BSC Testnet
        137,    // Polygon Mainnet
        80001,  // Polygon Mumbai
        43114,  // Avalanche C-Chain
        43113,  // Avalanche Fuji
        250,    // Fantom
        4002,   // Fantom Testnet
        1337,   // Local development (Ganache)
        31337   // Hardhat default
    ];
    
    if (reservedChainIds.includes(chainId)) {
        return `Chain ID ${chainId} is reserved for another network. Please choose a different ID.`;
    }
    
    return true;
}

/**
 * Validate network settings
 */
function validateNetworkSettings(config) {
    const errors = [];
    
    // Validate network ID
    if (!config.networkId || isNaN(config.networkId)) {
        errors.push('Network ID must be a valid number');
    }
    
    // Validate gas configuration
    if (config.enableGasFeatures) {
        if (config.gasLimit && (isNaN(config.gasLimit) || parseInt(config.gasLimit) < 8000000)) {
            errors.push('Gas limit must be at least 8,000,000');
        }
        
        if (config.targetBlockRate && (isNaN(config.targetBlockRate) || parseFloat(config.targetBlockRate) <= 0)) {
            errors.push('Target block rate must be greater than 0');
        }
    }
    
    return errors;
}

/**
 * Validate token configuration
 */
function validateTokenConfig(config) {
    const errors = [];
    
    if (!config.tokenName || config.tokenName.trim().length === 0) {
        errors.push('Token name is required');
    }
    
    if (config.tokenName && config.tokenName.length > 50) {
        errors.push('Token name must be less than 50 characters');
    }
    
    if (!config.tokenSymbol || config.tokenSymbol.trim().length === 0) {
        errors.push('Token symbol is required');
    }
    
    if (config.tokenSymbol && (config.tokenSymbol.length < 2 || config.tokenSymbol.length > 6)) {
        errors.push('Token symbol must be between 2 and 6 characters');
    }
    
    if (config.tokenSymbol && !/^[A-Z]+$/.test(config.tokenSymbol.toUpperCase())) {
        errors.push('Token symbol can only contain letters');
    }
    
    if (!config.initialSupply || isNaN(config.initialSupply) || parseFloat(config.initialSupply) <= 0) {
        errors.push('Initial supply must be a positive number');
    }
    
    if (config.initialSupply && parseFloat(config.initialSupply) > 1e12) {
        errors.push('Initial supply is too large (max 1 trillion)');
    }
    
    if (!config.decimals || isNaN(config.decimals) || parseInt(config.decimals) < 0 || parseInt(config.decimals) > 18) {
        errors.push('Decimals must be between 0 and 18');
    }
    
    return errors;
}

/**
 * Validate validator configuration
 */
function validateValidatorConfig(config) {
    const errors = [];
    
    const minValidators = parseInt(config.minValidators);
    const maxValidators = parseInt(config.maxValidators);
    const minStake = parseFloat(config.minStake);
    const maxStakeDuration = parseInt(config.maxStakeDuration);
    
    if (isNaN(minValidators) || minValidators < 1) {
        errors.push('Minimum validators must be at least 1');
    }
    
    if (isNaN(maxValidators) || maxValidators < 1) {
        errors.push('Maximum validators must be at least 1');
    }
    
    if (minValidators > maxValidators) {
        errors.push('Minimum validators cannot be greater than maximum validators');
    }
    
    if (maxValidators > 1000) {
        errors.push('Maximum validators cannot exceed 1000');
    }
    
    if (isNaN(minStake) || minStake < 1) {
        errors.push('Minimum stake must be at least 1 AVAX');
    }
    
    if (minStake > 10000000) {
        errors.push('Minimum stake is too high (max 10M AVAX)');
    }
    
    if (isNaN(maxStakeDuration) || maxStakeDuration < 86400) {
        errors.push('Maximum stake duration must be at least 1 day (86400 seconds)');
    }
    
    if (maxStakeDuration > 31536000) { // 1 year
        errors.push('Maximum stake duration cannot exceed 1 year');
    }
    
    return errors;
}

/**
 * Validate Ethereum address format
 */
function validateEthereumAddress(address) {
    if (!address) {
        return 'Address is required';
    }
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        return 'Invalid Ethereum address format';
    }
    
    return true;
}

/**
 * Validate private key format
 */
function validatePrivateKey(privateKey) {
    if (!privateKey) {
        return 'Private key is required';
    }
    
    // Remove 0x prefix if present
    const cleanKey = privateKey.replace(/^0x/, '');
    
    if (!/^[a-fA-F0-9]{64}$/.test(cleanKey)) {
        return 'Invalid private key format (must be 64 hex characters)';
    }
    
    return true;
}

/**
 * Validate deployment configuration
 */
function validateDeploymentConfig(config) {
    const errors = [];
    
    const validTargets = ['local', 'fuji', 'mainnet', 'config-only'];
    if (!validTargets.includes(config.deploymentTarget)) {
        errors.push('Invalid deployment target');
    }
    
    if (config.deploymentTarget === 'mainnet' && !config.confirmMainnet) {
        errors.push('Mainnet deployment requires explicit confirmation');
    }
    
    return errors;
}

/**
 * Comprehensive configuration validation
 */
function validateFullConfiguration(config) {
    let allErrors = [];
    
    // Validate each section
    allErrors = allErrors.concat(validateNetworkSettings(config.network));
    
    if (config.basic.vmType === 'SubnetEVM' && config.token) {
        allErrors = allErrors.concat(validateTokenConfig(config.token));
    }
    
    allErrors = allErrors.concat(validateValidatorConfig(config.validator));
    allErrors = allErrors.concat(validateDeploymentConfig(config.deployment));
    
    return allErrors;
}

module.exports = {
    validateSubnetName,
    validateChainId,
    validateNetworkSettings,
    validateTokenConfig,
    validateValidatorConfig,
    validateEthereumAddress,
    validatePrivateKey,
    validateDeploymentConfig,
    validateFullConfiguration
};
