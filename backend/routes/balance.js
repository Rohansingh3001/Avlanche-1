const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');

// RPC endpoints for different networks
const RPC_ENDPOINTS = {
  43114: 'https://api.avax.network/ext/bc/C/rpc', // Avalanche C-Chain
  43113: 'https://api.avax-test.network/ext/bc/C/rpc', // Fuji Testnet
};

// ERC-20 Token ABI for balance checking
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
];

// Common token addresses
const TOKEN_ADDRESSES = {
  43113: { // Fuji Testnet
    'USDC': '0x5425890298aed601595a70AB815c96711a31Bc65',
    'WAVAX': '0x1D308089a2D1Ced3f1Ce36B1FcaF815b07217be3',
  },
  43114: { // C-Chain Mainnet
    'USDC': '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    'WAVAX': '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
  },
};

// Get native balance (AVAX)
router.get('/native/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const chainId = parseInt(req.query.chainId) || 43113; // Default to Fuji

    if (!address || !ethers.isAddress(address)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid address format',
      });
    }

    const rpcUrl = RPC_ENDPOINTS[chainId];
    if (!rpcUrl) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported network',
      });
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const balance = await provider.getBalance(address);
    const balanceInEth = ethers.formatEther(balance);

    res.json({
      success: true,
      data: {
        address,
        chainId,
        balance: parseFloat(balanceInEth).toFixed(4),
        symbol: 'AVAX',
        raw: balance.toString(),
      },
    });

  } catch (error) {
    console.error('Error fetching native balance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch balance',
      error: error.message,
    });
  }
});

// Get token balance
router.get('/token/:address/:tokenSymbol', async (req, res) => {
  try {
    const { address, tokenSymbol } = req.params;
    const chainId = parseInt(req.query.chainId) || 43113;

    if (!address || !ethers.isAddress(address)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid address format',
      });
    }

    const rpcUrl = RPC_ENDPOINTS[chainId];
    if (!rpcUrl) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported network',
      });
    }

    const tokenAddresses = TOKEN_ADDRESSES[chainId];
    const tokenAddress = tokenAddresses?.[tokenSymbol.toUpperCase()];
    
    if (!tokenAddress) {
      return res.status(400).json({
        success: false,
        message: `Token ${tokenSymbol} not found on chain ${chainId}`,
      });
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

    const [balance, decimals, symbol, name] = await Promise.all([
      contract.balanceOf(address),
      contract.decimals(),
      contract.symbol(),
      contract.name(),
    ]);

    const formattedBalance = ethers.formatUnits(balance, decimals);

    res.json({
      success: true,
      data: {
        address,
        chainId,
        tokenAddress,
        balance: parseFloat(formattedBalance).toFixed(4),
        symbol,
        name,
        decimals: Number(decimals),
        raw: balance.toString(),
      },
    });

  } catch (error) {
    console.error('Error fetching token balance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch token balance',
      error: error.message,
    });
  }
});

// Get all balances for an address
router.get('/all/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const chainId = parseInt(req.query.chainId) || 43113;

    if (!address || !ethers.isAddress(address)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid address format',
      });
    }

    const rpcUrl = RPC_ENDPOINTS[chainId];
    if (!rpcUrl) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported network',
      });
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const tokenAddresses = TOKEN_ADDRESSES[chainId] || {};

    // Get native balance
    const nativeBalance = await provider.getBalance(address);
    const nativeBalanceFormatted = ethers.formatEther(nativeBalance);

    const balances = {
      AVAX: {
        balance: parseFloat(nativeBalanceFormatted).toFixed(4),
        symbol: 'AVAX',
        name: 'Avalanche',
        decimals: 18,
        isNative: true,
        raw: nativeBalance.toString(),
      },
    };

    // Get token balances
    const tokenPromises = Object.entries(tokenAddresses).map(async ([symbol, tokenAddress]) => {
      try {
        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const [balance, decimals, name] = await Promise.all([
          contract.balanceOf(address),
          contract.decimals(),
          contract.name(),
        ]);
        
        const formattedBalance = ethers.formatUnits(balance, decimals);
        
        return [symbol, {
          balance: parseFloat(formattedBalance).toFixed(4),
          symbol,
          name,
          decimals: Number(decimals),
          isNative: false,
          tokenAddress,
          raw: balance.toString(),
        }];
      } catch (error) {
        console.error(`Error fetching ${symbol} balance:`, error);
        return [symbol, {
          balance: '0.0000',
          symbol,
          name: symbol,
          decimals: 18,
          isNative: false,
          tokenAddress,
          error: error.message,
        }];
      }
    });

    const tokenResults = await Promise.all(tokenPromises);
    tokenResults.forEach(([symbol, data]) => {
      balances[symbol] = data;
    });

    res.json({
      success: true,
      data: {
        address,
        chainId,
        network: chainId === 43114 ? 'Avalanche C-Chain' : 'Avalanche Fuji Testnet',
        balances,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Error fetching all balances:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch balances',
      error: error.message,
    });
  }
});

// Check if address is valid
router.get('/validate/:address', (req, res) => {
  const { address } = req.params;
  
  const isValid = ethers.isAddress(address);
  
  res.json({
    success: true,
    data: {
      address,
      isValid,
      checksum: isValid ? ethers.getAddress(address) : null,
    },
  });
});

module.exports = router;