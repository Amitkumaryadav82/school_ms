import api from './api';

// Frontend interface for displaying admission applications
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

// This interface matches what the backend returns based on AdmissionResponse.java
interface BackendAdmissionResponse {
  id?: number;
  applicantName: string;
  applicationDate: string; // ISO date string format
  gradeApplying: number;
  status: string;
  message?: string;
  studentId?: number;
}

// This interface exactly matches what the backend expects based on AdmissionRequest.java
export interface AdmissionRequest {
  applicantName: string;
  dateOfBirth: string; // Will be converted to LocalDate in the request
  email: string;
  contactNumber: string;
  guardianName: string;
  guardianContact: string;
  guardianEmail?: string;
  gradeApplying: number; // Must be Integer, not string
  previousSchool?: string;
  previousGrade?: string;
  previousPercentage: number; // Required, must be between 0-100
  documents?: any;
  documentsFormat?: string;
}

export const admissionService = {
  // Transform backend response to frontend format
  getAllApplications: async () => {
    const response = await api.get<BackendAdmissionResponse[]>('/admissions');
    return response.map(transformResponseToApplication);
  },
  
  getApplicationById: async (id: number) => {
    const response = await api.get<BackendAdmissionResponse>(`/admissions/${id}`);
    return transformResponseToApplication(response);
  },
  
  createApplication: (application: AdmissionApplication) => {
    // Convert date to ISO format (YYYY-MM-DD) if it's not already
    let formattedDate = application.dateOfBirth;
    
    // Try to ensure the date is in the right format
    if (formattedDate && !formattedDate.includes('-')) {
      const dateObj = new Date(formattedDate);
      if (!isNaN(dateObj.getTime())) {
        formattedDate = dateObj.toISOString().split('T')[0];
      }
    }
    
    // Format data exactly as the backend expects according to validation requirements
    const requestData = {
      applicantName: application.studentName,
      dateOfBirth: formattedDate,
      email: application.email,
      contactNumber: application.contactNumber,
      guardianName: application.parentName,
      guardianContact: application.contactNumber, // Using same contact for guardian
      guardianEmail: application.email, // Using same email for guardian
      gradeApplying: parseInt(application.gradeApplying, 10) || 1, // Default to grade 1 if parsing fails
      previousSchool: "Not Available",
      previousGrade: "Not Available", 
      previousPercentage: 75.0, // Default value between 0-100
    };
    
    // Debug log
    console.log('Sending admission request with structured data:', requestData);
    console.log('Date format checking - original:', application.dateOfBirth, 'formatted:', formattedDate);
    
    return api.post<any>('/admissions', requestData);
  },
    
  updateApplication: (id: number, application: AdmissionApplication) => {
    // Same format as create
    const requestData = {
      applicantName: application.studentName,
      dateOfBirth: application.dateOfBirth, 
      email: application.email,
      contactNumber: application.contactNumber,
      guardianName: application.parentName,
      guardianContact: application.contactNumber,
      guardianEmail: application.email,
      gradeApplying: parseInt(application.gradeApplying, 10),
      previousSchool: "N/A",
      previousGrade: "N/A", 
      previousPercentage: 70.0,
    };
    
    return api.put<any>(`/admissions/${id}`, requestData);
  },
  
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

// Helper function to transform backend response to frontend format
function transformResponseToApplication(response: BackendAdmissionResponse): AdmissionApplication {
  return {
    id: response.id,
    studentName: response.applicantName || 'Unknown',
    dateOfBirth: '', // Backend doesn't return this in the list view
    gradeApplying: response.gradeApplying?.toString() || '',
    parentName: 'Not available', // Backend doesn't return guardian info in list view
    contactNumber: '', // Not available in response
    email: '', // Not available in response
    address: '', // Not available in response
    status: response.status as any,
    submissionDate: response.applicationDate
  };
}