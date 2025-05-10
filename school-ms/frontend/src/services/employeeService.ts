import api from './api';

export interface Employee {
  id?: number;
  name: string;
  email: string;
  phoneNumber: string;
  department: string;
  role: string;
  joiningDate: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export const employeeService = {
  createEmployee: (employee: Employee) =>
    api.post<Employee>('/employees', employee),

  updateEmployee: (id: number, employee: Employee) =>
    api.put<Employee>(`/employees/${id}`, employee),

  getEmployee: (id: number) =>
    api.get<Employee>(`/employees/${id}`),

  getAllEmployees: () =>
    api.get<Employee[]>('/employees'),

  getByDepartment: (department: string) =>
    api.get<Employee[]>(`/employees/department/${department}`),

  getByRole: (role: string) =>
    api.get<Employee[]>(`/employees/role/${role}`),

  deleteEmployee: (id: number) =>
    api.delete(`/employees/${id}`),

  bulkCreateEmployees: (employees: Employee[]) =>
    api.post<Employee[]>('/employees/bulk', employees),
    
  updateEmploymentStatus: async (id: number, status: 'ACTIVE' | 'INACTIVE') => {
    const startTime = new Date().toISOString();
    console.group(`Employee Status Update Request - ${startTime}`);
    console.log('Updating employee status:', { employeeId: id, newStatus: status, timestamp: startTime });
    
    // Get current user roles from token for debugging
    const token = localStorage.getItem('token');
    let userRoles = 'unknown';
    let tokenExpiration = 'unknown';
    let tokenIssued = 'unknown';
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userRoles = payload.roles || payload.authorities || payload.role || 'Not found in token';
        tokenExpiration = payload.exp ? new Date(payload.exp * 1000).toISOString() : 'unknown';
        tokenIssued = payload.iat ? new Date(payload.iat * 1000).toISOString() : 'unknown';
        
        console.log('Current user permissions:', { 
          roles: userRoles,
          username: payload.sub || payload.username || 'unknown',
          tokenExpiration,
          tokenIssued,
          hasAdmin: Array.isArray(userRoles) ? userRoles.includes('ADMIN') : userRoles.includes('ADMIN'),
          hasHrManager: Array.isArray(userRoles) ? userRoles.includes('HR_MANAGER') : userRoles.includes('HR_MANAGER')
        });
      } catch (e) {
        console.error('Failed to decode token for role check:', e);
      }
    }

    // Extra headers to help diagnose the issue
    const customHeaders = {
      'X-Request-ID': `emp-status-${id}-${Date.now()}`,
      'X-User-Roles': typeof userRoles === 'string' ? userRoles : JSON.stringify(userRoles),
      'X-Client-Time': new Date().toISOString()
    };

    try {
      // Store information about this request in case it fails
      localStorage.setItem('last_status_update_attempt', JSON.stringify({
        employeeId: id,
        newStatus: status,
        timestamp: startTime,
        userRoles
      }));
      
      const response = await api.patch(
        `/employees/${id}/status`,
        { status },
        { headers: customHeaders }
      );
      
      console.log('Status update successful:', { 
        employeeId: id, 
        newStatus: status, 
        responseStatus: response.status,
        responseData: response.data
      });
      console.groupEnd();
      return response.data;
    } catch (error) {
      console.error('Status update failed:', { 
        employeeId: id, 
        newStatus: status, 
        error: error.message, 
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        requestHeaders: error.config?.headers
      });
      
      // Detailed error analysis
      if (error.response?.status === 403) {
        console.error('Permission denied (403) analysis:', {
          userRoles,
          tokenExpiration,
          tokenIssued,
          now: new Date().toISOString(),
          tokenExpired: tokenExpiration !== 'unknown' && new Date(tokenExpiration) < new Date()
        });
      }
      
      // Store detailed information about the failed request
      localStorage.setItem('last_status_update_error', JSON.stringify({
        employeeId: id,
        newStatus: status,
        errorTime: new Date().toISOString(),
        errorStatus: error.status || 'unknown',
        errorMessage: error.message || 'No message',
        userRoles
      }));
      
      console.groupEnd();
      throw error;
    }
  }
};