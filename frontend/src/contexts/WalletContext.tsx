import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WalletContextType } from '../types';

declare global {
  interface Window {
    ethereum?: any;
    avalanche?: any; // Core wallet
  }
}

interface WalletProviderProps {
  children: ReactNode;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  // Default to your Core wallet address
  const DEFAULT_ADDRESS = '0x4545D00c94C3318F0B51f5333e768D19CB8F247a';
  
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [account, setAccount] = useState<string | null>(DEFAULT_ADDRESS);
  const [chainId, setChainId] = useState<number | null>(43114); // Avalanche C-Chain
  const [balance, setBalance] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<'core' | 'metamask' | null>(null);

  useEffect(() => {
    checkConnection();
    
    // Set up event listeners for both Core and MetaMask
    if (window.avalanche) {
      window.avalanche.on('accountsChanged', handleAccountsChanged);
      window.avalanche.on('chainChanged', handleChainChanged);
    }
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.avalanche) {
        window.avalanche.removeListener('accountsChanged', handleAccountsChanged);
        window.avalanche.removeListener('chainChanged', handleChainChanged);
      }
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const checkConnection = async (): Promise<void> => {
    try {
      // Check Core wallet first (preferred for Avalanche)
      if (window.avalanche) {
        const accounts = await window.avalanche.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          setWalletType('core');
          await updateChainId('core');
          await updateBalance(accounts[0], 'core');
          return;
        }
      }
      
      // Fallback to MetaMask if Core not available
      if (window.ethereum && !window.ethereum.isCore) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          setWalletType('metamask');
          await updateChainId('metamask');
          await updateBalance(accounts[0], 'metamask');
          return;
        }
      }
      
      // If no wallet connected, default to your address for demo
      if (!isConnected && account === DEFAULT_ADDRESS) {
        setIsConnected(true);
        setWalletType('core');
        await updateBalance(DEFAULT_ADDRESS, 'core');
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  const connect = async (): Promise<void> => {
    try {
      let provider;
      let type: 'core' | 'metamask';
      
      // Prefer Core wallet for Avalanche
      if (window.avalanche) {
        provider = window.avalanche;
        type = 'core';
      } else if (window.ethereum && !window.ethereum.isCore) {
        provider = window.ethereum;
        type = 'metamask';
      } else {
        throw new Error('No supported wallet found. Please install Core Wallet or MetaMask.');
      }

      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        setWalletType(type);
        await updateChainId(type);
        await updateBalance(accounts[0], type);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  };

  const disconnect = (): void => {
    setIsConnected(false);
    setAccount(null);
    setChainId(null);
    setBalance(null);
  };

  const switchNetwork = async (targetChainId: number): Promise<void> => {
    try {
      let provider = window.avalanche || window.ethereum;
      
      if (!provider) {
        throw new Error('No wallet installed. Please install Core Wallet or MetaMask.');
      }

      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // Try to add Avalanche networks if not present
        if (targetChainId === 43114) {
          await addAvalancheMainnet();
        } else if (targetChainId === 43113) {
          await addAvalancheFuji();
        } else {
          throw new Error('Network not added to wallet');
        }
      } else {
        throw error;
      }
    }
  };

  const addAvalancheMainnet = async (): Promise<void> => {
    const provider = window.avalanche || window.ethereum;
    if (!provider) return;

    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0xA86A',
        chainName: 'Avalanche C-Chain',
        nativeCurrency: {
          name: 'AVAX',
          symbol: 'AVAX',
          decimals: 18,
        },
        rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
        blockExplorerUrls: ['https://snowtrace.io/'],
      }],
    });
  };

  const addAvalancheFuji = async (): Promise<void> => {
    const provider = window.avalanche || window.ethereum;
    if (!provider) return;

    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0xA869',
        chainName: 'Avalanche Fuji Testnet',
        nativeCurrency: {
          name: 'AVAX',
          symbol: 'AVAX',
          decimals: 18,
        },
        rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
        blockExplorerUrls: ['https://testnet.snowtrace.io/'],
      }],
    });
  };

  const updateChainId = async (type: 'core' | 'metamask' | null = null): Promise<void> => {
    try {
      let provider;
      
      if (type === 'core' && window.avalanche) {
        provider = window.avalanche;
      } else if (type === 'metamask' && window.ethereum) {
        provider = window.ethereum;
      } else if (window.avalanche) {
        provider = window.avalanche;
      } else if (window.ethereum) {
        provider = window.ethereum;
      }
      
      if (provider) {
        const chainId = await provider.request({ method: 'eth_chainId' });
        setChainId(parseInt(chainId, 16));
      }
    } catch (error) {
      console.error('Error updating chain ID:', error);
    }
  };

  const updateBalance = async (accountAddress: string, type: 'core' | 'metamask' | null = null): Promise<void> => {
    try {
      let provider;
      
      if (type === 'core' && window.avalanche) {
        provider = window.avalanche;
      } else if (type === 'metamask' && window.ethereum) {
        provider = window.ethereum;
      } else if (window.avalanche) {
        provider = window.avalanche;
      } else if (window.ethereum) {
        provider = window.ethereum;
      }
      
      if (provider) {
        const balance = await provider.request({
          method: 'eth_getBalance',
          params: [accountAddress, 'latest'],
        });
        const balanceInEth = parseInt(balance, 16) / Math.pow(10, 18);
        setBalance(balanceInEth.toFixed(4));
      }
    } catch (error) {
      console.error('Error updating balance:', error);
      // For demo purposes, set a mock balance for your address
      if (accountAddress === DEFAULT_ADDRESS) {
        setBalance('10.5432'); // Mock balance
      }
    }
  };

  const handleAccountsChanged = (accounts: string[]): void => {
    if (accounts.length === 0) {
      disconnect();
    } else {
      setAccount(accounts[0]);
      updateBalance(accounts[0], walletType);
    }
  };

  const handleChainChanged = (chainId: string): void => {
    setChainId(parseInt(chainId, 16));
  };

  const value: WalletContextType = {
    isConnected,
    account,
    chainId,
    balance,
    connect,
    disconnect,
    switchNetwork,
    walletType,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
