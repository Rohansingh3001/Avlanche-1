# Avalanche Subnet CLI

A powerful, interactive command-line interface for creating, managing, and deploying custom Avalanche Subnets.

## Features

- **Interactive Wizard**: Step-by-step guidance for subnet creation
- **VM Support**: Support for SubnetEVM, SpacesVM, and custom VMs
- **Network Configuration**: Easy setup for Chain IDs and Network IDs
- **Validator Management**: Configure initial validators and parameters
- **Deployment Scripts**: Auto-generated scripts for local, Fuji, and Mainnet deployment

## Installation

### Global Installation (Recommended)

```bash
npm install -g avalanche-subnet-cli
```

### Local Installation

```bash
npm install avalanche-subnet-cli
```

## Usage

Start the interactive wizard:

```bash
subnet-wizard
```

### Generated Artifacts

The tool generates a project directory containing:

- `genesis.json`: The genesis configuration for your subnet
- `subnet-config.json`: Configuration parameters
- `deploy.sh`: Deployment script
- `README.md`: Specific documentation for your new subnet

## Development

```bash
# Clone repository
git clone https://github.com/your-org/avalanche-subnet-tooling
cd avalanche-subnet-tooling/cli

# Install dependencies
npm install

# Run locally
npm start
```

## License

MIT
