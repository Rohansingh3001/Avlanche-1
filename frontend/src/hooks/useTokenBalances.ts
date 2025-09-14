import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useEnhancedWallet } from '../contexts/EnhancedWalletContext';

// ERC-20 Token ABI (minimal for balance checking)
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
];

interface TokenBalance {
  symbol: string;
  balance: string;
  decimals: number;
  isLoading: boolean;
  error?: string;
}

interface TokenContract {
  address: string;
  symbol: string;
  name: string;
  decimals?: number;
}

// Common Avalanche tokens
const AVALANCHE_TOKENS: TokenContract[] = [
  {
    address: '0x5425890298aed601595a70AB815c96711a31Bc65', // USDC on Fuji
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
  },
  {
    address: '0x1D308089a2D1Ced3f1Ce36B1FcaF815b07217be3', // WAVAX on Fuji
    symbol: 'WAVAX',
    name: 'Wrapped AVAX',
    decimals: 18,
  },
];

export const useTokenBalances = (customTokens: TokenContract[] = []) => {
  const { provider, account, chainId, isConnected } = useEnhancedWallet();
  const [balances, setBalances] = useState<Record<string, TokenBalance>>({});
  const [isLoading, setIsLoading] = useState(false);

  const allTokens = [...AVALANCHE_TOKENS, ...customTokens];

  const fetchTokenBalance = async (token: TokenContract): Promise<TokenBalance> => {
    if (!provider || !account) {
      return {
        symbol: token.symbol,
        balance: '0',
        decimals: token.decimals || 18,
        isLoading: false,
        error: 'No provider or account',
      };
    }

    try {
      const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
      
      // Get balance and decimals
      const [balance, decimals] = await Promise.all([
        contract.balanceOf(account),
        token.decimals ? Promise.resolve(token.decimals) : contract.decimals(),
      ]);

      const formattedBalance = ethers.formatUnits(balance, decimals);
      
      return {
        symbol: token.symbol,
        balance: parseFloat(formattedBalance).toFixed(4),
        decimals: Number(decimals),
        isLoading: false,
      };
    } catch (error) {
      console.error(`Error fetching ${token.symbol} balance:`, error);
      return {
        symbol: token.symbol,
        balance: '0',
        decimals: token.decimals || 18,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  const fetchAllBalances = async () => {
    if (!isConnected || !provider || !account) {
      return;
    }

    setIsLoading(true);
    
    // Set loading state for all tokens
    const loadingBalances: Record<string, TokenBalance> = {};
    allTokens.forEach(token => {
      loadingBalances[token.symbol] = {
        symbol: token.symbol,
        balance: '0',
        decimals: token.decimals || 18,
        isLoading: true,
      };
    });
    setBalances(loadingBalances);

    try {
      // Fetch all token balances in parallel
      const balancePromises = allTokens.map(token => fetchTokenBalance(token));
      const tokenBalances = await Promise.all(balancePromises);

      // Convert array to object
      const balanceMap: Record<string, TokenBalance> = {};
      tokenBalances.forEach(balance => {
        balanceMap[balance.symbol] = balance;
      });

      setBalances(balanceMap);
    } catch (error) {
      console.error('Error fetching token balances:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshBalances = () => {
    fetchAllBalances();
  };

  // Fetch balances when wallet connects or changes
  useEffect(() => {
    if (isConnected && account) {
      fetchAllBalances();
    } else {
      setBalances({});
    }
  }, [isConnected, account, chainId]);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      fetchAllBalances();
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [isConnected, account, chainId]);

  return {
    balances,
    isLoading,
    refreshBalances,
    fetchTokenBalance,
  };
};

export const useNativeBalance = () => {
  const { provider, account, balance, refreshBalance } = useEnhancedWallet();
  
  return {
    balance: balance || '0.0000',
    symbol: 'AVAX',
    refresh: refreshBalance,
    isLoading: false,
  };
};

export default useTokenBalances;