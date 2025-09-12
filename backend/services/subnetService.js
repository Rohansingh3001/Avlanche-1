const { ethers } = require('ethers');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const DatabaseService = require('./databaseService');

class SubnetService {
    constructor() {
        this.subnets = new Map();
        this.providers = new Map();
    }

    /**
     * Get all subnets with pagination and filtering
     */
    async getSubnets(options = {}) {
        const { page = 1, limit = 10, status } = options;
        
        try {
            const subnets = await DatabaseService.query(`
                SELECT * FROM subnets 
                ${status ? 'WHERE status = ?' : ''}
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            `, status ? [status, limit, (page - 1) * limit] : [limit, (page - 1) * limit]);

            return subnets.map(subnet => ({
                ...subnet,
                config: JSON.parse(subnet.config || '{}'),
                deployment: JSON.parse(subnet.deployment || '{}')
            }));
        } catch (error) {
            console.error('❌ Error fetching subnets:', error);
            throw new Error('Failed to fetch subnets from database');
        }
    }

    /**
     * Get subnet by ID
     */
    async getSubnetById(id) {
        try {
            const [subnet] = await DatabaseService.query(
                'SELECT * FROM subnets WHERE id = ?',
                [id]
            );

            if (!subnet) {
                return null;
            }

            return {
                ...subnet,
                config: JSON.parse(subnet.config || '{}'),
                deployment: JSON.parse(subnet.deployment || '{}')
            };
        } catch (error) {
            console.error('❌ Error fetching subnet by ID:', error);
            throw new Error('Failed to fetch subnet');
        }
    }

    /**
     * Create a new subnet
     */
    async createSubnet(subnetData) {
        const id = uuidv4();
        const timestamp = new Date().toISOString();

        try {
            // Validate chain ID uniqueness
            const existingSubnet = await DatabaseService.query(
                'SELECT id FROM subnets WHERE chain_id = ?',
                [subnetData.chainId]
            );

            if (existingSubnet.length > 0) {
                throw new Error(`Chain ID ${subnetData.chainId} is already in use`);
            }

            // Generate subnet configuration
            const config = this.generateSubnetConfig(subnetData);
            
            // Create subnet directory
            const subnetDir = path.join(process.cwd(), 'subnets', subnetData.name);
            await fs.ensureDir(subnetDir);

            // Generate and save configuration files
            await this.saveSubnetFiles(subnetDir, config);

            // Save to database
            await DatabaseService.query(`
                INSERT INTO subnets (
                    id, name, description, chain_id, vm_type, network_id,
                    config, deployment, status, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                id,
                subnetData.name,
                subnetData.description || '',
                subnetData.chainId,
                subnetData.vmType,
                subnetData.networkId,
                JSON.stringify(config),
                JSON.stringify(subnetData.deployment || {}),
                'created',
                timestamp,
                timestamp
            ]);

            const subnet = {
                id,
                name: subnetData.name,
                description: subnetData.description,
                chainId: subnetData.chainId,
                vmType: subnetData.vmType,
                networkId: subnetData.networkId,
                config,
                deployment: subnetData.deployment,
                status: 'created',
                created_at: timestamp,
                updated_at: timestamp
            };

            console.log(`✅ Subnet ${subnetData.name} created with ID: ${id}`);
            return subnet;

        } catch (error) {
            console.error('❌ Error creating subnet:', error);
            throw error;
        }
    }

    /**
     * Update subnet
     */
    async updateSubnet(id, updates) {
        try {
            const updateFields = [];
            const values = [];

            Object.entries(updates).forEach(([key, value]) => {
                if (value !== undefined) {
                    updateFields.push(`${key} = ?`);
                    values.push(value);
                }
            });

            if (updateFields.length === 0) {
                throw new Error('No valid fields to update');
            }

            values.push(new Date().toISOString(), id);

            await DatabaseService.query(`
                UPDATE subnets 
                SET ${updateFields.join(', ')}, updated_at = ?
                WHERE id = ?
            `, values);

            return await this.getSubnetById(id);
        } catch (error) {
            console.error('❌ Error updating subnet:', error);
            throw error;
        }
    }

    /**
     * Update subnet status
     */
    async updateSubnetStatus(id, status) {
        try {
            await DatabaseService.query(
                'UPDATE subnets SET status = ?, updated_at = ? WHERE id = ?',
                [status, new Date().toISOString(), id]
            );

            console.log(`📊 Subnet ${id} status updated to: ${status}`);
        } catch (error) {
            console.error('❌ Error updating subnet status:', error);
            throw error;
        }
    }

    /**
     * Deploy subnet
     */
    async deploySubnet(id, target = 'local', autoStart = true) {
        try {
            const subnet = await this.getSubnetById(id);
            if (!subnet) {
                throw new Error('Subnet not found');
            }

            console.log(`🚀 Starting deployment of subnet ${subnet.name} to ${target}`);

            // Update status to deploying
            await this.updateSubnetStatus(id, 'deploying');

            const deploymentResult = await this.executeDeployment(subnet, target, autoStart);

            // Update deployment info and status
            await DatabaseService.query(`
                UPDATE subnets 
                SET deployment = ?, status = ?, updated_at = ?
                WHERE id = ?
            `, [
                JSON.stringify({
                    ...subnet.deployment,
                    target,
                    result: deploymentResult,
                    deployed_at: new Date().toISOString()
                }),
                'active',
                new Date().toISOString(),
                id
            ]);

            console.log(`✅ Subnet ${subnet.name} deployed successfully to ${target}`);
            return deploymentResult;

        } catch (error) {
            console.error('❌ Deployment failed:', error);
            await this.updateSubnetStatus(id, 'error');
            throw error;
        }
    }

    /**
     * Delete subnet
     */
    async deleteSubnet(id) {
        try {
            const subnet = await this.getSubnetById(id);
            if (!subnet) {
                throw new Error('Subnet not found');
            }

            // Remove subnet files
            const subnetDir = path.join(process.cwd(), 'subnets', subnet.name);
            if (await fs.pathExists(subnetDir)) {
                await fs.remove(subnetDir);
            }

            // Remove from database
            await DatabaseService.query('DELETE FROM subnets WHERE id = ?', [id]);

            // Clean up provider cache
            this.providers.delete(id);

            console.log(`🗑️ Subnet ${subnet.name} deleted successfully`);
        } catch (error) {
            console.error('❌ Error deleting subnet:', error);
            throw error;
        }
    }

    /**
     * Add validator to subnet
     */
    async addValidator(subnetId, validatorData) {
        try {
            const validatorId = uuidv4();
            const timestamp = new Date().toISOString();

            await DatabaseService.query(`
                INSERT INTO validators (
                    id, subnet_id, node_id, weight, start_time, end_time, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                validatorId,
                subnetId,
                validatorData.nodeId,
                validatorData.weight || 1,
                validatorData.start || timestamp,
                validatorData.end,
                timestamp
            ]);

            return {
                id: validatorId,
                subnetId,
                ...validatorData,
                created_at: timestamp
            };
        } catch (error) {
            console.error('❌ Error adding validator:', error);
            throw error;
        }
    }

    /**
     * Get subnet provider (ethers.js provider)
     */
    async getProvider(subnetId) {
        if (this.providers.has(subnetId)) {
            return this.providers.get(subnetId);
        }

        try {
            const subnet = await this.getSubnetById(subnetId);
            if (!subnet || !subnet.deployment.result?.rpcUrl) {
                throw new Error('Subnet not deployed or RPC URL not available');
            }

            const provider = new ethers.JsonRpcProvider(subnet.deployment.result.rpcUrl);
            this.providers.set(subnetId, provider);

            return provider;
        } catch (error) {
            console.error('❌ Error creating provider:', error);
            throw error;
        }
    }

    /**
     * Generate subnet configuration
     */
    generateSubnetConfig(subnetData) {
        return {
            basic: {
                name: subnetData.name,
                description: subnetData.description,
                vmType: subnetData.vmType
            },
            network: {
                chainId: subnetData.chainId,
                networkId: subnetData.networkId,
                enableGasFeatures: true
            },
            token: subnetData.token || {},
            validators: {
                minValidators: subnetData.validators?.minValidators || 1,
                maxValidators: subnetData.validators?.maxValidators || 100,
                minStake: subnetData.validators?.minStake || 2000,
                maxStakeDuration: subnetData.validators?.maxStakeDuration || 31536000
            },
            genesis: this.generateGenesis(subnetData)
        };
    }

    /**
     * Generate genesis configuration
     */
    generateGenesis(subnetData) {
        const genesis = {
            config: {
                chainId: subnetData.chainId,
                homesteadBlock: 0,
                eip150Block: 0,
                eip155Block: 0,
                eip158Block: 0,
                byzantiumBlock: 0,
                constantinopleBlock: 0,
                petersburgBlock: 0,
                istanbulBlock: 0,
                muirGlacierBlock: 0,
                subnetEVMTimestamp: 0
            },
            nonce: "0x0",
            timestamp: "0x0",
            extraData: "0x",
            gasLimit: "0x7A1200",
            difficulty: "0x0",
            mixHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
            coinbase: "0x0000000000000000000000000000000000000000",
            alloc: {},
            number: "0x0",
            gasUsed: "0x0",
            parentHash: "0x0000000000000000000000000000000000000000000000000000000000000000"
        };

        // Add initial allocation if token config is provided
        if (subnetData.token?.initialSupply) {
            const supply = (parseFloat(subnetData.token.initialSupply) * Math.pow(10, 18)).toString(16);
            genesis.alloc = {
                "0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC": {
                    balance: `0x${supply}`
                }
            };
        }

        return genesis;
    }

    /**
     * Save subnet configuration files
     */
    async saveSubnetFiles(subnetDir, config) {
        try {
            // Save genesis.json
            await fs.writeJSON(path.join(subnetDir, 'genesis.json'), config.genesis, { spaces: 2 });

            // Save subnet-config.json
            await fs.writeJSON(path.join(subnetDir, 'subnet-config.json'), {
                name: config.basic.name,
                vm: config.basic.vmType,
                genesis: "genesis.json",
                chainId: config.network.chainId,
                subnet: {
                    threshold: Math.max(1, Math.floor(config.validators.maxValidators * 0.6))
                },
                validators: config.validators
            }, { spaces: 2 });

            // Generate deployment script
            const deployScript = this.generateDeployScript(config);
            await fs.writeFile(path.join(subnetDir, 'deploy.sh'), deployScript);
            await fs.chmod(path.join(subnetDir, 'deploy.sh'), '755');

            console.log(`📁 Configuration files saved to: ${subnetDir}`);
        } catch (error) {
            console.error('❌ Error saving subnet files:', error);
            throw error;
        }
    }

    /**
     * Generate deployment script
     */
    generateDeployScript(config) {
        return `#!/bin/bash
# Deployment script for ${config.basic.name}
set -e

echo "🏔️ Deploying ${config.basic.name} subnet..."

# Check Avalanche CLI
if ! command -v avalanche &> /dev/null; then
    echo "❌ Avalanche CLI not found"
    exit 1
fi

# Create and deploy subnet
avalanche subnet create ${config.basic.name} --genesis genesis.json --vm ${config.basic.vmType}
avalanche subnet deploy ${config.basic.name} --local

echo "✅ Deployment completed!"
`;
    }

    /**
     * Execute deployment using Avalanche CLI
     */
    async executeDeployment(subnet, target, autoStart) {
        return new Promise((resolve, reject) => {
            const { spawn } = require('child_process');
            const subnetDir = path.join(process.cwd(), 'subnets', subnet.name);
            
            const command = target === 'local' ? 
                ['subnet', 'deploy', subnet.name, '--local'] :
                ['subnet', 'deploy', subnet.name, `--${target}`];

            const deployment = spawn('avalanche', command, {
                cwd: subnetDir,
                stdio: 'pipe'
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
                    // Parse deployment output for important info
                    const result = this.parseDeploymentOutput(output, target);
                    resolve(result);
                } else {
                    reject(new Error(`Deployment failed with code ${code}: ${output}`));
                }
            });

            deployment.on('error', (error) => {
                reject(new Error(`Deployment process error: ${error.message}`));
            });
        });
    }

    /**
     * Parse deployment output to extract connection info
     */
    parseDeploymentOutput(output, target) {
        const lines = output.split('\n');
        const result = {
            target,
            output: output.trim()
        };

        lines.forEach(line => {
            if (line.includes('RPC URL:')) {
                result.rpcUrl = line.split('RPC URL:')[1]?.trim();
            }
            if (line.includes('Blockchain ID:')) {
                result.blockchainId = line.split('Blockchain ID:')[1]?.trim();
            }
            if (line.includes('Chain ID:')) {
                result.chainId = line.split('Chain ID:')[1]?.trim();
            }
        });

        // Default local RPC URL if not found
        if (target === 'local' && !result.rpcUrl) {
            result.rpcUrl = 'http://localhost:9650/ext/bc/C/rpc';
        }

        return result;
    }
}

module.exports = new SubnetService();
