import api from '../services/api';

export interface ApiTestEndpoint {
  name: string;
  fn: () => Promise<any>;
}

export interface ApiTestResult {
  name: string;
  success: boolean;
  status: string | number;
  data?: any;
  error?: string;
}

/**
 * Utility for testing API endpoints to diagnose connectivity issues
 * This separates diagnostic code from the main application components
 */
export const apiDiagnostics = {
  /**
   * Common test endpoints to try when diagnosing API issues
   */
  getCommonEndpoints(entityType: string): ApiTestEndpoint[] {
    return [
      { name: `Get all ${entityType} (api prefix)`, fn: () => api.get(`/api/${entityType}`) },
      { name: `Get all ${entityType} (no prefix)`, fn: () => api.get(`/${entityType}`) },
      { name: `Get all ${entityType} (v1 prefix)`, fn: () => api.get(`/api/v1/${entityType}`) },
      { name: `Get all ${entityType} (singular)`, fn: () => api.get(`/api/${entityType.slice(0, -1)}`) },
      { name: 'Check auth status', fn: () => api.get('/api/auth/status') },
    ];
  },

  /**
   * Run a series of API tests to diagnose connectivity issues
   */
  async runApiTests(endpoints: ApiTestEndpoint[]): Promise<ApiTestResult[]> {
    const results: ApiTestResult[] = [];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🧪 Testing endpoint: ${endpoint.name}`);
        const response = await endpoint.fn();
        results.push({
          name: endpoint.name,
          success: true,
          status: response.status,
          data: response.data
        });
      } catch (e: any) {
        results.push({
          name: endpoint.name,
          success: false,
          status: e.status || e.response?.status || 'Error',
          error: e.message || JSON.stringify(e)
        });
      }
    }
    
    return results;
  }
};

/**
 * Utility for toggling between real and mock data during development
 * This should not be used in production
 */
export const debugStorage = {
  /**
   * Check if debug mode is enabled
   */
  isDebugModeEnabled(): boolean {
    return localStorage.getItem('debug_mode') === 'true';
  },
  
  /**
   * Enable or disable debug mode
   */
  setDebugMode(enabled: boolean): void {
    localStorage.setItem('debug_mode', enabled ? 'true' : 'false');
  },
  
  /**
   * Check if mock data mode is enabled
   */
  isMockModeEnabled(): boolean {
    return localStorage.getItem('use_mock_data') === 'true';
  },
  
  /**
   * Enable or disable mock data mode
   */
  setMockMode(enabled: boolean): void {
    localStorage.setItem('use_mock_data', enabled ? 'true' : 'false');
  }
};