import api from './api';
import { Student, studentService } from './studentService';

// Frontend interface for displaying admission applications
export interface AdmissionApplication {
  id?: number;
  studentName: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth: string;
  gradeApplying: string;
  section?: string;
  gender?: string;
  parentName: string;
  contactNumber: string;
  guardianContact?: string; // Added missing field
  email: string;
  address: string; // Now required field
  bloodGroup?: string;
  medicalConditions?: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'WAITLISTED' | 'CANCELLED' | 'ENROLLED';
  submissionDate?: string;
  rejectionReason?: string;
  previousSchool?: string;
  previousGrade?: string;
  previousPercentage?: string; // Changed from number to string
  documents?: any;
  documentsFormat?: string;
}

// Backend response interface - matches Admission.java
interface BackendAdmissionResponse {
  id?: number;
  applicantName: string;
  dateOfBirth: string;
  applicationDate: string;
  gradeApplying: number;
  guardianName: string; 
  contactNumber: string;
  guardianContact: string;
  email: string;
  guardianEmail?: string;
  address?: string;  // Added address field
  status: string;  rejectionReason?: string;
  previousSchool?: string;
  previousGrade?: string;
  previousPercentage?: string; // Changed from number to string
  documents?: any;
  documentsFormat?: string;
  message?: string;
  studentId?: number;
  bloodGroup?: string;     // Added missing field
  medicalConditions?: string;  // Added missing field
}

// This interface exactly matches what the backend expects based on AdmissionRequest.java
export interface AdmissionRequest {
  applicantName: string;
  dateOfBirth: string; // Format: YYYY-MM-DD
  email: string;
  contactNumber: string;
  guardianName: string;
  guardianContact: string;
  guardianEmail?: string;
  bloodGroup?: string;
  medicalConditions?: string;
  address: string; // Making sure address is included as required
  gradeApplying: number; // Must be Integer, not string
  previousSchool?: string;
  previousGrade?: string;
  previousPercentage: string; // Changed from number to string
  documents?: any;
  documentsFormat?: string;
}

export const admissionService = {  // Get all admission applications
  getAllApplications: async () => {
    const response = await api.get<BackendAdmissionResponse[]>('/api/admissions');
    console.log('API Response for getAllApplications:', response);
    // Handle both array responses and potential wrapped responses
    const admissionData = Array.isArray(response) ? response : [];
    return admissionData.map(transformResponseToApplication);
  },
    // Get application by ID
  getApplicationById: async (id: number) => {
    try {
      console.log(`Fetching admission details for ID: ${id}`);
      const response = await api.get<BackendAdmissionResponse>(`/api/admissions/${id}`);
      console.log("Admission details from backend:", response);
      
      // Ensure we have a valid admission response
      if (!response || typeof response !== 'object') {
        throw new Error('Invalid admission data received from server');
      }
      
      // Transform admission data
      const admissionData = transformResponseToApplication(response);
      
      // Check if this admission has a student record
      if (response.studentId) {
        try {
          console.log(`Admission has associated student ID: ${response.studentId}, fetching student details`);
          // Fetch the student record to get additional details
          const studentData = await studentService.getById(response.studentId);
          console.log("Student data retrieved:", studentData);
          
          // If student record has address, use it (address is not part of admission schema)
          if (studentData && studentData.address) {
            console.log("Found address in student record:", studentData.address);
            admissionData.address = studentData.address;
          }
        } catch (studentError) {
          console.warn("Could not fetch student data:", studentError);
        }
      } else {
        console.log("No associated student ID found for this admission");
      }
      
      return admissionData;
    } catch (error) {
      console.error(`Failed to get admission details for ID ${id}:`, error);
      throw error;
    }
  },
  
  // Create new application
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
    const requestData: AdmissionRequest = {
      applicantName: application.studentName,
      dateOfBirth: formattedDate,
      email: application.email,
      contactNumber: application.contactNumber,
      guardianName: application.parentName,
      guardianContact: application.contactNumber, // Using same contact for guardian
      guardianEmail: application.email, // Using same email for guardian
      address: application.address, // Explicitly include address field
      gradeApplying: parseInt(application.gradeApplying, 10) || 1, // Default to grade 1 if parsing fails      previousSchool: application.previousSchool || "Not Available",
      previousGrade: application.previousGrade || "Not Available", 
      previousPercentage: application.previousPercentage?.toString() || "75.0",      bloodGroup: application.bloodGroup || "", 
      medicalConditions: application.medicalConditions || "",
      documents: application.documents,
      documentsFormat: application.documentsFormat
    };
    
    // Debug log
    console.log('Sending admission request with structured data:', requestData);
    console.log('Date format checking - original:', application.dateOfBirth, 'formatted:', formattedDate);
    console.log('Address value being sent:', application.address); // Log address value
    
    return api.post<BackendAdmissionResponse>('/api/admissions', requestData);
  },
    
  // Update application details
  updateApplication: async (id: number, application: AdmissionApplication) => {
    console.log(`Updating admission application with ID: ${id}`, application);
    
    // Verify user token and permissions first
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('You must be logged in to update applications');
    }
    
    try {
      // Format data exactly as the backend expects according to validation requirements
      const requestData: AdmissionRequest = {
        applicantName: application.studentName,
        dateOfBirth: application.dateOfBirth,
        email: application.email,
        contactNumber: application.contactNumber,
        guardianName: application.parentName,
        guardianContact: application.contactNumber,
        guardianEmail: application.email,
        address: application.address, // Explicitly include address field
        gradeApplying: parseInt(application.gradeApplying, 10),        previousSchool: application.previousSchool || "Not Available",
        previousGrade: application.previousGrade || "Not Available", 
        previousPercentage: application.previousPercentage?.toString() || "75.0",
        bloodGroup: application.bloodGroup || "",
        medicalConditions: application.medicalConditions || "",
        documents: application.documents,
        documentsFormat: application.documentsFormat
      };
      
      console.log('Sending general update request with data:', requestData);
      
      // Call the general update endpoint
      const response = await api.put<BackendAdmissionResponse>(
        `/api/admissions/${id}`,
        requestData
      );
      
      console.log('Update response:', response);
      return response;
    } catch (error) {
      console.error('Update attempt failed:', error);
      throw error;
    }
  },
  
  // Update application status only
  updateStatus: async (id: number, status: string, remarks?: string) => {
    console.log(`Updating admission status ${id} to ${status}`);
    
    // Create query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('status', status);
    
    if (remarks) {
      queryParams.append('remarks', remarks);
    }
    
    // Call the status update endpoint
    return api.put<BackendAdmissionResponse>(
      `/api/admissions/${id}/status?${queryParams.toString()}`
    );
  },
    // Get applications by status
  getByStatus: async (status: string) => {
    const response = await api.get<BackendAdmissionResponse[]>(`/api/admissions/status/${status}`);
    // Handle both array responses and potential wrapped responses
    const admissionData = Array.isArray(response) ? response : [];
    return admissionData;
  },
    // Search applications
  searchApplications: async (query: string) => {
    const response = await api.get<BackendAdmissionResponse[]>(`/api/admissions/search?query=${query}`);
    // Handle both array responses and potential wrapped responses
    const admissionData = Array.isArray(response) ? response : [];
    return admissionData;
  },
    // Get applications by date range
  getByDateRange: async (startDate: string, endDate: string) => {
    const response = await api.get<BackendAdmissionResponse[]>(`/api/admissions/date-range?startDate=${startDate}&endDate=${endDate}`);
    // Handle both array responses and potential wrapped responses
    const admissionData = Array.isArray(response) ? response : [];
    return admissionData;
  },
    // Get applications by grade
  getByGrade: async (grade: string) => {
    const response = await api.get<BackendAdmissionResponse[]>(`/api/admissions/grade/${grade}`);
    // Handle both array responses and potential wrapped responses
    const admissionData = Array.isArray(response) ? response : [];
    return admissionData;
  },

  // Delete application
  deleteApplication: (id: number) =>
    api.delete(`/api/admissions/${id}`),

  /**
   * Process an admission application by changing its status
   * @param id The ID of the admission to process
   * @param action The action to take (approve or reject)
   * @param reason Optional rejection reason
   */
  processAdmission: async (id: number, action: 'APPROVE' | 'REJECT', reason?: string) => {
    console.log(`Processing admission ${id} with action: ${action}`);
    
    try {
      // Convert action to proper status value expected by the backend
      const status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
      
      // Backend expects query parameters, not a JSON body
      const queryParams = new URLSearchParams();
      queryParams.append('status', status);
      
      if (action === 'REJECT' && reason) {
        queryParams.append('remarks', reason);
      }
      
      // Call the API with query parameters
      const response = await api.put<BackendAdmissionResponse>(
        `/api/admissions/${id}/status?${queryParams.toString()}`
      );
      
      console.log(`Admission ${id} processed with response:`, response);
      return response;
    } catch (error) {
      console.error(`Error processing admission ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a student record from an approved admission application
   * @param admissionId The ID of the approved admission
   * @param additionalData Any additional student data not included in the admission
   */
  createStudentFromAdmission: async (admissionId: number, additionalData: Partial<Student> = {}) => {
    console.log(`Creating student from admission ${admissionId}`);
    
    // First get the admission details
    const admission = await admissionService.getApplicationById(admissionId);
    
    if (!admission) {
      throw new Error(`Admission record ${admissionId} not found`);    }
    
    if (admission.status !== 'APPROVED') {
      throw new Error(`Cannot create student from admission with status ${admission.status}`);
    }
    
    // Prepare student data from admission
    const studentData: Partial<Student> = {
      studentId: `STU${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`,
      name: admission.studentName,
      email: admission.email,
      phoneNumber: admission.contactNumber,
      dateOfBirth: admission.dateOfBirth,
      grade: String(parseInt(admission.gradeApplying, 10)),
      section: additionalData.section as string || 'A',
      address: admission.address || '',
      parentName: admission.parentName,
      parentPhone: admission.contactNumber,
      parentEmail: admission.email,
      status: 'ACTIVE',
      admissionDate: new Date().toISOString().split('T')[0],
      gender: additionalData.gender as string || 'MALE',
      bloodGroup: admission.bloodGroup || '',  // Include the bloodGroup field
      medicalConditions: admission.medicalConditions || '',  // Include the medicalConditions field
      ...additionalData
    };
    
    return studentData;
  },

  /**
   * Check if an admission has already been converted to a student
   * @param id The admission ID to check
   */
  hasStudentRecord: async (id: number) => {
    try {
      const response = await api.get<{hasStudent: boolean}>(`/api/admissions/${id}/student-status`);
      return response && response.hasStudent;
    } catch (error) {
      console.warn(`Error checking if admission ${id} has student record:`, error);
      return false;
    }
  },

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
        getAllApplications: '/api/admissions',
        getApplicationById: '/api/admissions/:id',
        createApplication: '/api/admissions',
        updateApplication: '/api/admissions/:id',
        updateStatus: '/api/admissions/:id/status',
        deleteApplication: '/api/admissions/:id',
        getByStatus: '/api/admissions/status/:status',
        searchApplications: '/api/admissions/search?query=:query',
        getByDateRange: '/api/admissions/date-range',
        getByGrade: '/api/admissions/grade/:grade',
        checkStudentStatus: '/api/admissions/:id/student-status'
      }
    };
  }
};

// Transformer function that maps backend response to frontend model
function transformResponseToApplication(response: BackendAdmissionResponse): AdmissionApplication {
  // For debugging
  console.log("Transforming response to application:", response);
  
  // Map status type ensuring it's one of the allowed values
  const allowedStatuses = [
    'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 
    'WAITLISTED', 'CANCELLED', 'ENROLLED'
  ];
  
  const status = response.status && allowedStatuses.includes(response.status) 
    ? response.status as AdmissionApplication['status'] 
    : 'PENDING';
    // Comprehensively map fields from backend to frontend
  return {
    id: response.id,
    studentName: response.applicantName,
    dateOfBirth: response.dateOfBirth,
    gradeApplying: response.gradeApplying?.toString() || '',
    parentName: response.guardianName,
    contactNumber: response.contactNumber || response.guardianContact || '',
    email: response.email || response.guardianEmail || '',
    address: response.address || '', // Add address field handling
    status: status,
    submissionDate: response.applicationDate,
    rejectionReason: response.rejectionReason,
    // Additional Information fields
    bloodGroup: response.bloodGroup || '',
    medicalConditions: response.medicalConditions || '',
    previousSchool: response.previousSchool || '',
    previousGrade: response.previousGrade || '',
    previousPercentage: response.previousPercentage,
    documents: response.documents,
    documentsFormat: response.documentsFormat || ''
  };
}