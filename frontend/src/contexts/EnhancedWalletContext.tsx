/**
 * Enhanced Core Wallet Provider for Avalanche L2 Integration
 * Supports Core Wallet SDK and multiple Avalanche networks
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { WalletContextType } from '../types';
import { 
  AVALANCHE_NETWORKS, 
  DEFAULT_NETWORK, 
  CORE_WALLET_CONFIG,
  getNetworkConfig,
  getGasConfig 
} from '../config/avalanche';

declare global {
  interface Window {
    ethereum?: any;
    avalanche?: any; // Core wallet
  }
}

interface EnhancedWalletProviderProps {
  children: ReactNode;
}

const EnhancedWalletContext = createContext<WalletContextType | undefined>(undefined);

export const EnhancedWalletProvider: React.FC<EnhancedWalletProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(DEFAULT_NETWORK.chainId);
  const [balance, setBalance] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<'core' | 'metamask' | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeWallet();
  }, []);

  // Refresh balance periodically when connected
  useEffect(() => {
    let balanceInterval: NodeJS.Timeout;
    
    if (isConnected && account) {
      // Initial balance update
      updateBalance(account);
      
      // Set up periodic balance refresh (every 30 seconds)
      balanceInterval = setInterval(() => {
        updateBalance(account);
      }, 30000);
    }

    return () => {
      if (balanceInterval) {
        clearInterval(balanceInterval);
      }
    };
  }, [isConnected, account, provider]);

  // Update balance when chain changes
  useEffect(() => {
    if (isConnected && account && chainId) {
      updateBalance(account);
    }
  }, [chainId]);

  const initializeWallet = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Check for Core Wallet first (preferred for Avalanche)
      if (window.avalanche) {
        await setupCoreWallet();
      } else if (window.ethereum && !window.ethereum.isCore) {
        await setupMetaMask();
      } else {
        console.log('No supported wallet found. Please install Core Wallet.');
      }
    } catch (error) {
      console.error('Error initializing wallet:', error);
      setError('Failed to initialize wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const setupCoreWallet = async (): Promise<void> => {
    if (!window.avalanche) return;

    try {
      // Set up event listeners
      window.avalanche.on('accountsChanged', handleAccountsChanged);
      window.avalanche.on('chainChanged', handleChainChanged);
      window.avalanche.on('disconnect', handleDisconnect);

      // Check if already connected
      const accounts = await window.avalanche.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        await connectCoreWallet(accounts[0]);
      }
    } catch (error) {
      console.error('Error setting up Core Wallet:', error);
      throw error;
    }
  };

  const setupMetaMask = async (): Promise<void> => {
    if (!window.ethereum) return;

    try {
      // Set up event listeners
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);

      // Check if already connected
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        await connectMetaMask(accounts[0]);
      }
    } catch (error) {
      console.error('Error setting up MetaMask:', error);
      throw error;
    }
  };

  const connectCoreWallet = async (accountAddress?: string): Promise<void> => {
    try {
      let account = accountAddress;
      
      if (!account) {
        const accounts = await window.avalanche.request({
          method: 'eth_requestAccounts',
        });
        account = accounts[0];
      }

      if (!account) {
        throw new Error('No account found');
      }

      // Create ethers provider for Core Wallet
      const ethersProvider = new ethers.BrowserProvider(window.avalanche);
      const ethersSigner = await ethersProvider.getSigner();

      setAccount(account);
      setProvider(ethersProvider);
      setSigner(ethersSigner);
      setWalletType('core');
      setIsConnected(true);
      
      await updateChainId();
      await updateBalance(account);
      
      console.log('Core Wallet connected:', account);
    } catch (error) {
      console.error('Error connecting Core Wallet:', error);
      throw error;
    }
  };

  const connectMetaMask = async (accountAddress?: string): Promise<void> => {
    try {
      let account = accountAddress;
      
      if (!account) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        account = accounts[0];
      }

      if (!account) {
        throw new Error('No account found');
      }

      // Create ethers provider for MetaMask
      const ethersProvider = new ethers.BrowserProvider(window.ethereum);
      const ethersSigner = await ethersProvider.getSigner();

      setAccount(account);
      setProvider(ethersProvider);
      setSigner(ethersSigner);
      setWalletType('metamask');
      setIsConnected(true);
      
      await updateChainId();
      await updateBalance(account);
      
      console.log('MetaMask connected:', account);
    } catch (error) {
      console.error('Error connecting MetaMask:', error);
      throw error;
    }
  };

  const connect = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Prefer Core Wallet for Avalanche L2
      if (window.avalanche) {
        await connectCoreWallet();
      } else if (window.ethereum && !window.ethereum.isCore) {
        await connectMetaMask();
      } else {
        throw new Error('No supported wallet found. Please install Core Wallet for the best Avalanche experience.');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect wallet');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = (): void => {
    // Clean up event listeners
    if (window.avalanche) {
      window.avalanche.removeAllListeners();
    }
    if (window.ethereum) {
      window.ethereum.removeAllListeners();
    }

    setIsConnected(false);
    setAccount(null);
    setChainId(null);
    setBalance(null);
    setProvider(null);
    setSigner(null);
    setWalletType(null);
    setError(null);
  };

  const switchNetwork = async (targetChainId: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const networkConfig = getNetworkConfig(targetChainId);
      if (!networkConfig) {
        throw new Error(`Unsupported network: ${targetChainId}`);
      }

      const walletProvider = walletType === 'core' ? window.avalanche : window.ethereum;
      if (!walletProvider) {
        throw new Error('No wallet provider available');
      }

      try {
        // Try to switch to the network
        await walletProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${targetChainId.toString(16)}` }],
        });
      } catch (switchError: any) {
        // If network doesn't exist, add it
        if (switchError.code === 4902) {
          await walletProvider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${targetChainId.toString(16)}`,
              chainName: networkConfig.displayName,
              nativeCurrency: networkConfig.nativeCurrency,
              rpcUrls: networkConfig.rpcUrls,
              blockExplorerUrls: networkConfig.blockExplorerUrls,
            }],
          });
        } else {
          throw switchError;
        }
      }
    } catch (error) {
      console.error('Error switching network:', error);
      setError(error instanceof Error ? error.message : 'Failed to switch network');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addAvalancheNetwork = async (networkKey: string): Promise<void> => {
    const network = AVALANCHE_NETWORKS[networkKey];
    if (!network) {
      throw new Error(`Network ${networkKey} not found`);
    }

    await switchNetwork(network.chainId);
  };

  const updateChainId = async (): Promise<void> => {
    try {
      const walletProvider = walletType === 'core' ? window.avalanche : window.ethereum;
      if (walletProvider) {
        const chainId = await walletProvider.request({ method: 'eth_chainId' });
        setChainId(parseInt(chainId, 16));
      }
    } catch (error) {
      console.error('Error updating chain ID:', error);
    }
  };

  const updateBalance = async (accountAddress: string): Promise<void> => {
    try {
      if (provider && accountAddress) {
        console.log('Updating balance for:', accountAddress);
        const balance = await provider.getBalance(accountAddress);
        const balanceInEth = ethers.formatEther(balance);
        const formattedBalance = parseFloat(balanceInEth).toFixed(4);
        console.log('Balance updated:', formattedBalance, 'AVAX');
        setBalance(formattedBalance);
      }
    } catch (error) {
      console.error('Error updating balance:', error);
      setBalance('0.0000'); // Set fallback balance
    }
  };

  const refreshBalance = async (): Promise<void> => {
    if (account) {
      await updateBalance(account);
    }
  };

  const handleAccountsChanged = (accounts: string[]): void => {
    if (accounts.length === 0) {
      disconnect();
    } else {
      setAccount(accounts[0]);
      updateBalance(accounts[0]);
    }
  };

  const handleChainChanged = (chainId: string): void => {
    const newChainId = parseInt(chainId, 16);
    setChainId(newChainId);
    
    // Update provider for new chain
    if (account) {
      updateBalance(account);
    }
  };

  const handleDisconnect = (): void => {
    disconnect();
  };

  // Enhanced utility functions for L2 support
  const getCurrentNetwork = () => {
    return chainId ? getNetworkConfig(chainId) : null;
  };

  const getGasConfiguration = () => {
    return chainId ? getGasConfig(chainId) : null;
  };

  const estimateGas = async (transaction: any) => {
    if (!provider) throw new Error('No provider available');
    return await provider.estimateGas(transaction);
  };

  const sendTransaction = async (transaction: any) => {
    if (!signer) throw new Error('No signer available');
    return await signer.sendTransaction(transaction);
  };

  const value: WalletContextType & {
    provider?: ethers.BrowserProvider | null;
    signer?: ethers.JsonRpcSigner | null;
    isLoading?: boolean;
    error?: string | null;
    getCurrentNetwork?: () => any;
    getGasConfiguration?: () => any;
    estimateGas?: (transaction: any) => Promise<bigint>;
    sendTransaction?: (transaction: any) => Promise<ethers.TransactionResponse>;
    addAvalancheNetwork?: (networkKey: string) => Promise<void>;
    refreshBalance?: () => Promise<void>;
  } = {
    isConnected,
    account,
    chainId,
    balance,
    connect,
    disconnect,
    switchNetwork,
    walletType,
    provider,
    signer,
    isLoading,
    error,
    getCurrentNetwork,
    getGasConfiguration,
    estimateGas,
    sendTransaction,
    addAvalancheNetwork,
    refreshBalance,
  };

  return (
    <EnhancedWalletContext.Provider value={value}>
      {children}
    </EnhancedWalletContext.Provider>
  );
};

export const useEnhancedWallet = () => {
  const context = useContext(EnhancedWalletContext);
  if (context === undefined) {
    throw new Error('useEnhancedWallet must be used within an EnhancedWalletProvider');
  }
  return context;
};