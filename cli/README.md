# 🏔️ Avalanche Subnet CLI

Interactive command-line interface for creating and managing Avalanche subnets with ease.

## 📋 Overview

The Avalanche Subnet CLI is a powerful tool that provides an interactive wizard for creating, configuring, and deploying custom Avalanche subnets. It supports multiple virtual machine types and automates the complex process of subnet creation.

## ✨ Features

- **Interactive Wizard**: Step-by-step subnet creation process
- **Multiple VM Types**: Support for SubnetEVM, SpacesVM, and custom VMs
- **Genesis Configuration**: Automated genesis block configuration
- **Validator Management**: Easy validator setup and configuration
- **Deployment Scripts**: Automated deployment script generation
- **Configuration Templates**: Pre-built templates for common use cases
- **Validation**: Built-in validation for subnet parameters
- **Progress Tracking**: Real-time progress indicators

## 🚀 Quick Start

### Installation

```bash
# Install globally via npm
npm install -g avalanche-subnet-cli

# Or run directly with npx
npx avalanche-subnet-cli
```

### Basic Usage

```bash
# Start the interactive wizard
subnet-wizard

# Create a subnet with prompts
subnet-wizard create

# Deploy from configuration file
subnet-wizard deploy --config my-subnet.json
```

## 📖 Detailed Usage

### Interactive Wizard

The main command launches an interactive wizard that guides you through the subnet creation process:

```bash
subnet-wizard
```

The wizard will prompt you for:

1. **Basic Information**
   - Subnet name
   - Description
   - Virtual Machine type

2. **Network Configuration**
   - Chain ID
   - Network settings
   - Gas configuration

3. **Validator Setup**
   - Validator node IDs
   - Staking weights
   - Validation periods

4. **Genesis Configuration**
   - Initial allocations
   - Gas limits
   - Network parameters

5. **Deployment Options**
   - Network selection (Fuji/Mainnet)
   - Output directory
   - Deployment scripts

### Command Line Options

#### Create Command

```bash
subnet-wizard create [options]
```

Options:
- `--name <name>`: Subnet name
- `--vm <type>`: VM type (evm, spacesvm, custom)
- `--chain-id <id>`: Chain ID
- `--config <file>`: Use configuration file
- `--output <dir>`: Output directory

#### Configuration Commands

```bash
# Initialize configuration
subnet-wizard config init

# Validate configuration
subnet-wizard config validate

# Generate template
subnet-wizard config template --vm evm
```

#### Utility Commands

```bash
# List subnets
subnet-wizard list

# Show help
subnet-wizard --help

# Show version
subnet-wizard --version
```

## 📋 Configuration

### Configuration File Format

The CLI uses JSON configuration files for advanced setups:

```json
{
  "subnetName": "my-defi-subnet",
  "description": "DeFi subnet for trading applications",
  "vmType": "SubnetEVM",
  "chainId": 12345,
  "networkConfig": {
    "gasLimit": "0x7A1200",
    "gasPrice": "0x174876E800",
    "baseFee": "0x34630B8A00"
  },
  "validators": [
    {
      "nodeId": "NodeID-BFa1paRxVF3SKGg5zrRHZB8Hp4hsm5kQG",
      "weight": 100,
      "startTime": "2024-01-01T00:00:00Z",
      "endTime": "2025-01-01T00:00:00Z"
    }
  ],
  "genesis": {
    "gasLimit": "0x7A1200",
    "difficulty": "0x0",
    "mixHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
    "coinbase": "0x0000000000000000000000000000000000000000",
    "alloc": {
      "0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC": {
        "balance": "0x295BE96E64066972000000"
      }
    },
    "airdropHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
    "airdropAmount": "0x0",
    "config": {
      "chainId": 12345,
      "homesteadBlock": 0,
      "eip150Block": 0,
      "eip150Hash": "0x2086799aeebeae135c246c65021c82b4e15a2c451340993aacfd2751886514f0",
      "eip155Block": 0,
      "eip158Block": 0,
      "byzantiumBlock": 0,
      "constantinopleBlock": 0,
      "petersburgBlock": 0,
      "istanbulBlock": 0,
      "muirGlacierBlock": 0,
      "subnetEVMTimestamp": 0
    }
  },
  "deployment": {
    "network": "fuji",
    "outputDir": "./subnet-output",
    "generateScripts": true
  }
}
```

### VM Types

#### SubnetEVM (Ethereum Compatible)
- Full Ethereum compatibility
- EVM smart contracts
- Web3 API support
- MetaMask integration

```bash
subnet-wizard create --vm evm --name ethereum-subnet
```

#### SpacesVM (Key-Value Store)
- Decentralized key-value storage
- Simple API
- Efficient for data storage applications

```bash
subnet-wizard create --vm spacesvm --name storage-subnet
```

#### Custom VM
- User-defined virtual machine
- Custom business logic
- Advanced configuration options

```bash
subnet-wizard create --vm custom --name custom-subnet
```

## 🔧 Examples

### Example 1: Basic EVM Subnet

Create a simple Ethereum-compatible subnet:

```bash
subnet-wizard create \
  --name "my-defi-subnet" \
  --vm evm \
  --chain-id 12345 \
  --output ./my-subnet
```

### Example 2: Advanced Configuration

Using a configuration file for complex setups:

```bash
# Generate template
subnet-wizard config template --vm evm --output advanced-subnet.json

# Edit the configuration file
# ... customize validators, genesis, etc ...

# Deploy with configuration
subnet-wizard deploy --config advanced-subnet.json
```

### Example 3: SpacesVM Subnet

Create a key-value store subnet:

```bash
subnet-wizard create \
  --name "storage-subnet" \
  --vm spacesvm \
  --chain-id 54321
```

## 📁 Output Structure

After successful creation, the CLI generates:

```
subnet-output/
├── genesis.json              # Genesis configuration
├── subnet-config.json        # Subnet configuration
├── validators.json           # Validator information
├── deploy.sh                 # Deployment script
├── contracts/                # Smart contracts (if applicable)
│   ├── precompiles/
│   └── genesis-contracts/
└── docs/                     # Documentation
    ├── README.md
    └── deployment-guide.md
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Command Not Found
```bash
# Error: command not found: subnet-wizard
npm install -g avalanche-subnet-cli
```

#### 2. Node ID Validation
```bash
# Error: Invalid Node ID format
# Solution: Use correct format NodeID-...
NodeID-BFa1paRxVF3SKGg5zrRHZB8Hp4hsm5kQG
```

#### 3. Chain ID Conflicts
```bash
# Error: Chain ID already exists
# Solution: Use unique Chain ID
subnet-wizard list --show-chain-ids
```

#### 4. Network Connectivity
```bash
# Test Avalanche node connection
curl -X POST --data '{"jsonrpc":"2.0","id":1,"method":"info.getNodeID"}' \
     -H 'content-type:application/json;' \
     http://localhost:9650/ext/info
```

### Debug Mode

Enable verbose logging:

```bash
# Run with debug output
subnet-wizard --debug

# Verbose mode
subnet-wizard --verbose create
```

### Validation

Validate configuration before deployment:

```bash
subnet-wizard config validate --file my-subnet.json
```

## 🤝 Contributing

### Development Setup

```bash
# Clone repository
git clone https://github.com/your-org/avalanche-subnet-cli.git
cd avalanche-subnet-cli

# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test
```

### Project Structure

```
cli/
├── subnet-wizard.js          # Main CLI entry point
├── utils/
│   ├── configGenerator.js    # Configuration generators
│   ├── validators.js         # Input validation
│   ├── deployer.js          # Deployment utilities
│   └── templates.js         # Configuration templates
├── tests/
│   ├── unit/
│   └── integration/
└── docs/
    └── api.md
```

## 📚 API Reference

### Core Functions

#### `createSubnet(config)`
Creates a new subnet with the provided configuration.

#### `validateConfig(config)`
Validates subnet configuration parameters.

#### `generateGenesis(config)`
Generates genesis block configuration.

#### `deploySubnet(config, network)`
Deploys subnet to specified network.

### Validation Rules

- **Subnet Name**: Alphanumeric with hyphens, 3-50 characters
- **Chain ID**: Positive integer, must be unique
- **Node ID**: Must start with "NodeID-" followed by valid ID
- **Gas Limit**: Hexadecimal string, minimum 0x5F5E100
- **Addresses**: Valid Ethereum addresses (0x...)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Avalanche Documentation](https://docs.avax.network/)
- [Subnet Development Guide](https://docs.avax.network/subnets)
- [Discord Community](https://chat.avax.network/)
- [GitHub Repository](https://github.com/your-org/avalanche-subnet-cli)

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-org/avalanche-subnet-cli/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/avalanche-subnet-cli/discussions)
- **Discord**: [Avalanche Community](https://chat.avax.network/)
- **Email**: support@avalanche-subnet-cli.com

---

Made with ❤️ for the Avalanche community
