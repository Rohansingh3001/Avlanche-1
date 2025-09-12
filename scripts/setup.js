const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

/**
 * Setup script for Avalanche Subnet Tooling Suite
 * Initializes the project and installs dependencies
 */

async function main() {
    console.log(chalk.cyan.bold(`
╔═══════════════════════════════════════╗
║    🏔️  Avalanche Subnet Tooling      ║
║         Project Setup Script          ║
╚═══════════════════════════════════════╝
    `));

    try {
        await checkPrerequisites();
        await setupDirectories();
        await installDependencies();
        await createEnvironmentFiles();
        await setupDatabase();
        await displayCompletionMessage();
    } catch (error) {
        console.error(chalk.red('❌ Setup failed:'), error.message);
        process.exit(1);
    }
}

async function checkPrerequisites() {
    console.log(chalk.yellow('🔍 Checking prerequisites...'));
    
    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 16) {
        throw new Error(`Node.js 16+ required. Current version: ${nodeVersion}`);
    }
    
    console.log(chalk.green(`✅ Node.js ${nodeVersion} (OK)`));
    
    // Check npm
    try {
        const { execSync } = require('child_process');
        const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
        console.log(chalk.green(`✅ npm ${npmVersion} (OK)`));
    } catch (error) {
        throw new Error('npm not found. Please install npm.');
    }
    
    // Check for Avalanche CLI (optional)
    try {
        const { execSync } = require('child_process');
        execSync('avalanche --version', { stdio: 'ignore' });
        console.log(chalk.green('✅ Avalanche CLI (OK)'));
    } catch (error) {
        console.log(chalk.yellow('⚠️  Avalanche CLI not found (optional)'));
        console.log(chalk.gray('   Install with: curl -sSfL https://raw.githubusercontent.com/ava-labs/avalanche-cli/main/scripts/install.sh | sh -s'));
    }
}

async function setupDirectories() {
    console.log(chalk.yellow('\n📁 Setting up project directories...'));
    
    const directories = [
        'data',
        'logs',
        'subnets',
        'uploads',
        'uploads/contracts',
        'uploads/genesis',
        'backend/uploads',
        'backend/uploads/contracts',
        'backend/uploads/genesis'
    ];
    
    for (const dir of directories) {
        await fs.ensureDir(dir);
        console.log(chalk.green(`✅ Created: ${dir}`));
    }
}

async function installDependencies() {
    console.log(chalk.yellow('\n📦 Installing dependencies...'));
    
    const { spawn } = require('child_process');
    
    // Install root dependencies
    await runCommand('npm', ['install'], process.cwd());
    
    // Install CLI dependencies
    await runCommand('npm', ['install'], path.join(process.cwd(), 'cli'));
    
    // Install backend dependencies
    await runCommand('npm', ['install'], path.join(process.cwd(), 'backend'));
    
    // Install frontend dependencies
    await runCommand('npm', ['install'], path.join(process.cwd(), 'frontend'));
    
    console.log(chalk.green('✅ All dependencies installed'));
}

async function runCommand(command, args, cwd) {
    return new Promise((resolve, reject) => {
        console.log(chalk.gray(`   Running: ${command} ${args.join(' ')} in ${path.basename(cwd)}`));
        
        const child = spawn(command, args, {
            cwd,
            stdio: 'pipe',
            shell: process.platform === 'win32'
        });
        
        let output = '';
        child.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        child.stderr.on('data', (data) => {
            output += data.toString();
        });
        
        child.on('close', (code) => {
            if (code === 0) {
                resolve(output);
            } else {
                reject(new Error(`Command failed with code ${code}: ${output}`));
            }
        });
    });
}

async function createEnvironmentFiles() {
    console.log(chalk.yellow('\n🔧 Creating environment files...'));
    
    // Backend .env
    const backendEnv = `# Avalanche Subnet Tooling Suite - Backend Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_PATH=../data/avalanche-subnets.db

# Logging
LOG_LEVEL=info
LOG_FILE=../logs/backend.log

# WebSocket
WS_PORT=5000

# Security
JWT_SECRET=your-jwt-secret-change-this-in-production
CORS_ORIGIN=http://localhost:3000

# Avalanche Network
DEFAULT_RPC_URL=http://localhost:9650/ext/bc/C/rpc
FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
MAINNET_RPC_URL=https://api.avax.network/ext/bc/C/rpc

# Monitoring
HEALTH_CHECK_INTERVAL=30000
METRICS_COLLECTION_INTERVAL=300000

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
`;
    
    await fs.writeFile(path.join(process.cwd(), 'backend', '.env'), backendEnv);
    console.log(chalk.green('✅ Backend .env created'));
    
    // Frontend .env
    const frontendEnv = `# Avalanche Subnet Tooling Suite - Frontend Configuration
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WS_URL=ws://localhost:5000/ws
REACT_APP_ENVIRONMENT=development
REACT_APP_VERSION=1.0.0

# Analytics (optional)
REACT_APP_GA_TRACKING_ID=

# Feature Flags
REACT_APP_ENABLE_DEV_TOOLS=true
REACT_APP_ENABLE_MONITORING=true
REACT_APP_ENABLE_CONTRACT_MANAGER=true

# Network Configuration
REACT_APP_DEFAULT_CHAIN_ID=43112
REACT_APP_AVALANCHE_MAINNET_CHAIN_ID=43114
REACT_APP_AVALANCHE_FUJI_CHAIN_ID=43113

# UI Configuration
REACT_APP_THEME=light
REACT_APP_SIDEBAR_COLLAPSED=false
`;
    
    await fs.writeFile(path.join(process.cwd(), 'frontend', '.env'), frontendEnv);
    console.log(chalk.green('✅ Frontend .env created'));
    
    // CLI .env
    const cliEnv = `# Avalanche Subnet Tooling Suite - CLI Configuration
DEFAULT_SUBNET_DIR=../subnets
DEFAULT_VM_TYPE=SubnetEVM
DEFAULT_CHAIN_ID_RANGE_START=10000
DEFAULT_CHAIN_ID_RANGE_END=999999

# Avalanche CLI Integration
AVALANCHE_CLI_PATH=avalanche
AUTO_START_NETWORK=true
AUTO_DEPLOY_AFTER_CREATE=false

# Templates
TEMPLATE_DIR=./templates
GENESIS_TEMPLATE=genesis-template.json
SUBNET_CONFIG_TEMPLATE=subnet-config-template.json
`;
    
    await fs.writeFile(path.join(process.cwd(), 'cli', '.env'), cliEnv);
    console.log(chalk.green('✅ CLI .env created'));
}

async function setupDatabase() {
    console.log(chalk.yellow('\n💾 Setting up database...'));
    
    // The database will be automatically initialized when the backend starts
    // Just ensure the data directory exists
    await fs.ensureDir(path.join(process.cwd(), 'data'));
    console.log(chalk.green('✅ Database directory ready'));
}

async function displayCompletionMessage() {
    console.log(chalk.green.bold(`\n🎉 Setup completed successfully!\n`));
    
    console.log(chalk.cyan('📋 Available Commands:'));
    console.log(chalk.white('   npm run wizard        ') + chalk.gray('- Create a new subnet interactively'));
    console.log(chalk.white('   npm run dev           ') + chalk.gray('- Start development servers'));
    console.log(chalk.white('   npm run backend       ') + chalk.gray('- Start backend server only'));
    console.log(chalk.white('   npm run frontend      ') + chalk.gray('- Start frontend server only'));
    console.log(chalk.white('   npm run deploy:local  ') + chalk.gray('- Deploy subnet locally'));
    
    console.log(chalk.cyan('\n🚀 Quick Start:'));
    console.log(chalk.white('   1. Create a subnet:   ') + chalk.green('npm run wizard'));
    console.log(chalk.white('   2. Deploy locally:    ') + chalk.green('npm run deploy:local mySubnet'));
    console.log(chalk.white('   3. Start dashboard:   ') + chalk.green('npm run dev'));
    console.log(chalk.white('   4. Open browser:      ') + chalk.green('http://localhost:3000'));
    
    console.log(chalk.cyan('\n📚 Documentation:'));
    console.log(chalk.white('   README.md             ') + chalk.gray('- Project overview and setup'));
    console.log(chalk.white('   docs/                 ') + chalk.gray('- Detailed documentation'));
    
    console.log(chalk.cyan('\n🔗 Useful Links:'));
    console.log(chalk.white('   Dashboard:            ') + chalk.blue('http://localhost:3000'));
    console.log(chalk.white('   API Server:           ') + chalk.blue('http://localhost:5000'));
    console.log(chalk.white('   API Docs:             ') + chalk.blue('http://localhost:5000/api/docs'));
    
    console.log(chalk.yellow('\n⚠️  Important Notes:'));
    console.log(chalk.gray('   • Make sure to install Avalanche CLI for full functionality'));
    console.log(chalk.gray('   • Update .env files with your specific configuration'));
    console.log(chalk.gray('   • Check firewall settings if you have connection issues'));
    
    console.log(chalk.green('\n✨ Happy building with Avalanche subnets!\n'));
}

// Handle script execution
if (require.main === module) {
    main().catch(error => {
        console.error(chalk.red('❌ Setup failed:'), error);
        process.exit(1);
    });
}

module.exports = { main };
