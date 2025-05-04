import api from './api.jsx';

export interface AdmissionApplication {
  id?: number;
  studentName: string;
  dateOfBirth: string;
  gradeApplying: string;
  parentName: string;
  contactNumber: string;
  email: string;
  address: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submissionDate?: string;
}

// Function to try multiple endpoints and return the first successful response
async function tryMultipleEndpoints(endpointFunctions: (() => Promise<any>)[]): Promise<any> {
  let lastError = null;
  
  for (const fn of endpointFunctions) {
    try {
      console.log('🔍 Trying endpoint:', fn.name || 'anonymous');
      const response = await fn();
      console.log('✅ Endpoint succeeded:', fn.name || 'anonymous');
      return response;
    } catch (error) {
      console.warn('⚠️ Endpoint failed:', fn.name || 'anonymous', error);
      lastError = error;
    }
  }
  
  // If we get here, all endpoints failed
  throw lastError;
}

export const admissionService = {
  // Modified to try different endpoints until one works
  getAllApplications: async () => {
    console.log('⚙️ Calling admissionService.getAllApplications() with multiple fallbacks');
    
    return tryMultipleEndpoints([
      // Try singular first (most common REST convention)
      () => api.get('/admission'),
      // Try with API prefix (common in many frameworks)
      () => api.get('/api/admission'),
      // Try plural (RESTful convention)
      () => api.get('/admissions'),
      // Try with API prefix and plural
      () => api.get('/api/admissions'),
      // Try with v1 prefix (versioned API)
      () => api.get('/api/v1/admission'),
      // Try with admin prefix
      () => api.get('/admin/admission'),
    ]);
  },
  
  createApplication: (application: AdmissionApplication) => 
    api.post('/admission', application),
    
  updateApplication: (id: number, application: AdmissionApplication) =>
    api.put(`/admission/${id}`, application),
  
  submitApplication: (application: AdmissionApplication) => 
    api.post('/admission/submit', application),
  
  updateStatus: (id: number, status: string) =>
    api.put(`/admission/${id}/status`, { status }),
  
  getByStatus: (status: string) =>
    api.get(`/admission/status/${status}`),
  
  searchApplications: (query: string) =>
    api.get(`/admission/search?query=${query}`),
  
  getByDateRange: (startDate: string, endDate: string) =>
    api.get(`/admission/date-range?startDate=${startDate}&endDate=${endDate}`),
  
  getByGrade: (grade: string) =>
    api.get(`/admission/grade/${grade}`),

  // Debug methods
  getDebugInfo: async () => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    let parsedUser = null;
    let tokenInfo = null;
    
    try {
      if (user) parsedUser = JSON.parse(user);
      if (token) {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          tokenInfo = {
            exp: new Date(payload.exp * 1000).toLocaleString(),
            roles: payload.roles || payload.authorities || payload.role || 'Not found in token',
            sub: payload.sub || payload.username
          };
        }
      }
    } catch (e) {
      console.error('Error parsing user/token data', e);
    }
    
    return {
      user: parsedUser,
      token: token ? `${token.substring(0, 20)}...` : null,
      tokenInfo,
      endpoints: {
        getAllApplications: '/admission (with fallbacks)',
        createApplication: '/admission',
        updateApplication: '/admission/:id'
      }
    };
  }
};