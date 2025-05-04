import api from './api';

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

export const admissionService = {
  // Simplified to use the consistent API endpoint pattern
  getAllApplications: () => api.get<AdmissionApplication[]>('/admissions'),
  
  getApplicationById: (id: number) => api.get<AdmissionApplication>(`/admissions/${id}`),
  
  createApplication: (application: AdmissionApplication) => 
    api.post<AdmissionApplication>('/admissions', application),
    
  updateApplication: (id: number, application: AdmissionApplication) =>
    api.put<AdmissionApplication>(`/admissions/${id}`, application),
  
  submitApplication: (application: AdmissionApplication) => 
    api.post<AdmissionApplication>('/admissions/submit', application),
  
  updateStatus: (id: number, status: string) =>
    api.put<AdmissionApplication>(`/admissions/${id}/status`, { status }),
  
  getByStatus: (status: string) =>
    api.get<AdmissionApplication[]>(`/admissions/status/${status}`),
  
  searchApplications: (query: string) =>
    api.get<AdmissionApplication[]>(`/admissions/search?query=${query}`),
  
  getByDateRange: (startDate: string, endDate: string) =>
    api.get<AdmissionApplication[]>(`/admissions/date-range?startDate=${startDate}&endDate=${endDate}`),
  
  getByGrade: (grade: string) =>
    api.get<AdmissionApplication[]>(`/admissions/grade/${grade}`),

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
        getAllApplications: '/admissions',
        createApplication: '/admissions',
        updateApplication: '/admissions/:id'
      }
    };
  }
};