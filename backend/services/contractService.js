const solc = require('solc');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const DatabaseService = require('./databaseService');
const SubnetService = require('./subnetService');

class ContractService {
    constructor() {
        this.compiledContracts = new Map();
        this.contractInstances = new Map();
    }

    /**
     * Get all contracts
     */
    async getContracts(options = {}) {
        const { subnetId, status } = options;
        
        try {
            let query = 'SELECT * FROM contracts';
            const params = [];
            const conditions = [];

            if (subnetId) {
                conditions.push('subnet_id = ?');
                params.push(subnetId);
            }

            if (status) {
                conditions.push('status = ?');
                params.push(status);
            }

            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }

            query += ' ORDER BY created_at DESC';

            const contracts = await DatabaseService.query(query, params);

            return contracts.map(contract => ({
                ...contract,
                abi: contract.abi ? JSON.parse(contract.abi) : null,
                source_code: contract.source_code || null
            }));
        } catch (error) {
            console.error('❌ Error fetching contracts:', error);
            throw new Error('Failed to fetch contracts from database');
        }
    }

    /**
     * Get contract by ID
     */
    async getContractById(id) {
        try {
            const [contract] = await DatabaseService.query(
                'SELECT * FROM contracts WHERE id = ?',
                [id]
            );

            if (!contract) {
                return null;
            }

            return {
                ...contract,
                abi: contract.abi ? JSON.parse(contract.abi) : null,
                source_code: contract.source_code || null
            };
        } catch (error) {
            console.error('❌ Error fetching contract by ID:', error);
            throw new Error('Failed to fetch contract');
        }
    }

    /**
     * Upload contract source code
     */
    async uploadContract(contractData) {
        const id = uuidv4();
        const timestamp = new Date().toISOString();

        try {
            await DatabaseService.query(`
                INSERT INTO contracts (
                    id, subnet_id, name, source_code, status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?)
            `, [
                id,
                contractData.subnetId,
                contractData.name,
                contractData.sourceCode,
                'uploaded',
                timestamp
            ]);

            console.log(`✅ Contract ${contractData.name} uploaded with ID: ${id}`);

            return {
                id,
                subnet_id: contractData.subnetId,
                name: contractData.name,
                source_code: contractData.sourceCode,
                status: 'uploaded',
                created_at: timestamp
            };
        } catch (error) {
            console.error('❌ Error uploading contract:', error);
            throw error;
        }
    }

    /**
     * Compile contract source code
     */
    async compileContract(sourceCode, contractName, compilerVersion = '0.8.21') {
        try {
            // Prepare Solidity input
            const input = {
                language: 'Solidity',
                sources: {
                    'contract.sol': {
                        content: sourceCode
                    }
                },
                settings: {
                    outputSelection: {
                        '*': {
                            '*': ['abi', 'evm.bytecode', 'evm.deployedBytecode', 'devdoc', 'userdoc']
                        }
                    },
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            };

            // Load compiler
            const compiler = await this.loadCompiler(compilerVersion);
            
            // Compile
            const output = JSON.parse(compiler.compile(JSON.stringify(input)));

            // Check for errors
            if (output.errors) {
                const errors = output.errors.filter(error => error.severity === 'error');
                if (errors.length > 0) {
                    throw new Error(`Compilation failed: ${errors.map(e => e.formattedMessage).join('\n')}`);
                }
            }

            // Extract compilation results
            const contracts = output.contracts['contract.sol'];
            const results = {};

            for (const [name, contract] of Object.entries(contracts)) {
                if (!contractName || name === contractName) {
                    results[name] = {
                        abi: contract.abi,
                        bytecode: contract.evm.bytecode.object,
                        deployedBytecode: contract.evm.deployedBytecode.object,
                        devdoc: contract.devdoc,
                        userdoc: contract.userdoc,
                        gasEstimates: contract.evm.gasEstimates
                    };
                }
            }

            if (Object.keys(results).length === 0) {
                throw new Error(`No contract found with name: ${contractName}`);
            }

            console.log(`✅ Contract compiled successfully: ${Object.keys(results).join(', ')}`);

            return {
                success: true,
                compilerVersion,
                contracts: results,
                warnings: output.errors?.filter(error => error.severity === 'warning') || []
            };

        } catch (error) {
            console.error('❌ Compilation error:', error);
            throw new Error(`Compilation failed: ${error.message}`);
        }
    }

    /**
     * Load Solidity compiler
     */
    async loadCompiler(version) {
        try {
            // Use solc.loadRemoteVersion for specific versions
            return new Promise((resolve, reject) => {
                solc.loadRemoteVersion(version, (err, solcSnapshot) => {
                    if (err) {
                        reject(new Error(`Failed to load compiler version ${version}: ${err.message}`));
                    } else {
                        resolve(solcSnapshot);
                    }
                });
            });
        } catch (error) {
            console.error('❌ Error loading compiler:', error);
            throw error;
        }
    }

    /**
     * Deploy compiled contract
     */
    async deployContract(contractId, constructorArgs = [], options = {}) {
        try {
            const contract = await this.getContractById(contractId);
            if (!contract) {
                throw new Error('Contract not found');
            }

            if (!contract.abi || !contract.bytecode) {
                throw new Error('Contract must be compiled before deployment');
            }

            // Get subnet provider
            const provider = await SubnetService.getProvider(contract.subnet_id);
            
            // For now, this is a placeholder for actual deployment
            // In a real implementation, you would need wallet integration
            const deploymentTx = await this.simulateDeployment(contract, constructorArgs, options);

            // Update contract in database
            await DatabaseService.query(`
                UPDATE contracts 
                SET address = ?, deployment_tx = ?, status = ?, deployed_at = ?
                WHERE id = ?
            `, [
                deploymentTx.contractAddress,
                deploymentTx.transactionHash,
                'deployed',
                new Date().toISOString(),
                contractId
            ]);

            console.log(`✅ Contract ${contract.name} deployed at: ${deploymentTx.contractAddress}`);

            return {
                contractId,
                address: deploymentTx.contractAddress,
                transactionHash: deploymentTx.transactionHash,
                gasUsed: deploymentTx.gasUsed,
                status: 'deployed'
            };

        } catch (error) {
            // Update contract status to failed
            await DatabaseService.query(
                'UPDATE contracts SET status = ? WHERE id = ?',
                ['failed', contractId]
            );

            console.error('❌ Deployment error:', error);
            throw error;
        }
    }

    /**
     * Simulate contract deployment (placeholder)
     */
    async simulateDeployment(contract, constructorArgs, options) {
        // This is a simulation - in real implementation, you would use ethers.js
        const contractAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
        const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        
        return {
            contractAddress,
            transactionHash,
            gasUsed: '500000',
            blockNumber: Math.floor(Math.random() * 1000000)
        };
    }

    /**
     * Interact with deployed contract
     */
    async interactWithContract(contractId, method, args = [], value = 0) {
        try {
            const contract = await this.getContractById(contractId);
            if (!contract) {
                throw new Error('Contract not found');
            }

            if (contract.status !== 'deployed') {
                throw new Error('Contract is not deployed');
            }

            // Simulate contract interaction
            const result = await this.simulateContractCall(contract, method, args, value);

            console.log(`✅ Contract interaction successful: ${method}`);

            return {
                method,
                args,
                result,
                transactionHash: result.transactionHash || null,
                gasUsed: result.gasUsed || null
            };

        } catch (error) {
            console.error('❌ Contract interaction error:', error);
            throw error;
        }
    }

    /**
     * Simulate contract interaction (placeholder)
     */
    async simulateContractCall(contract, method, args, value) {
        // This is a simulation - in real implementation, you would use ethers.js
        const abi = JSON.parse(contract.abi);
        const methodAbi = abi.find(item => item.name === method);

        if (!methodAbi) {
            throw new Error(`Method ${method} not found in contract ABI`);
        }

        // Simulate different types of calls
        if (methodAbi.stateMutability === 'view' || methodAbi.stateMutability === 'pure') {
            // View/pure functions don't modify state
            return {
                type: 'call',
                result: this.generateMockResult(methodAbi.outputs),
                gasUsed: null,
                transactionHash: null
            };
        } else {
            // State-changing functions
            return {
                type: 'transaction',
                result: null,
                gasUsed: '50000',
                transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`
            };
        }
    }

    /**
     * Generate mock result for view functions
     */
    generateMockResult(outputs) {
        if (!outputs || outputs.length === 0) {
            return null;
        }

        if (outputs.length === 1) {
            return this.generateMockValue(outputs[0].type);
        }

        return outputs.map(output => this.generateMockValue(output.type));
    }

    /**
     * Generate mock value based on type
     */
    generateMockValue(type) {
        if (type.includes('uint')) {
            return Math.floor(Math.random() * 1000000).toString();
        } else if (type.includes('int')) {
            return Math.floor(Math.random() * 1000000 - 500000).toString();
        } else if (type === 'bool') {
            return Math.random() > 0.5;
        } else if (type === 'address') {
            return `0x${Math.random().toString(16).substr(2, 40)}`;
        } else if (type === 'string') {
            return 'Mock string result';
        } else if (type === 'bytes' || type.startsWith('bytes')) {
            return `0x${Math.random().toString(16).substr(2, 32)}`;
        }
        return 'Unknown type';
    }

    /**
     * Get contract ABI
     */
    async getContractABI(contractId) {
        try {
            const contract = await this.getContractById(contractId);
            if (!contract) {
                throw new Error('Contract not found');
            }

            return contract.abi;
        } catch (error) {
            console.error('❌ Error getting contract ABI:', error);
            throw error;
        }
    }

    /**
     * Get contract events (placeholder)
     */
    async getContractEvents(contractId, fromBlock = 'earliest', toBlock = 'latest') {
        try {
            const contract = await this.getContractById(contractId);
            if (!contract) {
                throw new Error('Contract not found');
            }

            // Simulate events
            const mockEvents = [
                {
                    event: 'Transfer',
                    args: {
                        from: `0x${Math.random().toString(16).substr(2, 40)}`,
                        to: `0x${Math.random().toString(16).substr(2, 40)}`,
                        value: '1000000000000000000'
                    },
                    blockNumber: 12345,
                    transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`
                }
            ];

            return mockEvents;
        } catch (error) {
            console.error('❌ Error getting contract events:', error);
            throw error;
        }
    }

    /**
     * Update contract
     */
    async updateContract(contractId, updateData) {
        try {
            const contract = await this.getContractById(contractId);
            if (!contract) {
                throw new Error('Contract not found');
            }

            const updateFields = [];
            const updateValues = [];
            
            // Build dynamic update query
            Object.keys(updateData).forEach(key => {
                if (updateData[key] !== undefined) {
                    updateFields.push(`${key} = ?`);
                    updateValues.push(updateData[key]);
                }
            });
            
            if (updateFields.length === 0) {
                throw new Error('No fields to update');
            }
            
            updateFields.push('updated_at = ?');
            updateValues.push(new Date().toISOString());
            updateValues.push(contractId);

            const query = `UPDATE contracts SET ${updateFields.join(', ')} WHERE id = ?`;
            await DatabaseService.query(query, updateValues);

            console.log(`✅ Contract ${contract.name} updated successfully`);
            
            return await this.getContractById(contractId);
        } catch (error) {
            console.error('❌ Error updating contract:', error);
            throw error;
        }
    }

    /**
     * Delete contract
     */
    async deleteContract(contractId) {
        try {
            const contract = await this.getContractById(contractId);
            if (!contract) {
                throw new Error('Contract not found');
            }

            await DatabaseService.query('DELETE FROM contracts WHERE id = ?', [contractId]);

            console.log(`🗑️ Contract ${contract.name} deleted successfully`);
        } catch (error) {
            console.error('❌ Error deleting contract:', error);
            throw error;
        }
    }

    /**
     * Get contract templates
     */
    async getContractTemplates() {
        const templates = [
            {
                name: 'ERC20 Token',
                description: 'Standard ERC20 token implementation',
                category: 'Tokens',
                sourceCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("MyToken", "MTK") {
        _mint(msg.sender, initialSupply);
    }
}`
            },
            {
                name: 'NFT Collection',
                description: 'ERC721 NFT collection with minting',
                category: 'NFT',
                sourceCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721, Ownable {
    uint256 private _nextTokenId = 1;

    constructor() ERC721("MyNFT", "MNFT") {}

    function mint(address to) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _mint(to, tokenId);
    }
}`
            },
            {
                name: 'Simple Storage',
                description: 'Basic contract for storing and retrieving data',
                category: 'Storage',
                sourceCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleStorage {
    uint256 private storedData;

    function set(uint256 x) public {
        storedData = x;
    }

    function get() public view returns (uint256) {
        return storedData;
    }
}`
            }
        ];

        return templates;
    }
}

module.exports = new ContractService();
