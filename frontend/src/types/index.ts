// Type definitions for the Avalanche Subnet Tooling Suite
import { ReactElement } from 'react';

export interface Subnet {
  id: string;
  name: string;
  chainId: number;
  status: 'active' | 'stopped' | 'error' | 'starting' | 'deploying';
  vmType: 'evm' | 'spacesvm' | 'blobvm';
  validators: Validator[];
  created_at: string;
  updated_at: string;
  uptime?: number;
  isHealthy?: boolean;
  rpcUrl?: string;
  explorerUrl?: string;
}

export interface Validator {
  id: string;
  nodeId: string;
  weight: number;
  startTime: string;
  endTime: string;
  isHealthy: boolean;
  subnet_id: string;
}

export interface Contract {
  id: string;
  name: string;
  address?: string;
  abi: any[];
  bytecode: string;
  status: 'compiled' | 'deployed' | 'error';
  subnet_id: string;
  created_at: string;
  updated_at: string;
  sourceCode?: string;
  compilationOutput?: any;
}

export interface Asset {
  id: string;
  name: string;
  symbol: string;
  type: 'token' | 'nft';
  address: string;
  subnet_id: string;
  totalSupply?: number;
  decimals?: number;
  created_at: string;
  updated_at: string;
}

export interface HealthCheck {
  id: string;
  subnet_id: string;
  status: 'healthy' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  metrics?: HealthMetrics;
}

export interface HealthMetrics {
  cpu: number;
  memory: number;
  network: number;
  storage: number;
  latency: number;
  blockHeight: number;
  peerCount: number;
}

export interface RealtimeMetrics {
  cpu?: number;
  memory?: number;
  network?: number;
  storage?: number;
  latency?: number;
  blockHeight?: number;
  peerCount?: number;
  timestamp?: string;
}

export interface SystemStats {
  uptime: number;
  totalSubnets: number;
  activeSubnets: number;
  totalContracts: number;
  deployedContracts: number;
  totalAssets: number;
}

export interface Activity {
  type: 'subnet' | 'contract' | 'asset' | 'deployment';
  title: string;
  description: string;
  timestamp: string;
  status: string;
  metadata?: Record<string, any>;
}

export interface WalletContextType {
  isConnected: boolean;
  account: string | null;
  chainId: number | null;
  balance: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  walletType?: 'core' | 'metamask' | null;
  // Enhanced wallet properties
  provider?: any;
  signer?: any;
  isLoading?: boolean;
  error?: string | null;
  getCurrentNetwork?: () => any;
  getGasConfiguration?: () => any;
  estimateGas?: (transaction: any) => Promise<bigint>;
  sendTransaction?: (transaction: any) => Promise<any>;
  addAvalancheNetwork?: (networkKey: string) => Promise<void>;
  refreshBalance?: () => Promise<void>;
}

export interface WebSocketContextType {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  sendMessage: (message: any) => void;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CreateSubnetRequest {
  name: string;
  chainId: number;
  vmType: 'evm' | 'spacesvm' | 'blobvm';
  validators: {
    nodeId: string;
    weight: number;
  }[];
  genesis: {
    gasLimit: number;
    difficulty: string;
    alloc: Record<string, any>;
  };
}

export interface DeployContractRequest {
  name: string;
  sourceCode: string;
  constructorArgs?: any[];
  subnetId: string;
}

export interface CreateAssetRequest {
  name: string;
  symbol: string;
  type: 'token' | 'nft';
  totalSupply?: number;
  decimals?: number;
  subnetId: string;
}

export interface MetricCardProps {
  title: string;
  value: number;
  total?: number;
  icon: ReactElement;
  color?: 'primary' | 'success' | 'error' | 'warning' | 'info' | 'secondary';
  trend?: string;
  percentage?: number;
  subtitle?: string;
  isLoading?: boolean;
}

export interface SubnetStatusCardProps {
  subnets: Subnet[];
  onViewDetails?: (id: string) => void;
  onStartSubnet?: (id: string) => void;
  onStopSubnet?: (id: string) => void;
}

export interface RecentActivityCardProps {
  activities: Activity[];
  onRefresh?: () => void;
}

export interface QuickActionsCardProps {
  onCreateSubnet?: () => void;
  onDeployContract?: () => void;
  onManageAssets?: () => void;
  onViewMonitoring?: () => void;
  onManageSettings?: () => void;
  onAccessTools?: () => void;
}

export interface NetworkHealthCardProps {
  subnets: Subnet[];
  realtimeMetrics: Partial<HealthMetrics>;
}

// Utility types
export type SubnetStatus = Subnet['status'];
export type AssetType = Asset['type'];
export type ContractStatus = Contract['status'];
export type HealthStatus = HealthCheck['status'];

// Form types
export interface SubnetFormData {
  name: string;
  chainId: number;
  vmType: string;
  validators: Array<{
    nodeId: string;
    weight: number;
  }>;
  genesis: {
    gasLimit: number;
    difficulty: string;
    alloc: Record<string, any>;
  };
}

export interface ContractFormData {
  name: string;
  sourceCode: string;
  constructorArgs: string;
  subnetId: string;
}

export interface AssetFormData {
  name: string;
  symbol: string;
  type: AssetType;
  totalSupply: number;
  decimals: number;
  subnetId: string;
}
