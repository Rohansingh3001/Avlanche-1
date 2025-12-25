#!/usr/bin/env node

const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs-extra');
const path = require('path');
const { generateGenesisConfig, generateSubnetConfig, generateDeploymentScript } = require('./utils/configGenerator');
const { validateSubnetName, validateChainId, validateNetworkSettings } = require('./utils/validators');

console.log(chalk.cyan.bold(`
╔═══════════════════════════════════════╗
║       Avalanche Subnet Wizard         ║
║     Create & Deploy Custom Subnets    ║
╚═══════════════════════════════════════╝
`));

async function main() {
    try {
        console.log(chalk.green('Welcome to the Avalanche Subnet Creation Wizard!'));
        console.log(chalk.gray('This wizard will help you create and configure a custom Avalanche subnet.\n'));

        // Step 1: Basic Subnet Information
        console.log(chalk.yellow('[1/5] Basic Subnet Information'));
        const basicInfo = await inquirer.prompt([
            {
                type: 'input',
                name: 'subnetName',
                message: 'Enter subnet name:',
                validate: validateSubnetName,
                filter: (input) => input.trim().toLowerCase().replace(/\s+/g, '-')
            },
            {
                type: 'input',
                name: 'description',
                message: 'Enter subnet description:',
                default: 'Custom Avalanche subnet'
            },
            {
                type: 'list',
                name: 'vmType',
                message: 'Select Virtual Machine type:',
                choices: [
                    { name: 'SubnetEVM (Ethereum Compatible)', value: 'SubnetEVM' },
                    { name: 'SpacesVM (Key-Value Store)', value: 'SpacesVM' },
                    { name: 'Custom VM', value: 'Custom' }
                ],
                default: 'SubnetEVM'
            }
        ]);

        // Step 2: Network Configuration
        console.log(chalk.yellow('\n[2/5] Network Configuration'));
        const networkConfig = await inquirer.prompt([
            {
                type: 'input',
                name: 'chainId',
                message: 'Enter Chain ID (must be unique):',
                validate: validateChainId,
                default: Math.floor(Math.random() * 1000000) + 10000
            },
            {
                type: 'input',
                name: 'networkId',
                message: 'Enter Network ID:',
                default: '1337',
                validate: (input) => !isNaN(input) && parseInt(input) > 0
            },
            {
                type: 'confirm',
                name: 'enableGasFeatures',
                message: 'Enable gas fee features?',
                default: true
            }
        ]);

        // Step 3: Token Configuration (if SubnetEVM)
        let tokenConfig = {};
        if (basicInfo.vmType === 'SubnetEVM') {
            console.log(chalk.yellow('\n[3/5] Native Token Configuration'));
            tokenConfig = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'tokenName',
                    message: 'Enter native token name:',
                    default: `${basicInfo.subnetName.toUpperCase()} Token`
                },
                {
                    type: 'input',
                    name: 'tokenSymbol',
                    message: 'Enter token symbol:',
                    default: basicInfo.subnetName.substring(0, 4).toUpperCase(),
                    validate: (input) => input.length >= 2 && input.length <= 6
                },
                {
                    type: 'input',
                    name: 'initialSupply',
                    message: 'Enter initial token supply:',
                    default: '1000000',
                    validate: (input) => !isNaN(input) && parseFloat(input) > 0
                },
                {
                    type: 'input',
                    name: 'decimals',
                    message: 'Enter token decimals:',
                    default: '18',
                    validate: (input) => !isNaN(input) && parseInt(input) >= 0 && parseInt(input) <= 18
                }
            ]);
        }

        // Step 4: Validator Configuration
        console.log(chalk.yellow('\n[4/5] Initial Validator Configuration'));
        const validatorConfig = await inquirer.prompt([
            {
                type: 'input',
                name: 'minValidators',
                message: 'Minimum number of validators:',
                default: '1',
                validate: (input) => !isNaN(input) && parseInt(input) > 0
            },
            {
                type: 'input',
                name: 'maxValidators',
                message: 'Maximum number of validators:',
                default: '100',
                validate: (input) => !isNaN(input) && parseInt(input) > 0
            },
            {
                type: 'input',
                name: 'minStake',
                message: 'Minimum stake amount (AVAX):',
                default: '2000',
                validate: (input) => !isNaN(input) && parseFloat(input) > 0
            },
            {
                type: 'input',
                name: 'maxStakeDuration',
                message: 'Maximum stake duration (seconds):',
                default: '31536000', // 1 year
                validate: (input) => !isNaN(input) && parseInt(input) > 0
            }
        ]);

        // Step 5: Deployment Options
        console.log(chalk.yellow('\n[5/5] Deployment Configuration'));
        const deploymentConfig = await inquirer.prompt([
            {
                type: 'list',
                name: 'deploymentTarget',
                message: 'Select deployment target:',
                choices: [
                    { name: 'Local Network (for development)', value: 'local' },
                    { name: 'Fuji Testnet', value: 'fuji' },
                    { name: 'Mainnet', value: 'mainnet' },
                    { name: 'Generate configs only', value: 'config-only' }
                ],
                default: 'local'
            },
            {
                type: 'confirm',
                name: 'autoStart',
                message: 'Auto-start subnet after creation?',
                default: true,
                when: (answers) => answers.deploymentTarget !== 'config-only'
            },
            {
                type: 'confirm',
                name: 'enableMonitoring',
                message: 'Enable monitoring dashboard?',
                default: true
            }
        ]);

        // Compile all configuration
        const config = {
            basic: basicInfo,
            network: networkConfig,
            token: tokenConfig,
            validator: validatorConfig,
            deployment: deploymentConfig,
            timestamp: new Date().toISOString()
        };

        // Generate configuration files
        const spinner = ora('Generating subnet configuration files...').start();

        try {
            const outputDir = path.join(process.cwd(), 'subnets', config.basic.subnetName);
            await fs.ensureDir(outputDir);

            // Generate genesis.json
            const genesisConfig = generateGenesisConfig(config);
            await fs.writeJSON(path.join(outputDir, 'genesis.json'), genesisConfig, { spaces: 2 });

            // Generate subnet-config.json
            const subnetConfig = generateSubnetConfig(config);
            await fs.writeJSON(path.join(outputDir, 'subnet-config.json'), subnetConfig, { spaces: 2 });

            // Generate deployment script
            const deploymentScript = generateDeploymentScript(config);
            await fs.writeFile(path.join(outputDir, 'deploy.sh'), deploymentScript);

            // Make deployment script executable
            await fs.chmod(path.join(outputDir, 'deploy.sh'), '755');

            // Generate README for the subnet
            const readmeContent = generateSubnetReadme(config);
            await fs.writeFile(path.join(outputDir, 'README.md'), readmeContent);

            spinner.succeed('Configuration files generated successfully!');

            console.log(chalk.green('\n[SUCCESS] Subnet configuration completed!'));
            console.log(chalk.cyan('\nGenerated files:'));
            console.log(chalk.gray(`   - ${outputDir}/`));
            console.log(chalk.gray(`   ├── genesis.json`));
            console.log(chalk.gray(`   ├── subnet-config.json`));
            console.log(chalk.gray(`   ├── deploy.sh`));
            console.log(chalk.gray(`   └── README.md`));

            if (config.deployment.deploymentTarget !== 'config-only') {
                const shouldDeploy = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'deploy',
                        message: 'Would you like to deploy the subnet now?',
                        default: true
                    }
                ]);

                if (shouldDeploy.deploy) {
                    await deploySubnet(config, outputDir);
                }
            }

            console.log(chalk.green('\n[DONE] Subnet wizard completed successfully!'));
            console.log(chalk.cyan('\nNext steps:'));
            console.log(chalk.gray(`1. Review configuration in: ${outputDir}`));
            console.log(chalk.gray(`2. Deploy: bash ${path.join(outputDir, 'deploy.sh')}`));
            console.log(chalk.gray(`3. Start monitoring: npm run dev`));

        } catch (error) {
            spinner.fail('Failed to generate configuration files');
            throw error;
        }

    } catch (error) {
        console.error(chalk.red('\n[ERROR]'), error.message);
        process.exit(1);
    }
}

async function deploySubnet(config, outputDir) {
    const deploySpinner = ora(`Deploying subnet to ${config.deployment.deploymentTarget}...`).start();

    try {
        const { spawn } = require('child_process');
        const deployScript = path.join(outputDir, 'deploy.sh');

        const deployment = spawn('bash', [deployScript], {
            stdio: 'pipe',
            cwd: outputDir
        });

        let output = '';
        deployment.stdout.on('data', (data) => {
            output += data.toString();
        });

        deployment.stderr.on('data', (data) => {
            output += data.toString();
        });

        deployment.on('close', (code) => {
            if (code === 0) {
                deploySpinner.succeed('Subnet deployed successfully!');
                console.log(chalk.green('\nDeployment Details:'));

                // Parse deployment output for important information
                const lines = output.split('\n');
                lines.forEach(line => {
                    if (line.includes('RPC URL:') || line.includes('Chain ID:') || line.includes('Blockchain ID:')) {
                        console.log(chalk.cyan(`   ${line.trim()}`));
                    }
                });

            } else {
                deploySpinner.fail('Deployment failed');
                console.log(chalk.red('Deployment output:'));
                console.log(output);
            }
        });

    } catch (error) {
        deploySpinner.fail('Deployment failed');
        console.error(chalk.red('Deployment error:'), error.message);
    }
}

function generateSubnetReadme(config) {
    return `# ${config.basic.subnetName} Subnet

${config.basic.description}

## Configuration

- **VM Type**: ${config.basic.vmType}
- **Chain ID**: ${config.network.chainId}
- **Network ID**: ${config.network.networkId}
${config.token.tokenName ? `- **Native Token**: ${config.token.tokenName} (${config.token.tokenSymbol})` : ''}

## Deployment

To deploy this subnet:

\`\`\`bash
bash deploy.sh
\`\`\`

## Validator Configuration

- **Min Validators**: ${config.validator.minValidators}
- **Max Validators**: ${config.validator.maxValidators}
- **Min Stake**: ${config.validator.minStake} AVAX
- **Max Stake Duration**: ${config.validator.maxStakeDuration} seconds

## Generated Files

- \`genesis.json\` - Genesis configuration
- \`subnet-config.json\` - Subnet parameters
- \`deploy.sh\` - Deployment script

## Next Steps

1. Deploy the subnet using the deployment script
2. Add validators to secure the network
3. Deploy smart contracts
4. Start building your dApp!

Created: ${config.timestamp}
`;
}

if (require.main === module) {
    main();
}

module.exports = { main };
