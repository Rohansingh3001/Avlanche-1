import { ethers } from 'ethers';

class Web3Service {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.accounts = [];
        this.isConnected = false;
        this.chainId = null;
        this.networkName = null;
    }

    /**
     * Check if MetaMask or compatible wallet is available
     */
    isWalletAvailable() {
        return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
    }

    /**
     * Connect to wallet (MetaMask)
     */
    async connectWallet() {
        if (!this.isWalletAvailable()) {
            throw new Error('MetaMask or compatible wallet not found. Please install MetaMask.');
        }

        try {
            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            if (accounts.length === 0) {
                throw new Error('No accounts found. Please make sure your wallet is unlocked.');
            }

            // Initialize provider and signer
            this.provider = new ethers.BrowserProvider(window.ethereum);
            this.signer = await this.provider.getSigner();
            this.accounts = accounts;
            this.isConnected = true;

            // Get network info
            const network = await this.provider.getNetwork();
            this.chainId = Number(network.chainId);
            this.networkName = network.name;

            console.log('✅ Wallet connected:', {
                address: accounts[0],
                chainId: this.chainId,
                network: this.networkName
            });

            return {
                address: accounts[0],
                chainId: this.chainId,
                network: this.networkName
            };

        } catch (error) {
            console.error('❌ Wallet connection failed:', error);
            throw new Error(`Failed to connect wallet: ${error.message}`);
        }
    }

    /**
     * Disconnect wallet
     */
    async disconnectWallet() {
        this.provider = null;
        this.signer = null;
        this.accounts = [];
        this.isConnected = false;
        this.chainId = null;
        this.networkName = null;

        console.log('🔌 Wallet disconnected');
    }

    /**
     * Get current account
     */
    getCurrentAccount() {
        return this.accounts.length > 0 ? this.accounts[0] : null;
    }

    /**
     * Get account balance
     */
    async getBalance(address = null) {
        if (!this.provider) {
            throw new Error('Provider not initialized');
        }

        const targetAddress = address || this.getCurrentAccount();
        if (!targetAddress) {
            throw new Error('No address provided');
        }

        try {
            const balance = await this.provider.getBalance(targetAddress);
            return ethers.formatEther(balance);
        } catch (error) {
            console.error('❌ Error getting balance:', error);
            throw error;
        }
    }

    /**
     * Switch to specific network
     */
    async switchNetwork(chainId, networkConfig = null) {
        if (!this.isWalletAvailable()) {
            throw new Error('Wallet not available');
        }

        try {
            // Try to switch to the network
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${chainId.toString(16)}` }],
            });

            // Update local state
            this.chainId = chainId;
            const network = await this.provider.getNetwork();
            this.networkName = network.name;

            console.log(`✅ Switched to network: ${chainId}`);
            return true;

        } catch (switchError) {
            // Network doesn't exist, try to add it
            if (switchError.code === 4902 && networkConfig) {
                try {
                    await this.addNetwork(networkConfig);
                    return true;
                } catch (addError) {
                    console.error('❌ Failed to add network:', addError);
                    throw addError;
                }
            } else {
                console.error('❌ Failed to switch network:', switchError);
                throw switchError;
            }
        }
    }

    /**
     * Add custom network to wallet
     */
    async addNetwork(networkConfig) {
        if (!this.isWalletAvailable()) {
            throw new Error('Wallet not available');
        }

        try {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [networkConfig],
            });

            console.log('✅ Network added successfully');
        } catch (error) {
            console.error('❌ Failed to add network:', error);
            throw error;
        }
    }

    /**
     * Create network configuration for Avalanche subnet
     */
    createSubnetNetworkConfig(subnetData) {
        return {
            chainId: `0x${subnetData.chainId.toString(16)}`,
            chainName: subnetData.name,
            nativeCurrency: {
                name: subnetData.token?.name || 'Subnet Token',
                symbol: subnetData.token?.symbol || 'SUB',
                decimals: parseInt(subnetData.token?.decimals) || 18,
            },
            rpcUrls: [subnetData.rpcUrl],
            blockExplorerUrls: subnetData.explorerUrl ? [subnetData.explorerUrl] : [],
        };
    }

    /**
     * Get contract instance
     */
    getContract(address, abi, needSigner = false) {
        if (!this.provider) {
            throw new Error('Provider not initialized');
        }

        const contractInterface = needSigner && this.signer ? this.signer : this.provider;
        return new ethers.Contract(address, abi, contractInterface);
    }

    /**
     * Deploy contract
     */
    async deployContract(abi, bytecode, constructorArgs = [], options = {}) {
        if (!this.signer) {
            throw new Error('Signer not available. Please connect your wallet.');
        }

        try {
            const factory = new ethers.ContractFactory(abi, bytecode, this.signer);
            const contract = await factory.deploy(...constructorArgs, options);
            await contract.waitForDeployment();

            const address = await contract.getAddress();
            const deploymentTx = contract.deploymentTransaction();

            console.log('✅ Contract deployed:', {
                address,
                transactionHash: deploymentTx.hash
            });

            return {
                contract,
                address,
                transactionHash: deploymentTx.hash
            };

        } catch (error) {
            console.error('❌ Contract deployment failed:', error);
            throw error;
        }
    }

    /**
     * Send transaction
     */
    async sendTransaction(to, value = '0', data = '0x') {
        if (!this.signer) {
            throw new Error('Signer not available. Please connect your wallet.');
        }

        try {
            const tx = await this.signer.sendTransaction({
                to,
                value: ethers.parseEther(value.toString()),
                data,
            });

            console.log('📤 Transaction sent:', tx.hash);
            return tx;

        } catch (error) {
            console.error('❌ Transaction failed:', error);
            throw error;
        }
    }

    /**
     * Wait for transaction confirmation
     */
    async waitForTransaction(txHash, confirmations = 1) {
        if (!this.provider) {
            throw new Error('Provider not initialized');
        }

        try {
            const receipt = await this.provider.waitForTransaction(txHash, confirmations);
            console.log('✅ Transaction confirmed:', receipt);
            return receipt;
        } catch (error) {
            console.error('❌ Transaction confirmation failed:', error);
            throw error;
        }
    }

    /**
     * Get gas price
     */
    async getGasPrice() {
        if (!this.provider) {
            throw new Error('Provider not initialized');
        }

        try {
            const feeData = await this.provider.getFeeData();
            return {
                gasPrice: feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') : null,
                maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') : null,
                maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') : null,
            };
        } catch (error) {
            console.error('❌ Error getting gas price:', error);
            throw error;
        }
    }

    /**
     * Estimate gas for transaction
     */
    async estimateGas(to, data = '0x', value = '0') {
        if (!this.provider) {
            throw new Error('Provider not initialized');
        }

        try {
            const gasEstimate = await this.provider.estimateGas({
                to,
                data,
                value: ethers.parseEther(value.toString()),
            });

            return gasEstimate.toString();
        } catch (error) {
            console.error('❌ Gas estimation failed:', error);
            throw error;
        }
    }

    /**
     * Get transaction receipt
     */
    async getTransactionReceipt(txHash) {
        if (!this.provider) {
            throw new Error('Provider not initialized');
        }

        try {
            return await this.provider.getTransactionReceipt(txHash);
        } catch (error) {
            console.error('❌ Error getting transaction receipt:', error);
            throw error;
        }
    }

    /**
     * Get block information
     */
    async getBlock(blockNumber = 'latest') {
        if (!this.provider) {
            throw new Error('Provider not initialized');
        }

        try {
            return await this.provider.getBlock(blockNumber);
        } catch (error) {
            console.error('❌ Error getting block:', error);
            throw error;
        }
    }

    /**
     * Listen for account changes
     */
    onAccountsChanged(callback) {
        if (this.isWalletAvailable()) {
            window.ethereum.on('accountsChanged', (accounts) => {
                this.accounts = accounts;
                this.isConnected = accounts.length > 0;
                callback(accounts);
            });
        }
    }

    /**
     * Listen for network changes
     */
    onChainChanged(callback) {
        if (this.isWalletAvailable()) {
            window.ethereum.on('chainChanged', (chainId) => {
                this.chainId = parseInt(chainId, 16);
                callback(this.chainId);
            });
        }
    }

    /**
     * Remove event listeners
     */
    removeListeners() {
        if (this.isWalletAvailable()) {
            window.ethereum.removeAllListeners('accountsChanged');
            window.ethereum.removeAllListeners('chainChanged');
        }
    }

    /**
     * Format address for display
     */
    formatAddress(address, length = 4) {
        if (!address) return '';
        return `${address.slice(0, 2 + length)}...${address.slice(-length)}`;
    }

    /**
     * Validate Ethereum address
     */
    isValidAddress(address) {
        try {
            return ethers.isAddress(address);
        } catch {
            return false;
        }
    }

    /**
     * Create provider for specific RPC URL
     */
    createProvider(rpcUrl) {
        return new ethers.JsonRpcProvider(rpcUrl);
    }

    /**
     * Sign message
     */
    async signMessage(message) {
        if (!this.signer) {
            throw new Error('Signer not available. Please connect your wallet.');
        }

        try {
            const signature = await this.signer.signMessage(message);
            console.log('✅ Message signed');
            return signature;
        } catch (error) {
            console.error('❌ Message signing failed:', error);
            throw error;
        }
    }

    /**
     * Verify message signature
     */
    verifyMessage(message, signature, address) {
        try {
            const recoveredAddress = ethers.verifyMessage(message, signature);
            return recoveredAddress.toLowerCase() === address.toLowerCase();
        } catch (error) {
            console.error('❌ Message verification failed:', error);
            return false;
        }
    }
}

// Create singleton instance
const web3Service = new Web3Service();

export default web3Service;
