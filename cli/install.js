#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log(`
╔═══════════════════════════════════════╗
║     🏔️  Avalanche Subnet CLI         ║
║     Installation & Setup Script       ║
╚═══════════════════════════════════════╝
`);

const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

console.log(`Installing Avalanche Subnet CLI v${packageJson.version}...`);

try {
    // Install dependencies
    console.log('📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit', cwd: __dirname });
    
    // Make the script executable
    if (process.platform !== 'win32') {
        const scriptPath = path.join(__dirname, 'subnet-wizard.js');
        try {
            execSync(`chmod +x ${scriptPath}`);
            console.log('✅ Made subnet-wizard.js executable');
        } catch (err) {
            console.log('⚠️  Could not make script executable, run: chmod +x subnet-wizard.js');
        }
    }
    
    // Create symlink for global usage (optional)
    console.log('\n🔗 Setting up global command...');
    try {
        execSync('npm link', { stdio: 'inherit', cwd: __dirname });
        console.log('✅ Global command "subnet-wizard" is now available');
    } catch (err) {
        console.log('⚠️  Could not create global link. You can still run: node subnet-wizard.js');
    }
    
    console.log(`
✅ Installation complete!

🚀 Quick Start:
   subnet-wizard                    # Start interactive wizard
   subnet-wizard --help             # Show help
   subnet-wizard create             # Create new subnet

📚 Documentation:
   - CLI Docs: Open http://localhost:3000/cli in your browser
   - README: ./README.md
   - Examples: ./examples/

🔧 Manual Run:
   node subnet-wizard.js            # If global command doesn't work

Happy subnet building! 🏔️
`);

} catch (error) {
    console.error('❌ Installation failed:', error.message);
    console.log(`
🔧 Manual Installation:
   1. cd ${__dirname}
   2. npm install
   3. node subnet-wizard.js
`);
    process.exit(1);
}
