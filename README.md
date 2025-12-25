# Avalanche Subnet Tooling Suite

# Avalanche Subnet Tooling Suite

A comprehensive toolkit for creating, deploying, and managing Avalanche subnets with an intuitive CLI wizard, real-time monitoring dashboard, and smart contract management capabilities.

## 🚀 Features

- **Interactive CLI Wizard**: Step-by-step subnet creation with validation and deployment
- **TypeScript React Dashboard**: Type-safe frontend with Material-UI components
- **Real-time Monitoring**: WebSocket-powered live updates and notifications
- **Smart Contract Management**: Deploy and interact with Solidity contracts
- **Asset Management**: Create and manage tokens and NFTs
- **CLI Documentation**: Comprehensive built-in documentation in the web interface
- **Local Development**: Full local deployment support
- **Type Safety**: Complete TypeScript implementation for better developer experience

## 📋 Components

### 🏔️ CLI Wizard (`/cli`)
Interactive command-line interface for subnet creation and management.

**Quick Start:**
```bash
cd cli
npm install
npm start
# or
./subnet-wizard.js
```

**Features:**
- Interactive subnet creation wizard
- Multiple VM types (SubnetEVM, SpacesVM, Custom)
- Genesis configuration generation
- Validator management
- Automated deployment scripts
- Configuration templates

**Usage Examples:**
```bash
# Start interactive wizard
subnet-wizard

# Create EVM subnet
subnet-wizard create --name my-subnet --vm evm --chain-id 12345

# Deploy from config
subnet-wizard deploy --config subnet-config.json

# Generate template
subnet-wizard config template --vm evm --output my-config.json
```

### 🌐 Frontend Dashboard (`/frontend`)
Modern React TypeScript interface with comprehensive CLI documentation.

**Features:**
- Real-time subnet monitoring
- Interactive CLI documentation
- Contract and asset management
- WebSocket live updates
- Material-UI design system

**Access CLI Docs:**
- Navigate to `/cli` or `/cli-docs` in the web interface
- Complete command reference with copy-to-clipboard functionality
- Interactive examples and troubleshooting guide

### 🔧 Backend API (`/backend`)
Node.js/Express server providing REST APIs and WebSocket connections.

### 📄 Smart Contracts (`/contracts`)
Solidity contracts for subnet functionality.

## 📋 Prerequisites

- Node.js 16+ 
- npm or yarn
- TypeScript 4.9+
- Git

## 🛠️ Installation

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd Avlanche
   npm run setup
   ```

2. **Environment Configuration**
   The setup script will create `.env` files with default values. Update as needed:
   
   **Backend (.env)**:
   ```env
   PORT=3001
   NODE_ENV=development
   DB_PATH=./database.db
   AVALANCHE_RPC_URL=http://localhost:9650
   PRIVATE_KEY=your-private-key-here
   ```

   **Frontend (.env)**:
   ```env
   REACT_APP_API_URL=http://localhost:3001
   REACT_APP_WS_URL=ws://localhost:3001
   ```

## 🎯 Quick Start

### Create Your First Subnet

```bash
npm run wizard
```

Follow the interactive prompts to:
- Configure subnet settings
- Set up validators
- Generate genesis configuration
- Deploy locally or to testnet

### Start Development Servers

```bash
npm run dev
```

This starts both backend (port 3001) and frontend (port 3000) servers.

### Deploy Locally

```bash
npm run deploy:local
```

## 📁 Project Structure

```
Avlanche/
├── cli/                    # CLI wizard and tools
│   ├── subnet-wizard.js   # Interactive subnet creation
│   └── validators.js      # Input validation functions
├── backend/               # Express.js API server
│   ├── server.js         # Main server configuration
│   ├── routes/           # API endpoints
│   ├── services/         # Business logic
│   ├── models/           # Database models
│   └── utils/            # Utility functions
├── frontend/             # React TypeScript dashboard
│   ├── src/
│   │   ├── components/   # Reusable TSX components
│   │   ├── pages/        # Page components (.tsx)
│   │   ├── contexts/     # React contexts with TypeScript
│   │   ├── services/     # API services with type definitions
│   │   ├── types/        # TypeScript type definitions
│   │   └── utils/        # Utility functions
│   ├── tsconfig.json     # TypeScript configuration
│   └── public/
├── contracts/            # Smart contracts
│   ├── SubnetToken.sol   # ERC20 token template
│   └── SubnetNFT.sol     # ERC721 NFT template
├── scripts/              # Deployment and utility scripts
└── docs/                 # Documentation
```

## 🔧 CLI Commands

### Subnet Management
```bash
npm run wizard           # Create new subnet
npm run deploy:local     # Deploy to local network
npm run deploy:testnet   # Deploy to Avalanche testnet
```

### Development
```bash
npm run dev             # Start both frontend and backend
npm run start:backend   # Start backend only
npm run start:frontend  # Start frontend only
npm run build          # Build for production
```

### Testing
```bash
npm test               # Run all tests
npm run test:backend   # Backend tests only
npm run test:frontend  # Frontend tests only
```

## 🌐 API Endpoints

### Subnets
- `GET /api/subnets` - List all subnets
- `POST /api/subnets` - Create new subnet
- `GET /api/subnets/:id` - Get subnet details
- `PUT /api/subnets/:id` - Update subnet
- `DELETE /api/subnets/:id` - Remove subnet

### Contracts
- `GET /api/contracts` - List contracts
- `POST /api/contracts/upload` - Upload contract
- `POST /api/contracts/compile` - Compile Solidity
- `POST /api/contracts/deploy` - Deploy contract

### Assets
- `GET /api/assets` - List assets
- `POST /api/assets/token` - Create token
- `POST /api/assets/nft` - Create NFT

### Monitoring
- `GET /api/health` - System health check
- `GET /api/metrics` - Performance metrics
- `WebSocket /ws` - Real-time updates

## 🎨 Dashboard Features

### Main Dashboard (TypeScript)
- **Type-safe components**: All components built with TypeScript for better development experience
- **Subnet Status**: Real-time status monitoring with strongly typed data models
- **Quick Actions**: Material-UI based action cards with type-safe props
- **Network Health**: System performance metrics with typed interfaces
- **Recent Activity**: Latest operations with typed activity models

### TypeScript Architecture
- **Strict typing**: Complete type definitions for all data models
- **API service types**: Strongly typed HTTP client with response interfaces
- **Component props**: Fully typed React component properties
- **Context providers**: Type-safe React contexts for state management
- **Hook interfaces**: Custom hooks with proper TypeScript support

## 🔐 Security Features

- Input validation and sanitization
- Secure private key handling
- Rate limiting on API endpoints
- CORS protection
- Helmet.js security headers

## 📊 Monitoring & Logging

- Real-time WebSocket updates
- Comprehensive error logging
- Performance metrics collection
- Health check endpoints
- Activity tracking

## 🔧 Configuration

### Subnet Configuration
The wizard generates configuration files:

```json
{
  "name": "my-subnet",
  "chainId": 54321,
  "vmType": "evm",
  "validators": [
    {
      "nodeId": "NodeID-...",
      "weight": 100
    }
  ],
  "genesis": {
    "gasLimit": 8000000,
    "difficulty": "0x0",
    "alloc": {}
  }
}
```

### Smart Contract Templates
Pre-built contract templates:
- **SubnetToken.sol**: ERC20 token with minting
- **SubnetNFT.sol**: ERC721 NFT collection
- **MultiSig.sol**: Multi-signature wallet

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```bash
docker build -t avalanche-subnet-tools .
docker run -p 3000:3000 -p 3001:3001 avalanche-subnet-tools
```

## 🛟 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   lsof -ti:3001 | xargs kill -9  # Kill process on port 3001
   ```

2. **Database connection errors**
   ```bash
   rm database.db  # Reset database
   npm run setup   # Reinitialize
   ```

3. **WebSocket connection failed**
   - Check if backend server is running
   - Verify WebSocket URL in frontend config

### Debug Mode
```bash
DEBUG=* npm run dev  # Enable verbose logging
```

## 📚 Documentation

- [API Documentation](./docs/api.md)
- [CLI Reference](./docs/cli.md)
- [Deployment Guide](./docs/deployment.md)
- [Contract Development](./docs/contracts.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🆘 Support

- GitHub Issues: Report bugs and request features
- Documentation: Check the docs/ directory
- Examples: See examples/ directory

## 🔗 Resources

- [Avalanche Documentation](https://docs.avax.network/)
- [Subnet Tutorial](https://docs.avax.network/subnets)
- [EVM Subnet Guide](https://docs.avax.network/subnets/create-evm-subnet)

---

**Happy Building! 🏔️**

## 🚀 Features

- **Interactive Subnet Creation Wizard**: CLI tool for guided subnet configuration
- **Automated Deployment**: One-command deployment for local and cloud environments
- **Real-time Monitoring**: Live health dashboard with comprehensive metrics
- **Smart Contract Management**: Deploy and interact with Solidity contracts
- **Asset Management**: Create, mint, and manage tokens on subnets
- **Modern Web Dashboard**: React-based interface with MetaMask integration

## 📋 Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0
- Avalanche-CLI installed globally
- Git

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/avalanche-subnet-tooling
cd avalanche-subnet-tooling
```

2. Install dependencies for all modules:
```bash
npm run install:all
```

3. Install Avalanche-CLI (if not already installed):
```bash
curl -sSfL https://raw.githubusercontent.com/ava-labs/avalanche-cli/main/scripts/install.sh | sh -s
```

## 🚀 Quick Start

1. **Create a new subnet using the wizard:**
```bash
npm run wizard
```

2. **Deploy locally:**
```bash
npm run deploy:local mySubnet
```

3. **Start the application:**
```bash
npm run dev
```

4. **Access the dashboard:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
avalanche-subnet-tooling/
├── cli/                    # Interactive subnet wizard
│   ├── subnet-wizard.js    # Main CLI application
│   └── utils/              # CLI utilities
├── backend/                # Express.js API server
│   ├── server.js          # Main server file
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   └── models/            # Data models
├── frontend/              # React dashboard
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   └── services/      # Frontend services
│   └── public/
├── contracts/             # Solidity smart contracts
│   └── tokens/            # Token contracts
├── scripts/               # Deployment scripts
├── docs/                  # Documentation
└── tests/                 # Test files
```

## 🔧 Usage

### CLI Subnet Wizard

Create a new subnet interactively:
```bash
npm run wizard
```

### API Endpoints

- `GET /api/subnets` - List all subnets
- `POST /api/subnets` - Create new subnet
- `GET /api/subnets/:id/status` - Get subnet health status
- `POST /api/contracts/deploy` - Deploy smart contracts
- `GET /api/assets/:subnetId` - List subnet assets
- `POST /api/assets/mint` - Mint tokens

### Web Dashboard

Navigate to http://localhost:3000 to access:
- Subnet overview and health metrics
- Contract management interface
- Asset management tools
- Real-time monitoring charts

## 🌐 Deployment Options

### Local Network
```bash
./scripts/deploy-local.sh mySubnet
```

### Fuji Testnet
```bash
avalanche subnet deploy mySubnet --fuji
```

### Cloud Deployment
```bash
node scripts/deploy-cloud.js mySubnet --provider aws
```

## 📊 Monitoring Metrics

- Validator count and status
- Block production rate
- Transaction throughput
- Gas usage statistics
- Network uptime
- Token supply and transfers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Join our Discord community
- Check the documentation in `/docs`

## 🔄 Roadmap

- [ ] Multi-cloud deployment support
- [ ] Advanced governance features
- [ ] Cross-subnet communication tools
- [ ] Performance optimization dashboard
- [ ] Mobile application support
