/**
 * Avalanche L2 Network Configuration
 * Supporting Avalanche C-Chain, Fuji Testnet, and L2 solutions
 */

export interface AvalancheNetwork {
  chainId: number;
  name: string;
  displayName: string;
  rpcUrls: string[];
  blockExplorerUrls: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  isTestnet: boolean;
  isL2: boolean;
  logo?: string;
}

export const AVALANCHE_NETWORKS: Record<string, AvalancheNetwork> = {
  // Avalanche C-Chain (Layer 1)
  mainnet: {
    chainId: 43114,
    name: 'avalanche-mainnet',
    displayName: 'Avalanche C-Chain',
    rpcUrls: [
      'https://api.avax.network/ext/bc/C/rpc',
      'https://avalanche-c-chain-rpc.gateway.pokt.network',
      'https://avalanche.public-rpc.com'
    ],
    blockExplorerUrls: ['https://snowtrace.io'],
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18,
    },
    isTestnet: false,
    isL2: false,
    logo: '/assets/avalanche-logo.png'
  },

  // Avalanche Fuji Testnet
  fuji: {
    chainId: 43113,
    name: 'avalanche-fuji',
    displayName: 'Avalanche Fuji Testnet',
    rpcUrls: [
      'https://api.avax-test.network/ext/bc/C/rpc',
      'https://avalanche-fuji-c-chain-rpc.gateway.pokt.network'
    ],
    blockExplorerUrls: ['https://testnet.snowtrace.io'],
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18,
    },
    isTestnet: true,
    isL2: false,
    logo: '/assets/avalanche-logo.png'
  },

  // DeFi Kingdoms Subnet (Avalanche L2)
  dfkSubnet: {
    chainId: 53935,
    name: 'dfk-subnet',
    displayName: 'DFK Subnet',
    rpcUrls: ['https://subnets.avax.network/defi-kingdoms/dfk-chain/rpc'],
    blockExplorerUrls: ['https://subnets.avax.network/defi-kingdoms'],
    nativeCurrency: {
      name: 'JEWEL',
      symbol: 'JEWEL',
      decimals: 18,
    },
    isTestnet: false,
    isL2: true,
    logo: '/assets/dfk-logo.png'
  },

  // Dexalot Subnet (Avalanche L2)
  dexalot: {
    chainId: 432204,
    name: 'dexalot-subnet',
    displayName: 'Dexalot Subnet',
    rpcUrls: ['https://subnets.avax.network/dexalot/mainnet/rpc'],
    blockExplorerUrls: ['https://subnets.avax.network/dexalot'],
    nativeCurrency: {
      name: 'ALOT',
      symbol: 'ALOT',
      decimals: 18,
    },
    isTestnet: false,
    isL2: true,
    logo: '/assets/dexalot-logo.png'
  },

  // Custom Subnet Example (for development)
  customSubnet: {
    chainId: 99999,
    name: 'custom-subnet',
    displayName: 'Custom Development Subnet',
    rpcUrls: ['http://localhost:9650/ext/bc/C/rpc'],
    blockExplorerUrls: ['http://localhost:4000'],
    nativeCurrency: {
      name: 'Custom Token',
      symbol: 'CUST',
      decimals: 18,
    },
    isTestnet: true,
    isL2: true,
    logo: '/assets/custom-subnet-logo.png'
  }
};

export const DEFAULT_NETWORK = AVALANCHE_NETWORKS.mainnet;
export const DEFAULT_TESTNET = AVALANCHE_NETWORKS.fuji;

// Core Wallet Configuration
export const CORE_WALLET_CONFIG = {
  appName: 'Avalanche L2 Smart Contract Platform',
  appDescription: 'Deploy and manage smart contracts on Avalanche L2 networks',
  appUrl: 'https://avalanche-l2-platform.com',
  appIcon: '/assets/app-icon.png',
  supportedNetworks: Object.values(AVALANCHE_NETWORKS).map(network => network.chainId),
  preferredNetwork: DEFAULT_NETWORK.chainId,
  autoConnect: true,
  cacheProvider: true
};

// Gas Configuration for different networks
export const GAS_CONFIGS = {
  [AVALANCHE_NETWORKS.mainnet.chainId]: {
    gasPrice: '25000000000', // 25 gwei
    gasLimit: '8000000',
    maxFeePerGas: '30000000000',
    maxPriorityFeePerGas: '2000000000'
  },
  [AVALANCHE_NETWORKS.fuji.chainId]: {
    gasPrice: '25000000000', // 25 gwei
    gasLimit: '8000000',
    maxFeePerGas: '30000000000',
    maxPriorityFeePerGas: '2000000000'
  },
  // L2 networks typically have lower gas costs
  [AVALANCHE_NETWORKS.dfkSubnet.chainId]: {
    gasPrice: '1000000000', // 1 gwei
    gasLimit: '8000000',
    maxFeePerGas: '2000000000',
    maxPriorityFeePerGas: '1000000000'
  },
  [AVALANCHE_NETWORKS.dexalot.chainId]: {
    gasPrice: '1000000000', // 1 gwei
    gasLimit: '8000000',
    maxFeePerGas: '2000000000',
    maxPriorityFeePerGas: '1000000000'
  }
};

export const getNetworkConfig = (chainId: number): AvalancheNetwork | null => {
  return Object.values(AVALANCHE_NETWORKS).find(network => network.chainId === chainId) || null;
};

export const getGasConfig = (chainId: number) => {
  return GAS_CONFIGS[chainId] || GAS_CONFIGS[DEFAULT_NETWORK.chainId];
};

export const isAvalancheNetwork = (chainId: number): boolean => {
  return Object.values(AVALANCHE_NETWORKS).some(network => network.chainId === chainId);
};

export const isL2Network = (chainId: number): boolean => {
  const network = getNetworkConfig(chainId);
  return network?.isL2 || false;
};