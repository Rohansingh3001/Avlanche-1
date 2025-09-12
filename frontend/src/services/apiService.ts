import axios, { AxiosResponse } from 'axios';
import type { 
  ApiResponse, 
  Subnet, 
  Contract, 
  Asset, 
  SystemStats, 
  CreateSubnetRequest,
  DeployContractRequest,
  CreateAssetRequest,
  HealthCheck
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.warn('Unauthorized access detected');
    }
    return Promise.reject(error);
  }
);

class ApiService {
  // Subnet endpoints
  async getSubnets(): Promise<AxiosResponse<ApiResponse<Subnet[]>>> {
    return api.get('/subnets');
  }

  async getSubnet(id: string): Promise<AxiosResponse<ApiResponse<Subnet>>> {
    return api.get(`/subnets/${id}`);
  }

  async createSubnet(data: CreateSubnetRequest): Promise<AxiosResponse<ApiResponse<Subnet>>> {
    return api.post('/subnets', data);
  }

  async updateSubnet(id: string, data: Partial<CreateSubnetRequest>): Promise<AxiosResponse<ApiResponse<Subnet>>> {
    return api.put(`/subnets/${id}`, data);
  }

  async deleteSubnet(id: string): Promise<AxiosResponse<ApiResponse<void>>> {
    return api.delete(`/subnets/${id}`);
  }

  async deploySubnet(id: string): Promise<AxiosResponse<ApiResponse<any>>> {
    return api.post(`/subnets/${id}/deploy`);
  }

  async startSubnet(id: string): Promise<AxiosResponse<ApiResponse<any>>> {
    return api.post(`/subnets/${id}/start`);
  }

  async stopSubnet(id: string): Promise<AxiosResponse<ApiResponse<any>>> {
    return api.post(`/subnets/${id}/stop`);
  }

  // Contract endpoints
  async getContracts(): Promise<AxiosResponse<ApiResponse<Contract[]>>> {
    return api.get('/contracts');
  }

  async getContract(id: string): Promise<AxiosResponse<ApiResponse<Contract>>> {
    return api.get(`/contracts/${id}`);
  }

  async uploadContract(formData: FormData): Promise<AxiosResponse<ApiResponse<Contract>>> {
    return api.post('/contracts/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async compileContract(id: string): Promise<AxiosResponse<ApiResponse<any>>> {
    return api.post(`/contracts/${id}/compile`);
  }

  async deployContract(data: DeployContractRequest): Promise<AxiosResponse<ApiResponse<Contract>>> {
    return api.post('/contracts/deploy', data);
  }

  async deleteContract(id: string): Promise<AxiosResponse<ApiResponse<void>>> {
    return api.delete(`/contracts/${id}`);
  }

  // Asset endpoints
  async getAssets(): Promise<AxiosResponse<ApiResponse<Asset[]>>> {
    return api.get('/assets');
  }

  async getAsset(id: string): Promise<AxiosResponse<ApiResponse<Asset>>> {
    return api.get(`/assets/${id}`);
  }

  async createToken(data: CreateAssetRequest): Promise<AxiosResponse<ApiResponse<Asset>>> {
    return api.post('/assets/token', data);
  }

  async createNFT(data: CreateAssetRequest): Promise<AxiosResponse<ApiResponse<Asset>>> {
    return api.post('/assets/nft', data);
  }

  async deleteAsset(id: string): Promise<AxiosResponse<ApiResponse<void>>> {
    return api.delete(`/assets/${id}`);
  }

  // Monitoring endpoints
  async getHealth(): Promise<AxiosResponse<ApiResponse<HealthCheck[]>>> {
    return api.get('/health');
  }

  async getMetrics(): Promise<AxiosResponse<ApiResponse<any>>> {
    return api.get('/metrics');
  }

  async getSystemStats(): Promise<AxiosResponse<ApiResponse<SystemStats>>> {
    return api.get('/stats');
  }

  // Validator endpoints
  async getValidators(subnetId: string): Promise<AxiosResponse<ApiResponse<any[]>>> {
    return api.get(`/subnets/${subnetId}/validators`);
  }

  async addValidator(subnetId: string, validatorData: any): Promise<AxiosResponse<ApiResponse<any>>> {
    return api.post(`/subnets/${subnetId}/validators`, validatorData);
  }

  async removeValidator(subnetId: string, validatorId: string): Promise<AxiosResponse<ApiResponse<void>>> {
    return api.delete(`/subnets/${subnetId}/validators/${validatorId}`);
  }

  // Utility methods
  async testConnection(): Promise<AxiosResponse<ApiResponse<{ status: string }>>> {
    return api.get('/ping');
  }

  async getVersion(): Promise<AxiosResponse<ApiResponse<{ version: string }>>> {
    return api.get('/version');
  }
}

const apiService = new ApiService();
export default apiService;
