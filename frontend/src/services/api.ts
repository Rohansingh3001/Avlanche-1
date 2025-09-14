// API service for making requests to the backend
const API_BASE_URL = '/api';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Contracts API
  async getContracts(params?: { subnetId?: string; status?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.subnetId) queryParams.append('subnetId', params.subnetId);
    if (params?.status) queryParams.append('status', params.status);
    
    const endpoint = queryParams.toString() 
      ? `/contracts?${queryParams.toString()}` 
      : '/contracts';
    
    return this.request(endpoint);
  }

  async getContract(id: string) {
    return this.request(`/contracts/${id}`);
  }

  async uploadContract(data: FormData) {
    return this.request('/contracts/upload', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: data,
    });
  }

  async compileContract(data: {
    sourceCode: string;
    contractName?: string;
    compilerVersion?: string;
  }) {
    return this.request('/contracts/compile', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateContract(id: string, data: any) {
    return this.request(`/contracts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deployContract(data: {
    contractId: string;
    constructorArgs?: any[];
    gasLimit?: number;
    gasPrice?: string;
  }) {
    return this.request('/contracts/deploy', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async interactWithContract(id: string, data: {
    method: string;
    args?: any[];
    value?: string;
  }) {
    return this.request(`/contracts/${id}/interact`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteContract(id: string) {
    return this.request(`/contracts/${id}`, {
      method: 'DELETE',
    });
  }

  async getContractTemplates() {
    return this.request('/contracts/templates');
  }

  // Assets API
  async getAssets(params?: { subnet_id?: string; type?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.subnet_id) queryParams.append('subnet_id', params.subnet_id);
    if (params?.type) queryParams.append('type', params.type);
    
    const endpoint = queryParams.toString() 
      ? `/assets?${queryParams.toString()}` 
      : '/assets';
    
    return this.request(endpoint);
  }

  async getAsset(id: string) {
    return this.request(`/assets/${id}`);
  }

  async createAsset(data: {
    name: string;
    symbol: string;
    type: 'token' | 'nft';
    subnet_id: string;
    decimals?: number;
    totalSupply?: string;
  }) {
    return this.request('/assets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAsset(id: string, data: any) {
    return this.request(`/assets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAsset(id: string) {
    return this.request(`/assets/${id}`, {
      method: 'DELETE',
    });
  }

  // Monitoring API
  async getSystemHealth() {
    return this.request('/monitoring/health');
  }

  async getMetrics(params?: { 
    subnet_id?: string; 
    timeRange?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.subnet_id) queryParams.append('subnet_id', params.subnet_id);
    if (params?.timeRange) queryParams.append('timeRange', params.timeRange);
    
    const endpoint = queryParams.toString() 
      ? `/monitoring/metrics?${queryParams.toString()}` 
      : '/monitoring/metrics';
    
    return this.request(endpoint);
  }

  async getAlerts(params?: { 
    severity?: string; 
    resolved?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.severity) queryParams.append('severity', params.severity);
    if (params?.resolved !== undefined) queryParams.append('resolved', params.resolved.toString());
    
    const endpoint = queryParams.toString() 
      ? `/monitoring/alerts?${queryParams.toString()}` 
      : '/monitoring/alerts';
    
    return this.request(endpoint);
  }

  async getSystemStats() {
    return this.request('/monitoring/stats');
  }

  // Subnets API
  async getSubnets(params?: { status?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    
    const endpoint = queryParams.toString() 
      ? `/subnets?${queryParams.toString()}` 
      : '/subnets';
    
    return this.request(endpoint);
  }

  async getSubnet(id: string) {
    return this.request(`/subnets/${id}`);
  }

  async createSubnet(data: any) {
    return this.request('/subnets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSubnet(id: string, data: any) {
    return this.request(`/subnets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSubnet(id: string) {
    return this.request(`/subnets/${id}`, {
      method: 'DELETE',
    });
  }

  async deploySubnet(id: string) {
    return this.request(`/subnets/${id}/deploy`, {
      method: 'POST',
    });
  }

  // Faucet API
  async getFaucetTokens() {
    return this.request('/faucet/tokens');
  }

  async checkFaucetEligibility(address: string, token: string) {
    return this.request(`/faucet/check-eligibility/${address}/${token}`);
  }

  async requestFaucetTokens(data: { address: string; tokenSymbol: string }) {
    return this.request('/faucet/request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getFaucetHistory(address: string, params?: { limit?: number; offset?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const endpoint = queryParams.toString() 
      ? `/faucet/history/${address}?${queryParams.toString()}` 
      : `/faucet/history/${address}`;
    
    return this.request(endpoint);
  }

  async getRecentFaucetActivity(limit?: number) {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit.toString());
    
    const endpoint = queryParams.toString() 
      ? `/faucet/recent?${queryParams.toString()}` 
      : '/faucet/recent';
    
    return this.request(endpoint);
  }

  async getFaucetStats() {
    return this.request('/faucet/stats');
  }
}

export const apiService = new ApiService();
export default apiService;