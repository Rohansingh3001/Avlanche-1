# CLI Examples

This directory contains example configuration files for various subnet types and use cases.

## Available Examples

### 1. DeFi Trading Subnet (`defi-subnet.json`)
**Use Case**: High-performance subnet for DeFi trading applications
- **VM Type**: SubnetEVM (Ethereum Compatible)
- **Chain ID**: 98765
- **Features**: 
  - Multiple validators for redundancy
  - Optimized gas configuration for trading
  - Pre-funded accounts for testing
  - Advanced fee configuration

**Deploy**:
```bash
subnet-wizard deploy --config examples/defi-subnet.json
```

### 2. Gaming & NFT Subnet (`gaming-subnet.json`)
**Use Case**: Subnet optimized for gaming and NFT applications
- **VM Type**: SubnetEVM
- **Chain ID**: 55555
- **Features**:
  - Contract deployer allow list for controlled deployment
  - Gaming-optimized gas settings
  - NFT-friendly configuration
  - Higher gas limits for complex transactions

**Deploy**:
```bash
subnet-wizard deploy --config examples/gaming-subnet.json
```

### 3. SpacesVM Storage Subnet (`spacesvm-subnet.json`)
**Use Case**: Decentralized key-value storage
- **VM Type**: SpacesVM
- **Chain ID**: 33333
- **Features**:
  - Key-value store functionality
  - Configurable storage costs
  - Simple API for data operations
  - Efficient for storage applications

**Deploy**:
```bash
subnet-wizard deploy --config examples/spacesvm-subnet.json
```

## Usage Instructions

### 1. Quick Deploy
Use any example configuration directly:

```bash
# Navigate to CLI directory
cd cli

# Deploy example subnet
subnet-wizard deploy --config examples/defi-subnet.json
```

### 2. Customize Configuration
Copy and modify an example:

```bash
# Copy example
cp examples/defi-subnet.json my-custom-subnet.json

# Edit configuration
# ... modify chain ID, validators, allocations, etc ...

# Deploy custom subnet
subnet-wizard deploy --config my-custom-subnet.json
```

### 3. Generate Template
Create a new template based on VM type:

```bash
# Generate EVM template
subnet-wizard config template --vm evm --output my-evm-subnet.json

# Generate SpacesVM template
subnet-wizard config template --vm spacesvm --output my-spaces-subnet.json
```

## Configuration Sections

### Basic Information
```json
{
  "subnetName": "my-subnet",
  "description": "Description of subnet purpose",
  "vmType": "SubnetEVM | SpacesVM | Custom",
  "chainId": 12345
}
```

### Network Configuration
```json
{
  "networkConfig": {
    "gasLimit": "0x7A1200",
    "gasPrice": "0x174876E800",
    "baseFee": "0x34630B8A00"
  }
}
```

### Validators
```json
{
  "validators": [
    {
      "nodeId": "NodeID-...",
      "weight": 100,
      "startTime": "2024-01-01T00:00:00Z",
      "endTime": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### Genesis Configuration
```json
{
  "genesis": {
    "gasLimit": "0x7A1200",
    "difficulty": "0x0",
    "alloc": {
      "0x...": { "balance": "0x..." }
    },
    "config": {
      "chainId": 12345,
      "homesteadBlock": 0
    }
  }
}
```

### Deployment Options
```json
{
  "deployment": {
    "network": "fuji | mainnet | local",
    "outputDir": "./subnet-output",
    "generateScripts": true,
    "enableMonitoring": true
  }
}
```

## Validation

Validate any configuration before deployment:

```bash
subnet-wizard config validate --file examples/defi-subnet.json
```

## Troubleshooting

### Common Issues

1. **Invalid Node ID**: Ensure Node IDs start with "NodeID-"
2. **Chain ID Conflicts**: Use unique Chain IDs not in use
3. **Invalid Addresses**: Use proper Ethereum address format (0x...)
4. **Gas Configuration**: Ensure gas limits are sufficient

### Getting Help

```bash
# Show help for deploy command
subnet-wizard deploy --help

# Show help for config command
subnet-wizard config --help

# General help
subnet-wizard --help
```

## Next Steps

After successful deployment:

1. **Monitor**: Use the frontend dashboard at http://localhost:3000
2. **Connect**: Add the subnet to MetaMask
3. **Deploy Contracts**: Use the contract management tools
4. **Create Assets**: Mint tokens and NFTs on your subnet

For more information, see the [CLI Documentation](../README.md) or visit the web interface at http://localhost:3000/cli.
